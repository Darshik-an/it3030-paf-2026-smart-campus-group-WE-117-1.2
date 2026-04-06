import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #003049 0%, #001524 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'white',
        padding: '48px 40px',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#003049',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
        }}>
          🏛️
        </div>
        <h1 style={{
          color: '#003049',
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: '700',
        }}>
          Smart Campus Hub
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '24px',
          fontSize: '15px',
          lineHeight: '1.5',
        }}>
          Sign in to your account
        </p>

        {error && <div style={{ color: '#D62828', marginBottom: '16px', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#F77F00'}
            onBlur={(e) => e.target.style.borderColor = '#ccc'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#F77F00'}
            onBlur={(e) => e.target.style.borderColor = '#ccc'}
          />
          <button
            type="submit"
            style={{
              padding: '14px',
              background: '#003049',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: '4px'
            }}
            onMouseOver={(e) => e.target.style.background = '#001524'}
            onMouseOut={(e) => e.target.style.background = '#003049'}
          >
            Sign In with Email
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#999' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: '500' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 28px',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            margin: '0 auto',
            width: '100%',
            transition: 'all 0.2s ease',
            color: '#333',
            marginBottom: '20px'
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = '#F77F00';
            e.target.style.boxShadow = '0 4px 12px rgba(247,127,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.boxShadow = 'none';
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            width="20"
            height="20"
          />
          Sign in with Google
        </button>

        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Don't have an account? <Link to="/signup" style={{ color: '#F77F00', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}