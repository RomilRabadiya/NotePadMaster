import React from 'react';

export default function NoteList({ notes, onDelete, onEdit, theme = 'light' }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (notes.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem', 
        color: theme === 'dark' ? '#ccc' : '#666',
        backgroundColor: theme === 'dark' ? '#383838' : '#f8f9fa',
        borderRadius: '12px',
        border: theme === 'dark' ? '2px dashed #555' : '2px dashed #ddd'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <p style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>No notes yet!</p>
        <p style={{ margin: 0 }}>Click "New Note" to create your first note.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Your Notes ({notes.length})</h3>
      {notes.map(note => (
        <div key={note._id} style={{ 
          border: theme === 'dark' ? '1px solid #555' : '1px solid #ddd', 
          padding: '1.5rem', 
          margin: '1rem 0',
          borderRadius: '12px',
          backgroundColor: theme === 'dark' ? '#383838' : '#f9f9f9',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        className="card"
        onClick={() => onEdit && onEdit(note)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                color: theme === 'dark' ? 'white' : '#333',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {note.isFavorite && <span>⭐</span>}
                {note.isShared && <span>🔗</span>}
                {note.title}
              </h4>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onEdit && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(note);
                  }}
                  style={{ 
                    padding: '0.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                  title="Edit Note"
                >
                  ✏️
                </button>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note._id);
                }}
                style={{ 
                  padding: '0.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                title="Delete Note"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {note.content && (
            <p style={{ 
              margin: '0.5rem 0 1rem 0', 
              lineHeight: '1.6', 
              whiteSpace: 'pre-wrap',
              color: theme === 'dark' ? '#ccc' : '#555',
              maxHeight: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content}
            </p>
          )}
          
          {note.tags && note.tags.length > 0 && (
            <div style={{ margin: '0.5rem 0 1rem 0' }}>
              <strong style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>🏷️ Tags: </strong>
              {note.tags.map((tag, index) => (
                <span 
                  key={index}
                  style={{ 
                    display: 'inline-block',
                    backgroundColor: theme === 'dark' ? '#007bff' : '#e9ecef',
                    color: theme === 'dark' ? 'white' : '#495057',
                    padding: '0.25rem 0.75rem',
                    margin: '0 0.25rem 0.25rem 0',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div style={{ 
            fontSize: '0.75rem', 
            color: theme === 'dark' ? '#999' : '#666', 
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: theme === 'dark' ? '1px solid #555' : '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span>📅 Created: {formatDate(note.createdAt)}</span>
              {note.updatedAt !== note.createdAt && (
                <span style={{ marginLeft: '1rem' }}>✏️ Updated: {formatDate(note.updatedAt)}</span>
              )}
            </div>
            
            {(note.collaborators && note.collaborators.length > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>👥</span>
                <span>{note.collaborators.length + 1}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
