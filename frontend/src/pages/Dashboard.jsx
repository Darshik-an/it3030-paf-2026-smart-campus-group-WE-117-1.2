import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: '#003049',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏛️</span>
          <h1 style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
          }}>
            Smart Campus Hub
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notification bell placeholder - will be built in prompt 4 */}
          <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.profilePicture && (
              <img
                src={user.profilePicture}
                alt=""
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid #FCBF49',
                }}
              />
            )}
            <span style={{ color: 'white', fontSize: '14px' }}>
              {user?.name}
            </span>
            <span style={{
              background: user?.role === 'ADMIN' ? '#D62828' : '#F77F00',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '6px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ color: '#003049', marginBottom: '24px' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>

        {/* Quick Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {[
            { title: 'Facilities', icon: '🏢', desc: 'Browse & manage resources', color: '#003049' },
            { title: 'Bookings', icon: '📅', desc: 'View & request bookings', color: '#F77F00' },
            { title: 'Tickets', icon: '🎫', desc: 'Report & track issues', color: '#D62828' },
            { title: 'Notifications', icon: '🔔', desc: 'Stay updated', color: '#FCBF49' },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${card.color}`,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
              <h3 style={{ margin: '0 0 4px', color: '#003049', fontSize: '18px' }}>
                {card.title}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Admin Section */}
        {user?.role === 'ADMIN' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderLeft: '4px solid #D62828',
          }}>
            <h3 style={{ color: '#D62828', margin: '0 0 8px' }}>🔧 Admin Panel</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
              Manage users, approve bookings, and assign technicians.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}