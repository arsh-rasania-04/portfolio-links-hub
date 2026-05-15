import React, { useState } from 'react';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const response = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Tell App.jsx that we successfully logged in
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#121212',
      fontFamily: 'sans-serif',
      color: 'white'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '30px',
        backgroundColor: '#1e1e1e',
        borderRadius: '12px',
        border: '1px solid #333',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: isLogin ? '#4ade80' : '#6e57e0' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: 'white' }}
          />
          <button type="submit" style={{
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isLogin ? '#4ade80' : '#6e57e0',
            color: isLogin ? 'black' : 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#aaa' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;