import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API from '../api/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
    autoSave: true,
    autoSaveInterval: 30,
    notificationsEnabled: true
  });
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socket) {
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [socket]);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await API.get('/auth/profile');
          setUser(response.data.user);
          setPreferences(prevPrefs => response.data.user.preferences || prevPrefs);
        } catch (error) {
          console.error('Failed to load user data:', error);
          // Token might be invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
        }
      }
      setIsLoading(false);
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Apply theme
  useEffect(() => {
    document.body.className = preferences.theme === 'dark' ? 'dark-theme' : 'light-theme';
    document.body.style.fontSize = preferences.fontSize === 'small' ? '14px' : 
                                  preferences.fontSize === 'large' ? '18px' : '16px';
  }, [preferences.theme, preferences.fontSize]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userEmail', userData.user.email);
    localStorage.setItem('userName', userData.user.name);
    localStorage.setItem('userId', userData.user.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await API.put('/auth/preferences', newPreferences);
      setPreferences(response.data.preferences);
      addNotification('Preferences updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      addNotification('Failed to update preferences', 'error');
    }
  };

  const addNotification = (message, type = 'info', duration = 5000) => {
    if (!preferences.notificationsEnabled) return;
    
    const id = Date.now().toString();
    const notification = { id, message, type, timestamp: new Date() };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await API.get('/auth/profile');
        setUser(response.data.user);
        setPreferences(prevPrefs => response.data.user.preferences || prevPrefs);
        return response.data.user;
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        // Token might be invalid, clear it
        logout();
        throw error;
      }
    }
    return null;
  };

  const contextValue = {
    user,
    preferences,
    socket,
    notifications,
    isLoading,
    login,
    logout,
    updatePreferences,
    addNotification,
    removeNotification,
    refreshUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
