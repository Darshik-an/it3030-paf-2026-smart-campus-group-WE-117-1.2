import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    const lastRole = localStorage.getItem('lastRole');
    if (lastRole && lastRole !== 'USER') {
      return <Navigate to="/admin-login" />;
    }
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#f5f5f5',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <h1 style={{ color: '#D62828' }}>403 - Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}