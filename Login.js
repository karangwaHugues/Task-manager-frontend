import React, { useState } from 'react';
import { login, register } from '../api'; // Fixed path - assuming api.js is in src/ directory

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword || (!isLogin && !trimmedName)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = isLogin
        ? await login(trimmedEmail, trimmedPassword)
        : await register(trimmedEmail, trimmedPassword, trimmedName);
      
      // Handle different response structures
      const data = res.data || res;
      const { user, token } = data;

      if (!user || !token) {
        throw new Error('Invalid server response - missing user or token');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccessMsg(`Welcome ${user.name || user.email}! ${user.role ? `Role: ${user.role}` : ''}`);
      
      // Call onLogin with user and token
      if (onLogin) {
        onLogin(user, token);
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      // Handle different error structures
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    resetForm();
    setIsLogin(!isLogin);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form} noValidate>
      <h2 style={styles.header}>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {error && <div style={styles.error} role="alert">{error}</div>}
      {successMsg && <div style={styles.success} role="alert">{successMsg}</div>}

      {!isLogin && (
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={handleInputChange(setName)}
          style={styles.input}
          disabled={loading}
          required
          autoComplete="name"
          aria-label="Full Name"
          minLength={2}
        />
      )}

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={handleInputChange(setEmail)}
        style={styles.input}
        disabled={loading}
        required
        autoComplete="email"
        aria-label="Email Address"
      />

      <div style={styles.passwordContainer}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={handleInputChange(setPassword)}
          style={styles.passwordInput}
          disabled={loading}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={6}
          aria-label="Password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={styles.togglePassword}
          disabled={loading}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '👁️‍🗨️' : '👁️'}
        </button>
      </div>

      <button 
        type="submit" 
        style={{
          ...styles.button,
          backgroundColor: loading ? '#6c757d' : '#007bff',
          cursor: loading ? 'not-allowed' : 'pointer'
        }} 
        disabled={loading}
      >
        {loading ? (
          <>
            <span style={styles.spinner}>⏳</span> 
            {isLogin ? 'Logging in...' : 'Creating account...'}
          </>
        ) : (
          isLogin ? 'Login' : 'Create Account'
        )}
      </button>

      <p style={styles.toggleText}>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button
          type="button"
          onClick={toggleMode}
          style={styles.toggleButton}
          disabled={loading}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>

      <section style={styles.demoNote}>
        <strong>Demo Mode:</strong> Use any valid email format and password (min 6 chars) to {isLogin ? 'login' : 'sign up'}.
      </section>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e9ecef',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.8rem',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    marginBottom: '1rem',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    '&:focus': {
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)',
      outline: 'none',
    },
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: '1rem',
  },
  passwordInput: {
    width: '100%',
    padding: '0.875rem 3rem 0.875rem 1rem',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  button: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '0',
    marginLeft: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.3s ease',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#6c757d',
    fontSize: '0.95rem',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
    border: '1px solid #f5c6cb',
    fontSize: '0.9rem',
  },
  success: {
    color: '#155724',
    backgroundColor: '#d4edda',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
    border: '1px solid #c3e6cb',
    fontSize: '0.9rem',
  },
  togglePassword: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0.5rem',
    color: '#6c757d',
    transition: 'color 0.3s ease',
  },
  demoNote: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#6c757d',
    textAlign: 'center',
    border: '1px solid #e9ecef',
  },
  spinner: {
    display: 'inline-block',
    fontSize: '1rem',
  },
};

export default LoginForm;