import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { useUser } from '../contexts/UserContext';
import API from '../api/api';

const AdvancedNoteEditor = ({ note, onSave, onClose }) => {
  const { socket, user, preferences, addNotification } = useUser();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [isLoading, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(note?.currentVersion || 0);
  const [isShared, setIsShared] = useState(note?.isShared || false);
  const [shareCode, setShareCode] = useState(note?.shareCode || '');
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const lastSavedRef = useRef({ title, content });

  // Join note room for collaboration
  useEffect(() => {
    if (socket && note && user) {
      socket.emit('join-note', {
        noteId: note._id,
        userId: user._id,
        userName: user.name
      });

      // Listen for real-time updates
      socket.on('note-updated', (data) => {
        if (data.userId !== user._id) {
          setContent(data.content);
          setTitle(data.title);
          addNotification(`${data.userName} updated the note`, 'info', 2000);
        }
      });

      // Listen for user join/leave events
      socket.on('user-joined', (data) => {
        addNotification(`${data.userName} joined the note`, 'info', 2000);
        setCollaborators(prev => [...prev, data]);
      });

      socket.on('user-left', (data) => {
        addNotification(`${data.userName} left the note`, 'info', 2000);
        setCollaborators(prev => prev.filter(c => c.socketId !== data.socketId));
      });

      socket.on('active-users', (users) => {
        setCollaborators(users);
      });

      return () => {
        socket.off('note-updated');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('active-users');
      };
    }
  }, [socket, note, user, addNotification]);

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce(async (noteData) => {
      if (!note || !user) return;
      
      try {
        await API.put(`/notes/${note._id}`, noteData);
        lastSavedRef.current = { title: noteData.title, content: noteData.content };
        
        // Emit real-time update to collaborators
        if (socket) {
          socket.emit('note-update', {
            noteId: note._id,
            content: noteData.content,
            title: noteData.title,
            userId: user._id,
            userName: user.name
          });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        addNotification('Auto-save failed', 'error', 3000);
      }
    }, preferences.autoSaveInterval * 1000),
    [note, socket, user, preferences.autoSaveInterval, addNotification]
  );

  // Trigger auto-save when content changes
  useEffect(() => {
    if (!preferences.autoSave) return;
    
    const hasChanged = title !== lastSavedRef.current.title || 
                      content !== lastSavedRef.current.content;
    
    if (hasChanged && (title.trim() || content.trim())) {
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      debouncedSave({ title, content, tags: tagsArray });
    }
  }, [title, content, tags, debouncedSave, preferences.autoSave]);

  // Undo/Redo functionality
  const saveToUndoStack = useCallback(() => {
    if (undoStack.length >= 50) {
      setUndoStack(prev => prev.slice(1));
    }
    setUndoStack(prev => [...prev, { title, content, timestamp: Date.now() }]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [title, content, undoStack.length]);

  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0) return;
    
    try {
      if (note) {
        await API.post(`/notes/${note._id}/undo`);
        const response = await API.get(`/notes/${note._id}`);
        const updatedNote = response.data.note;
        
        setTitle(updatedNote.title);
        setContent(updatedNote.content);
        setCurrentVersion(updatedNote.currentVersion);
        addNotification('Undone successfully', 'success', 2000);
      } else {
        // Local undo for new notes
        const lastState = undoStack[undoStack.length - 1];
        setRedoStack(prev => [...prev, { title, content }]);
        setTitle(lastState.title);
        setContent(lastState.content);
        setUndoStack(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('Undo failed:', error);
      addNotification('Undo failed', 'error');
    }
  }, [undoStack, note, title, content, addNotification]);

  const handleRedo = useCallback(async () => {
    if (redoStack.length === 0) return;
    
    try {
      if (note) {
        await API.post(`/notes/${note._id}/redo`);
        const response = await API.get(`/notes/${note._id}`);
        const updatedNote = response.data.note;
        
        setTitle(updatedNote.title);
        setContent(updatedNote.content);
        setCurrentVersion(updatedNote.currentVersion);
        addNotification('Redone successfully', 'success', 2000);
      } else {
        // Local redo for new notes
        const nextState = redoStack[redoStack.length - 1];
        setUndoStack(prev => [...prev, { title, content }]);
        setTitle(nextState.title);
        setContent(nextState.content);
        setRedoStack(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('Redo failed:', error);
      addNotification('Redo failed', 'error');
    }
  }, [redoStack, note, title, content, addNotification]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              handleRedo();
            } else {
              e.preventDefault();
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleSave = async () => {
    if (!title.trim()) {
      addNotification('Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      let savedNote;
      if (note) {
        // Save version before updating
        await API.post(`/notes/${note._id}/version`);
        const response = await API.put(`/notes/${note._id}`, noteData);
        savedNote = response.data.note;
      } else {
        const response = await API.post('/notes', noteData);
        savedNote = response.data.note;
      }

      onSave(savedNote);
      addNotification('Note saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      addNotification(error.response?.data?.message || 'Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!note) {
      addNotification('Save the note first before sharing', 'warning');
      return;
    }

    try {
      const response = await API.post(`/notes/${note._id}/share`, { expiresIn: 7 });
      setIsShared(true);
      setShareCode(response.data.shareCode);
      addNotification('Share code generated successfully', 'success');
    } catch (error) {
      console.error('Share failed:', error);
      addNotification('Failed to generate share code', 'error');
    }
  };

  const handleStopSharing = async () => {
    if (!note) return;

    try {
      await API.delete(`/notes/${note._id}/share`);
      setIsShared(false);
      setShareCode('');
      setCollaborators([]);
      addNotification('Note sharing stopped', 'success');
    } catch (error) {
      console.error('Stop sharing failed:', error);
      addNotification('Failed to stop sharing', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    if (!note) return;

    try {
      const response = await API.post(`/notes/${note._id}/favorite`);
      setIsFavorite(response.data.isFavorite);
      addNotification(
        response.data.isFavorite ? 'Added to favorites' : 'Removed from favorites',
        'success'
      );
    } catch (error) {
      console.error('Toggle favorite failed:', error);
      addNotification('Failed to update favorite status', 'error');
    }
  };

  const handleTitleChange = (e) => {
    if (e.target.value !== title) {
      saveToUndoStack();
    }
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    if (e.target.value !== content) {
      saveToUndoStack();
    }
    setContent(e.target.value);
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '900px',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 2rem',
          borderBottom: `1px solid ${preferences.theme === 'dark' ? '#444' : '#eee'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: preferences.theme === 'dark' ? '#333' : '#f8f9fa',
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ 
              margin: 0,
              color: preferences.theme === 'dark' ? 'white' : '#333'
            }}>
              {note ? 'Edit Note' : 'New Note'}
            </h2>
            
            {collaborators.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.875rem',
                  color: preferences.theme === 'dark' ? '#ccc' : '#666'
                }}>
                  {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
                </span>
                {collaborators.slice(0, 3).map(collaborator => (
                  <div
                    key={collaborator.socketId}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                    title={collaborator.userName}
                  >
                    {collaborator.userName.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Undo/Redo buttons */}
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo (Ctrl+Z)"
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed',
                opacity: undoStack.length > 0 ? 1 : 0.5
              }}
            >
              ↶
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Y)"
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: redoStack.length > 0 ? 'pointer' : 'not-allowed',
                opacity: redoStack.length > 0 ? 1 : 0.5
              }}
            >
              ↷
            </button>

            {/* Favorite button */}
            {note && (
              <button
                onClick={handleToggleFavorite}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: isFavorite ? '#ffc107' : '#666'
                }}
              >
                ★
              </button>
            )}

            {/* Share button */}
            <button
              onClick={isShared ? handleStopSharing : handleShare}
              disabled={!note}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isShared ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: note ? 'pointer' : 'not-allowed',
                opacity: note ? 1 : 0.5
              }}
            >
              {isShared ? 'Stop Sharing' : 'Share'}
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: preferences.theme === 'dark' ? 'white' : '#333'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Share code display */}
        {shareCode && (
          <div style={{
            padding: '1rem 2rem',
            backgroundColor: '#e9ecef',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Share Code:</strong> {shareCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(shareCode)}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Copy
            </button>
          </div>
        )}

        {/* Editor Content */}
        <div style={{ 
          flex: 1,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflow: 'auto'
        }}>
          {/* Title Input */}
          <input
            ref={titleRef}
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={handleTitleChange}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '2px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: preferences.theme === 'dark' ? '#444' : 'white',
              color: preferences.theme === 'dark' ? 'white' : '#333'
            }}
          />

          {/* Tags Input */}
          <input
            type="text"
            placeholder="Tags (comma-separated)..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              outline: 'none',
              backgroundColor: preferences.theme === 'dark' ? '#444' : 'white',
              color: preferences.theme === 'dark' ? 'white' : '#333'
            }}
          />

          {/* Content Editor */}
          <textarea
            ref={contentRef}
            placeholder="Start writing your note..."
            value={content}
            onChange={handleContentChange}
            style={{
              flex: 1,
              width: '100%',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: '1.6',
              backgroundColor: preferences.theme === 'dark' ? '#444' : 'white',
              color: preferences.theme === 'dark' ? 'white' : '#333'
            }}
          />

          {/* Footer with Save Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: `1px solid ${preferences.theme === 'dark' ? '#444' : '#eee'}`
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: preferences.theme === 'dark' ? '#ccc' : '#666'
            }}>
              {preferences.autoSave ? 
                'Auto-save enabled' : 
                'Remember to save your work'}
              {note && ` • Version ${currentVersion + 1}`}
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading || !title.trim()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: isLoading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading || !title.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedNoteEditor;
