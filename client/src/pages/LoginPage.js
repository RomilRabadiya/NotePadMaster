import React from 'react';
import AuthForm from '../components/AuthForm';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { addNotification, refreshUser } = useUser();

  const handleLogin = async (data) => {
    try {
      console.log('Attempting login with:', data);
      const res = await API.post('/auth/login', data);
      
      // Store authentication data in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userId', res.data.user.id);
      
      console.log('Login successful:', res.data);
      
      // Refresh user context to load user data immediately
      await refreshUser();
      
      addNotification('Login successful! Welcome back.', 'success');
      
      // Navigate to home page
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      addNotification(errorMessage, 'error');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Notepad App</h1>
        <h2 style={{ color: '#666', fontWeight: 'normal' }}>Login to Your Account</h2>
      </div>
      
      <AuthForm onSubmit={handleLogin} type="login" />
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ color: '#666' }}>
          Don't have an account?{' '}
          <button 
            onClick={handleRegisterClick}
            style={{ 
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
