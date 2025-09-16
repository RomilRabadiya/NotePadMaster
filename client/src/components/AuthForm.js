import React, { useState } from 'react';

export default function AuthForm({ onSubmit, type }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (type === "register" && !formData.name) {
      alert('Please enter your name');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      if (type === "login") {
        // only send email + password for login
        await onSubmit({ email: formData.email, password: formData.password });
      } else {
        // send name + email + password for register
        await onSubmit(formData);
      }
    } catch (error) {
      // Error handling is done in parent components
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
      <form onSubmit={handleSubmit}>
        {type === "register" && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Name:</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Password:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange}
            style={inputStyle}
            required
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%',
            padding: '0.75rem',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '1rem'
          }}
        >
          {isLoading ? 'Processing...' : (type === "login" ? "Login" : "Register")}
        </button>
      </form>
    </div>
  );
}
