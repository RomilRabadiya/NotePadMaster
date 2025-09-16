import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import NoteList from '../components/NoteList';
import AdvancedNoteEditor from '../components/AdvancedNoteEditor';
import SettingsModal from '../components/SettingsModal';
import { useUser } from '../contexts/UserContext';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout, addNotification, preferences } = useUser();

  const handleLogout = () => {
    logout();
    addNotification('Logged out successfully', 'success');
    navigate('/login');
  };

  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (showFavoritesOnly) params.append('favorites', 'true');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const res = await API.get(`/notes?${params.toString()}`);
      setNotes(res.data.notes);
    } catch (err) {
      console.error('Error fetching notes:', err.response?.data || err.message);
      // If unauthorized, clear storage and redirect
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      addNotification('Failed to fetch notes', 'error');
    }
  }, [navigate, searchTerm, selectedTags, showFavoritesOnly, sortBy, sortOrder, logout, addNotification]);


  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n._id !== noteId));
      addNotification('Note deleted successfully', 'success');
    } catch (err) {
      console.error("Error deleting note:", err.response?.data || err.message);
      addNotification(err.response?.data?.message || 'Failed to delete note', 'error');
    }
  };

  // Additional functions for advanced features
  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleSaveNote = (savedNote) => {
    if (editingNote) {
      // Update existing note
      setNotes(notes.map(n => n._id === savedNote._id ? savedNote : n));
    } else {
      // Add new note
      setNotes([savedNote, ...notes]);
    }
    setShowEditor(false);
    setEditingNote(null);
    fetchNotes(); // Refresh the list
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleJoinSharedNote = async () => {
    if (!joinCode.trim()) {
      addNotification('Please enter a share code', 'warning');
      return;
    }

    try {
      await API.post('/notes/join', { shareCode: joinCode });
      addNotification('Successfully joined shared note!', 'success');
      setJoinCode('');
      fetchNotes();
    } catch (err) {
      console.error('Error joining shared note:', err.response?.data || err.message);
      addNotification(err.response?.data?.message || 'Failed to join shared note', 'error');
    }
  };

  // Get unique tags from all notes
  const availableTags = [...new Set(notes.flatMap(note => note.tags || []))];

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: preferences.theme === 'dark' ? '#1a1a1a' : '#f5f5f5', 
      padding: '1rem',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: preferences.theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
        color: preferences.theme === 'dark' ? 'white' : '#333',
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: "2rem", 
          padding: "1.5rem", 
          background: preferences.theme === 'dark' ? '#383838' : '#e9ecef', 
          borderRadius: "12px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: preferences.theme === 'dark' ? 'white' : '#333' }}>📝 Notepad App</h1>
            <span style={{ color: preferences.theme === 'dark' ? '#ccc' : '#666' }}>
              <strong>Welcome:</strong> {user.name} ({user.email})
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleNewNote}
              className="btn"
              style={{ 
                padding: "0.75rem 1.5rem", 
                backgroundColor: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              ✏️ New Note
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="btn"
              style={{ 
                padding: "0.75rem 1.5rem", 
                backgroundColor: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              ⚙️ Settings
            </button>
            
            <button 
              onClick={handleLogout} 
              className="btn"
              style={{ 
                padding: "0.75rem 1.5rem", 
                backgroundColor: "#dc3545", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: preferences.theme === 'dark' ? '#383838' : '#f8f9fa',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>🔍 Search Notes</label>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${preferences.theme === 'dark' ? '#555' : '#ddd'}`,
                borderRadius: '6px',
                backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
                color: preferences.theme === 'dark' ? 'white' : '#333'
              }}
            />
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>📅 Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${preferences.theme === 'dark' ? '#555' : '#ddd'}`,
                borderRadius: '6px',
                backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
                color: preferences.theme === 'dark' ? 'white' : '#333'
              }}
            >
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
              <option value="updated-desc">Recently Updated</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>

          {/* Favorites Filter */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              ⭐ Favorites Only
            </label>
          </div>

          {/* Join Shared Note */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Enter share code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `1px solid ${preferences.theme === 'dark' ? '#555' : '#ddd'}`,
                borderRadius: '6px',
                backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
                color: preferences.theme === 'dark' ? 'white' : '#333'
              }}
            />
            <button
              onClick={handleJoinSharedNote}
              className="btn"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              🔗 Join
            </button>
          </div>
        </div>

        {/* Notes Count and Stats */}
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: preferences.theme === 'dark' ? '#383838' : '#e9ecef',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>📊 Total Notes: {notes.length}</span>
            {availableTags.length > 0 && (
              <span style={{ marginLeft: '1rem', color: preferences.theme === 'dark' ? '#ccc' : '#666' }}>
                🏷️ Tags: {availableTags.length}
              </span>
            )}
          </div>
        </div>

        {/* Notes List */}
        <NoteList 
          notes={notes} 
          onDelete={deleteNote} 
          onEdit={handleEditNote}
          theme={preferences.theme}
        />
        
        {/* Advanced Note Editor Modal */}
        {showEditor && (
          <AdvancedNoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onClose={handleCloseEditor}
          />
        )}
        
        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
}
