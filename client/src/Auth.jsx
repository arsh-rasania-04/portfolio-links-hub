import React, { useState } from 'react';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NEW: Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // NEW: Quick client-side validation for Signup
    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true); // Start loading spinner/text

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
    } finally {
      setIsLoading(false); // Stop loading whether it succeeded or failed
    }
  };

  // Common input styling to match App.jsx perfectly
  const inputStyles = {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #3f3f3f',
    backgroundColor: '#262626',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
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
        padding: '40px 30px',
        backgroundColor: '#1e1e1e',
        borderRadius: '16px', // Rounded edges to match dashboard
        border: '1px solid #333',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)', // Sleek shadow
        boxSizing: 'border-box',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', letterSpacing: '1px', fontWeight: '800', color: 'white' }}>
            LINKHUB
          </h1>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: isLogin ? '#4ade80' : '#60a5fa', fontWeight: '600' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ color: '#ff8a8a', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyles}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyles}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isLogin ? '#4ade80' : '#60a5fa',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        {/* Toggle Mode */}
        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#aaa' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span
            onClick={() => { 
              if (!isLoading) {
                setIsLogin(!isLogin); 
                setError(''); 
                setPassword(''); // Clear password field on toggle
              }
            }}
            style={{ color: isLogin ? '#60a5fa' : '#4ade80', cursor: isLoading ? 'default' : 'pointer', fontWeight: '600', transition: 'color 0.2s' }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>

      </div>
    </div>
  );
};

export default Auth;