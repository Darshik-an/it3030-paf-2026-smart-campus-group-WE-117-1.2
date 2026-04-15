import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import UserManagement from '../components/admin/UserManagement';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'dashboard');
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getFirstName = () => {
    if (!user?.name) return 'User';
    return user.name.split(' ')[0];
  };

  const getInitial = () => {
    return getFirstName().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-sans">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDesktopMenuOpen={isDesktopMenuOpen}
        setIsDesktopMenuOpen={setIsDesktopMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Header */}
        <Navbar setIsMobileMenuOpen={setIsMobileMenuOpen} setIsDesktopMenuOpen={setIsDesktopMenuOpen} />

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Banner */}
              <section className="bg-[#003049] rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-[#003049]/10">
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                    Hello, {getFirstName()}! 👋
                  </h1>
                  <p className="text-blue-100/80 text-base md:text-lg mb-6 leading-relaxed font-medium">
                    {isAdmin
                      ? "Welcome to the admin dashboard. You can manage users, review system activity, and monitor notifications from here."
                      : "Welcome to your Smart Campus portal. Use the sidebar to navigate between Facilities, Bookings, and Tickets as they become available."}
                  </p>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-[#D62828] opacity-20 rounded-full blur-[100px]"></div>
              </section>

              {/* Admin Panel */}
              {isAdmin && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#D62828]">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-[#D62828]" />
                    <h3 className="text-xl font-black text-[#003049]">Admin Panel</h3>
                  </div>
                  <p className="text-gray-500 mb-4">Manage user accounts, assign roles, and configure system settings.</p>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                  >
                    <Users className="w-5 h-5" /> Manage Users
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && isAdmin && (
            <UserManagement />
          )}
        </div>
      </main>
    </div>
  );
}
