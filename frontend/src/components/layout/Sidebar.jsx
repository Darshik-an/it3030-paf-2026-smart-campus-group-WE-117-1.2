import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { 
  Building, Calendar, Wrench, Users, Shield, LogOut, 
  LayoutDashboard, X, UserPlus, FileText, ClipboardList, Briefcase, HeadphonesIcon 
} from 'lucide-react';

export default function Sidebar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  isDesktopMenuOpen, 
  setIsDesktopMenuOpen,
  activeTab,
  setActiveTab
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, tabName) => {
    if (tabName && activeTab) {
      return activeTab === tabName;
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path, tabName) => {
    if (setActiveTab && tabName) {
      setActiveTab(tabName);
    }
    navigate(path);
    setIsMobileMenuOpen(false);
    if (setIsDesktopMenuOpen) setIsDesktopMenuOpen(false);
  };

  const renderNavButton = (Icon, label, tabName) => {
    return (
      <button 
        key={tabName}
        onClick={() => handleNavigation('/dashboard', tabName)}
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left font-bold ${isActive('/dashboard', tabName) ? 'bg-[#F77F00] text-white shadow-lg shadow-[#F77F00]/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Overlay for Sidebar */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isMobileMenuOpen || isDesktopMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          setIsMobileMenuOpen(false);
          if (setIsDesktopMenuOpen) setIsDesktopMenuOpen(false);
        }}
      />

      {/* Sidebar */}
      <aside 
        onMouseEnter={() => setIsDesktopMenuOpen && setIsDesktopMenuOpen(true)}
        onMouseLeave={() => setIsDesktopMenuOpen && setIsDesktopMenuOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#003049] text-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen || isDesktopMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex items-center gap-4 border-b border-white/10 mb-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-12 h-12 bg-[#FCBF49] rounded-2xl flex items-center justify-center text-[#003049] font-black text-2xl shadow-inner">SC</div>
          <div>
            <span className="text-xl font-black tracking-tight block leading-none">SmartCampus</span>
            <span className="text-xs font-bold text-[#FCBF49] tracking-widest uppercase">Hub</span>
          </div>
        </div>

        <div className="px-6 mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
          <nav className="space-y-2">
            {renderNavButton(LayoutDashboard, 'Dashboard', 'dashboard')}

            {role === 'USER' || isAdmin ? (
              // Regular User and Admin Menu Items
              <>
                {renderNavButton(Building, 'Facilities', 'facilities')}
                {renderNavButton(Calendar, 'Bookings', 'bookings')}
                {renderNavButton(Wrench, 'Tickets', 'tickets')}
              </>
            ) : (
              // Staff Conditional Layouts
              <>
                {(role === 'LECTURER' || role === 'INSTRUCTOR') && (
                  <>
                    {renderNavButton(Calendar, 'My Bookings', 'my-bookings')}
                    {renderNavButton(Building, 'Facility Schedule', 'facility-schedule')}
                  </>
                )}
                {role === 'FACILITY_MANAGER' && (
                  <>
                    {renderNavButton(Briefcase, 'Asset Inventory', 'asset-inventory')}
                    {renderNavButton(Wrench, 'Maintenance', 'maintenance')}
                  </>
                )}
                {role === 'COORDINATOR' && (
                  <>
                    {renderNavButton(ClipboardList, 'Department Schedules', 'department-schedules')}
                    {renderNavButton(FileText, 'Approvals', 'approvals')}
                  </>
                )}
                {role === 'STUDENT_SUPPORT' && (
                  <>
                    {renderNavButton(HeadphonesIcon, 'Helpdesk Tickets', 'helpdesk-tickets')}
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {isAdmin && (
          <div className="px-6 mt-4">
            <p className="text-[10px] font-bold text-[#D62828] uppercase tracking-widest mb-3">Admin Controls</p>
            <nav className="space-y-2">
              <button
                onClick={() => handleNavigation('/dashboard', 'staff')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left font-bold ${isActive('/dashboard', 'staff') ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/20' : 'text-white/60 hover:text-[#D62828] hover:bg-white/5'}`}
              >
                <UserPlus className="w-5 h-5" />
                <span>Manage Staff</span>
              </button>
              <button
                onClick={() => handleNavigation('/dashboard', 'users')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left font-bold ${isActive('/dashboard', 'users') ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/20' : 'text-white/60 hover:text-[#D62828] hover:bg-white/5'}`}
              >
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </button>
              <button 
                onClick={() => handleNavigation('/dashboard', 'settings')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left font-bold ${isActive('/dashboard', 'settings') ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/20' : 'text-white/60 hover:text-[#D62828] hover:bg-white/5'}`}
              >
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
      </aside>
    </>
  );
}
