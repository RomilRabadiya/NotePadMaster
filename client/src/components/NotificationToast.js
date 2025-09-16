import React from 'react';
import { useUser } from '../contexts/UserContext';

const NotificationToast = () => {
  const { notifications, removeNotification } = useUser();

  const getNotificationStyle = (type) => {
    const baseStyle = {
      position: 'relative',
      padding: '1rem',
      marginBottom: '0.5rem',
      borderRadius: '8px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      cursor: 'pointer',
      animation: 'slideIn 0.3s ease-out'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: '#28a745' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#dc3545' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#ffc107', color: '#000' };
      case 'info':
      default:
        return { ...baseStyle, backgroundColor: '#007bff' };
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      maxWidth: '400px',
      width: '100%'
    }}>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification-close {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-close:hover {
          opacity: 0.7;
        }
      `}</style>
      
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={getNotificationStyle(notification.type)}
          onClick={() => removeNotification(notification.id)}
        >
          <div style={{ paddingRight: '2rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </div>
            <div>{notification.message}</div>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
