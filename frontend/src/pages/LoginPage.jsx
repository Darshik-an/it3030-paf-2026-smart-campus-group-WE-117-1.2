import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
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
          marginBottom: '32px',
          fontSize: '15px',
          lineHeight: '1.5',
        }}>
          Manage facilities, bookings & maintenance requests
        </p>
        <button
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
      </div>
    </div>
  );
}