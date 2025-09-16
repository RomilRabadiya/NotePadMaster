import React from 'react';
import AuthForm from '../components/AuthForm';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addNotification, refreshUser } = useUser();

  const handleRegister = async (data) => {
    try {
      console.log("Sending data to backend:", data);
      const res = await API.post('/auth/register', data);

      // Store authentication data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userId', res.data.user.id);

      console.log('Registration successful:', res.data);
      
      // Refresh user context to load user data immediately
      await refreshUser();
      
      addNotification('Account created successfully! Welcome to Notepad App.', 'success');
      
      // Navigate to home page
      navigate('/home', { replace: true });
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please check your information and try again.';
      addNotification(errorMessage, 'error');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Notepad App</h1>
        <h2 style={{ color: '#666', fontWeight: 'normal' }}>Create Your Account</h2>
      </div>
      
      <AuthForm onSubmit={handleRegister} type="register" />
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ color: '#666' }}>
          Already have an account?{' '}
          <button 
            onClick={handleLoginClick}
            style={{ 
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
