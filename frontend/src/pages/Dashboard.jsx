import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building, Calendar, Wrench, Users, Shield, LogOut,
  LayoutDashboard, Menu, X, Settings, UserCircle
} from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel';
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

  const SidebarContent = () => (
    <>
      <div className="p-8 flex items-center gap-4 border-b border-white/10 mb-4">
        <div className="w-12 h-12 bg-[#FCBF49] rounded-2xl flex items-center justify-center text-[#003049] font-black text-2xl shadow-inner">SC</div>
        <div>
          <span className="text-xl font-black tracking-tight block leading-none">SmartCampus</span>
          <span className="text-xs font-bold text-[#FCBF49] tracking-widest uppercase">Hub</span>
        </div>
      </div>

      <div className="px-6 mb-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
        <nav className="space-y-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); setIsDesktopMenuOpen(false); }}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left font-bold ${activeTab === 'dashboard' ? 'bg-[#F77F00] text-white shadow-lg shadow-[#F77F00]/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-left font-semibold">
            <Building className="w-5 h-5" />
            <span>Facilities</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-left font-semibold">
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-left font-semibold">
            <Wrench className="w-5 h-5" />
            <span>Tickets</span>
          </button>
        </nav>
      </div>

      {isAdmin && (
        <div className="px-6 mt-4">
          <p className="text-[10px] font-bold text-[#D62828] uppercase tracking-widest mb-3">Admin Controls</p>
          <nav className="space-y-2">
            <button 
              onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); setIsDesktopMenuOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left font-bold ${activeTab === 'users' ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/20' : 'text-white/60 hover:text-[#D62828] hover:bg-white/5'}`}
            >
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-[#D62828] hover:bg-white/5 transition-all text-left font-semibold">
              <Shield className="w-5 h-5" />
              <span>System Settings</span>
            </button>
          </nav>
        </div>
      )}

      <div className="mt-auto p-6 border-t border-white/10">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 text-white/50 hover:text-[#D62828] transition-colors text-sm font-bold p-4 rounded-xl hover:bg-[#D62828]/10 group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-sans">

      {/* Overlay for Sidebar */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isMobileMenuOpen || isDesktopMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          setIsMobileMenuOpen(false);
          setIsDesktopMenuOpen(false);
        }}
      />

      {/* Sidebar */}
      <aside 
        onMouseEnter={() => setIsDesktopMenuOpen(true)}
        onMouseLeave={() => setIsDesktopMenuOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#003049] text-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen || isDesktopMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-10 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              onMouseEnter={() => window.innerWidth >= 1024 && setIsDesktopMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-[#003049] transition-transform hover:scale-105"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-black text-[#003049]">Operations Center</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <NotificationPanel />

            {/* User info */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4 md:pl-8">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#003049] leading-tight">{user?.name || 'User'}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isAdmin ? 'text-[#D62828]' : 'text-[#F77F00]'}`}>
                  {user?.role || 'USER'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center overflow-hidden ${isAdmin ? 'border-[#D62828] bg-[#D62828]/10' : 'border-[#FCBF49] bg-[#FCBF49]/10'}`}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-[#003049]">{getInitial()}</span>
                )}
              </div>
            </div>
          </div>
        </header>

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

              {/* Module Status Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#003049]">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-5 h-5 text-[#003049]" />
                    <h3 className="font-bold text-[#003049]">Facilities</h3>
                  </div>
                  <p className="text-sm text-gray-500">Browse and manage campus resources. Module by Darshikan.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#F77F00]">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#F77F00]" />
                    <h3 className="font-bold text-[#003049]">Bookings</h3>
                  </div>
                  <p className="text-sm text-gray-500">Request and track facility bookings. Module by Darsika.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#D62828]">
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-5 h-5 text-[#D62828]" />
                    <h3 className="font-bold text-[#003049]">Tickets</h3>
                  </div>
                  <p className="text-sm text-gray-500">Report and track maintenance issues. Module by Himansa.</p>
                </div>
              </div>

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
