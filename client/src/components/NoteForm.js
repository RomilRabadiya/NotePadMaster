import React, { useState } from 'react';

export default function NoteForm({ onAdd }) {
  const [note, setNote] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.title.trim()) {
      alert('Title is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await onAdd({ 
        title: note.title.trim(), 
        content: note.content, 
        tags: note.tags ? note.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      });
      
      // Reset form after successful creation
      setNote({ title: '', content: '', tags: '' });
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Add New Note</h3>
      <div style={{ marginBottom: '1rem' }}>
        <input 
          name="title" 
          placeholder="Note Title" 
          value={note.title}
          onChange={handleChange} 
          required 
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <textarea 
          name="content" 
          placeholder="Note Content" 
          value={note.content}
          onChange={handleChange}
          rows={4}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', resize: 'vertical' }}
        ></textarea>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input 
          name="tags" 
          placeholder="Tags (comma-separated)" 
          value={note.tags}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: isLoading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer' 
        }}
      >
        {isLoading ? 'Adding...' : 'Add Note'}
      </button>
    </form>
  );
}
