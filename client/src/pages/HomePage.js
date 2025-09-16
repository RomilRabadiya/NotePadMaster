import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import API from '../api/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout, addNotification, preferences } = useUser();
  const [stats, setStats] = useState({
    totalNotes: 0,
    recentNotes: [],
    favoriteNotes: [],
    sharedNotes: 0,
    totalTags: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all notes to calculate stats
        const notesResponse = await API.get('/notes?limit=100');
        const notes = notesResponse.data.notes || [];
        
        // Fetch recent notes (last 5)
        const recentResponse = await API.get('/notes?sortBy=created&sortOrder=desc&limit=5');
        const recentNotes = recentResponse.data.notes || [];
        
        // Fetch favorite notes
        const favoritesResponse = await API.get('/notes?favorites=true&limit=5');
        const favoriteNotes = favoritesResponse.data.notes || [];
        
        // Calculate stats
        const totalTags = [...new Set(notes.flatMap(note => note.tags || []))].length;
        const sharedNotes = notes.filter(note => note.isShared).length;
        
        setStats({
          totalNotes: notes.length,
          recentNotes,
          favoriteNotes,
          sharedNotes,
          totalTags
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        addNotification('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, addNotification]);

  const handleLogout = () => {
    logout();
    addNotification('Logged out successfully', 'success');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const QuickActionButton = ({ icon, title, description, onClick, color = '#007bff' }) => (
    <div
      onClick={onClick}
      style={{
        padding: '1.5rem',
        backgroundColor: preferences.theme === 'dark' ? '#383838' : 'white',
        border: preferences.theme === 'dark' ? '1px solid #555' : '1px solid #e9ecef',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      className="card"
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ 
        margin: '0 0 0.5rem 0', 
        color: preferences.theme === 'dark' ? 'white' : '#333',
        fontSize: '1.1rem'
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: 0, 
        color: preferences.theme === 'dark' ? '#ccc' : '#666',
        fontSize: '0.9rem'
      }}>
        {description}
      </p>
    </div>
  );

  const StatCard = ({ icon, title, value, color = '#007bff' }) => (
    <div style={{
      padding: '1.5rem',
      backgroundColor: preferences.theme === 'dark' ? '#383838' : 'white',
      border: preferences.theme === 'dark' ? '1px solid #555' : '1px solid #e9ecef',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '2rem', color, marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ 
        margin: '0 0 0.25rem 0', 
        fontSize: '2rem', 
        color: preferences.theme === 'dark' ? 'white' : '#333' 
      }}>
        {value}
      </h3>
      <p style={{ 
        margin: 0, 
        color: preferences.theme === 'dark' ? '#ccc' : '#666',
        fontSize: '0.9rem'
      }}>
        {title}
      </p>
    </div>
  );

  const NoteCard = ({ note, showType = false }) => (
    <div
      style={{
        padding: '1rem',
        backgroundColor: preferences.theme === 'dark' ? '#383838' : '#f8f9fa',
        border: preferences.theme === 'dark' ? '1px solid #555' : '1px solid #e9ecef',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      className="card"
      onClick={() => navigate('/notes')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: preferences.theme === 'dark' ? 'white' : '#333',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {note.isFavorite && <span>⭐</span>}
            {note.isShared && <span>🔗</span>}
            {note.title}
          </h4>
          {note.content && (
            <p style={{ 
              margin: '0 0 0.5rem 0', 
              color: preferences.theme === 'dark' ? '#ccc' : '#666',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>
              {note.content.substring(0, 100)}
              {note.content.length > 100 && '...'}
            </p>
          )}
          <div style={{ 
            fontSize: '0.75rem', 
            color: preferences.theme === 'dark' ? '#999' : '#999'
          }}>
            {formatDate(note.createdAt)}
            {showType && note.isFavorite && <span style={{ marginLeft: '0.5rem' }}>• Favorite</span>}
          </div>
        </div>
      </div>
    </div>
  );

  if (!user || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: preferences.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
      }}>
        <div className="pulse" style={{ 
          fontSize: '1.5rem',
          color: preferences.theme === 'dark' ? 'white' : '#333'
        }}>
          {isLoading ? 'Loading dashboard...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: preferences.theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 0.5rem 0', 
              color: preferences.theme === 'dark' ? 'white' : '#333',
              fontSize: '2.5rem'
            }}>
              📝 Welcome back, {user.name}!
            </h1>
            <p style={{ 
              margin: 0, 
              color: preferences.theme === 'dark' ? '#ccc' : '#666',
              fontSize: '1.1rem'
            }}>
              Here's an overview of your notes and activity
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/notes')}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📚 Go to Notes
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard icon="📄" title="Total Notes" value={stats.totalNotes} />
          <StatCard icon="⭐" title="Favorites" value={stats.favoriteNotes.length} color="#ffc107" />
          <StatCard icon="🔗" title="Shared Notes" value={stats.sharedNotes} color="#28a745" />
          <StatCard icon="🏷️" title="Tags Used" value={stats.totalTags} color="#6f42c1" />
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            color: preferences.theme === 'dark' ? 'white' : '#333'
          }}>
            🚀 Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <QuickActionButton
              icon="✏️"
              title="Create New Note"
              description="Start writing a new note"
              onClick={() => navigate('/notes')}
            />
            <QuickActionButton
              icon="🔍"
              title="Search Notes"
              description="Find your notes quickly"
              onClick={() => navigate('/notes')}
              color="#28a745"
            />
            <QuickActionButton
              icon="🔗"
              title="Join Shared Note"
              description="Collaborate with others"
              onClick={() => navigate('/notes')}
              color="#17a2b8"
            />
            <QuickActionButton
              icon="⚙️"
              title="Settings"
              description="Customize your experience"
              onClick={() => navigate('/notes')}
              color="#6c757d"
            />
          </div>
        </div>

        {/* Recent and Favorite Notes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Recent Notes */}
          <div style={{
            backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ 
                margin: 0, 
                color: preferences.theme === 'dark' ? 'white' : '#333'
              }}>
                📅 Recent Notes
              </h2>
              <button
                onClick={() => navigate('/notes')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#007bff',
                  border: '1px solid #007bff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                View All
              </button>
            </div>
            {stats.recentNotes.length > 0 ? (
              stats.recentNotes.map(note => (
                <NoteCard key={note._id} note={note} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: preferences.theme === 'dark' ? '#ccc' : '#666' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
                <p>No notes yet. Create your first note!</p>
              </div>
            )}
          </div>

          {/* Favorite Notes */}
          <div style={{
            backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ 
                margin: 0, 
                color: preferences.theme === 'dark' ? 'white' : '#333'
              }}>
                ⭐ Favorite Notes
              </h2>
              <button
                onClick={() => navigate('/notes?favorites=true')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#ffc107',
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                View All
              </button>
            </div>
            {stats.favoriteNotes.length > 0 ? (
              stats.favoriteNotes.map(note => (
                <NoteCard key={note._id} note={note} showType />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: preferences.theme === 'dark' ? '#ccc' : '#666' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
                <p>No favorite notes yet. Star some notes to see them here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
