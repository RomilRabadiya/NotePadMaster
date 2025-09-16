import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, user } = useUser();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [activeTab, setActiveTab] = useState('appearance');

  if (!isOpen) return null;

  const handleSave = async () => {
    await updatePreferences(localPreferences);
    onClose();
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
  };

  const tabStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : (preferences.theme === 'dark' ? '#ccc' : '#666'),
    border: '1px solid #007bff',
    borderRadius: '6px 6px 0 0',
    cursor: 'pointer',
    borderBottom: isActive ? 'none' : '1px solid #007bff'
  });

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${preferences.theme === 'dark' ? '#555' : '#ddd'}`,
    borderRadius: '6px',
    backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white',
    color: preferences.theme === 'dark' ? 'white' : '#333'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: preferences.theme === 'dark' ? 'white' : '#333'
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
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: `1px solid ${preferences.theme === 'dark' ? '#444' : '#eee'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: preferences.theme === 'dark' ? '#333' : '#f8f9fa'
        }}>
          <h2 style={{ margin: 0, color: preferences.theme === 'dark' ? 'white' : '#333' }}>
            ⚙️ Settings
          </h2>
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${preferences.theme === 'dark' ? '#444' : '#eee'}`,
          backgroundColor: preferences.theme === 'dark' ? '#333' : '#f8f9fa'
        }}>
          <button
            style={tabStyle(activeTab === 'appearance')}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 Appearance
          </button>
          <button
            style={tabStyle(activeTab === 'editor')}
            onClick={() => setActiveTab('editor')}
          >
            📝 Editor
          </button>
          <button
            style={tabStyle(activeTab === 'notifications')}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '2rem',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: preferences.theme === 'dark' ? '#2c2c2c' : 'white'
        }}>
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Theme</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="light"
                      checked={localPreferences.theme === 'light'}
                      onChange={(e) => setLocalPreferences({...localPreferences, theme: e.target.value})}
                    />
                    ☀️ Light
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="dark"
                      checked={localPreferences.theme === 'dark'}
                      onChange={(e) => setLocalPreferences({...localPreferences, theme: e.target.value})}
                    />
                    🌙 Dark
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Font Size</label>
                <select
                  value={localPreferences.fontSize}
                  onChange={(e) => setLocalPreferences({...localPreferences, fontSize: e.target.value})}
                  style={inputStyle}
                >
                  <option value="small">Small (14px)</option>
                  <option value="medium">Medium (16px)</option>
                  <option value="large">Large (18px)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={localPreferences.autoSave}
                    onChange={(e) => setLocalPreferences({...localPreferences, autoSave: e.target.checked})}
                  />
                  💾 Auto-save enabled
                </label>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.875rem', 
                  color: preferences.theme === 'dark' ? '#ccc' : '#666' 
                }}>
                  Automatically save your notes while typing
                </p>
              </div>

              {localPreferences.autoSave && (
                <div>
                  <label style={labelStyle}>Auto-save Interval (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={localPreferences.autoSaveInterval}
                    onChange={(e) => setLocalPreferences({...localPreferences, autoSaveInterval: parseInt(e.target.value)})}
                    style={inputStyle}
                  />
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    fontSize: '0.875rem', 
                    color: preferences.theme === 'dark' ? '#ccc' : '#666' 
                  }}>
                    How often to automatically save (10-300 seconds)
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={localPreferences.notificationsEnabled}
                    onChange={(e) => setLocalPreferences({...localPreferences, notificationsEnabled: e.target.checked})}
                  />
                  🔔 Enable Notifications
                </label>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.875rem', 
                  color: preferences.theme === 'dark' ? '#ccc' : '#666' 
                }}>
                  Show toast notifications for actions and collaboration events
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: `1px solid ${preferences.theme === 'dark' ? '#444' : '#eee'}`,
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: preferences.theme === 'dark' ? '#333' : '#f8f9fa'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: preferences.theme === 'dark' ? '#ccc' : '#666',
              border: `1px solid ${preferences.theme === 'dark' ? '#555' : '#ddd'}`,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: preferences.theme === 'dark' ? '#ccc' : '#666',
                border: `1px solid ${preferences.theme === 'dark' ? '#555' : '#ddd'}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
