import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, UserPlus } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import UserManagement from '../features/auth/components/admin/UserManagement';
import ManageStaff from '../features/auth/components/admin/ManageStaff';
import SystemSettings from '../features/auth/components/admin/SystemSettings';
import {
  BookingsDashboard,
  CreateBooking,
  MyBookings,
  BookingDetails,
  AdminBookings
} from '../features/bookings';
import TicketAdminDashboard from './Ticketting/TicketAdminDashboard';
import TicketingTechnicionDashboard from './Ticketting/TicketingTechnicionDashboard';
import TechniciansList from './Ticketting/TechniciansList';
import Resources from './Resources';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const isStudentSupport = user?.role === 'STUDENT_SUPPORT';
  const isTechnician = user?.role === 'TECHNICIAN';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'staff' : 'dashboard');
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/bookings')) {
      setActiveTab('bookings');
      return;
    }
    if (location.pathname.startsWith('/dashboard/facilities')) {
      setActiveTab('facilities');
      return;
    }
    if (location.pathname === '/dashboard') {
      setActiveTab(isAdmin ? 'staff' : 'dashboard');
    }
  }, [location.pathname, isAdmin]);

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

  const renderBookingContent = () => {
    const isBookingRoute = location.pathname.startsWith('/dashboard/bookings');
    if (!isBookingRoute) return null;

    const path = location.pathname;
    const pathSegment = path.split('/').pop();

    // Specific route for booking details (numeric ID)
    const bookingDetailsMatch = path.match(/\/dashboard\/bookings\/(\d+)$/);
    if (bookingDetailsMatch) {
      const bookingId = Number(bookingDetailsMatch[1]);
      return <BookingDetails routeBookingId={bookingId} />;
    }

    if (isAdmin) {
      // For admins, show Booking Management by default for all booking sub-routes
      // unless it's a specific detail view handled above.
      return <AdminBookings />;
    }

    // Normal user routes
    if (path.endsWith('/create')) {
      return <CreateBooking />;
    }
    if (path.endsWith('/my')) {
      return <MyBookings />;
    }
    
    // Default dashboard view for users
    return <BookingsDashboard />;
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
          {activeTab === 'dashboard' && !isStudentSupport && !isTechnician && (
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
                  <p className="text-gray-500 mb-4">Provision staff accounts, manage user roles, and oversee system access.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('staff')}
                      className="bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#b01e1e] transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" /> Manage Staff
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-white text-[#003049] border-2 border-[#003049] px-6 py-3 rounded-xl font-bold hover:bg-[#003049] hover:text-white transition-all flex items-center gap-2"
                    >
                      <Users className="w-5 h-5" /> All Users
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'dashboard' && isStudentSupport && (
            <TicketAdminDashboard />
          )}

          {activeTab === 'dashboard' && isTechnician && (
            <TicketingTechnicionDashboard />
          )}

          {activeTab === 'staff' && isAdmin && (
            <ManageStaff />
          )}

          {activeTab === 'users' && isAdmin && (
            <UserManagement />
          )}

          {activeTab === 'settings' && isAdmin && (
            <SystemSettings />
          )}

          {activeTab === 'facilities' && (
            <div className="w-full">
              <Resources />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="w-full">
              {renderBookingContent()}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
              <h2 className="text-2xl font-black text-[#003049] mb-4">Support Tickets</h2>
              <p className="text-gray-500 max-w-md">
                Developer Note: The Tickets component from the tickets branch should be integrated here.
              </p>
            </div>
          )}

          {activeTab === 'asset-inventory' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
              <h2 className="text-2xl font-black text-[#003049] mb-4">Asset Inventory</h2>
              <p className="text-gray-500 max-w-md">Developer Note: Component placeholder for Facility Manager Asset tools.</p>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
              <h2 className="text-2xl font-black text-[#003049] mb-4">Maintenance Requests</h2>
              <p className="text-gray-500 max-w-md">Developer Note: Component placeholder for Facility Manager Maintenance.</p>
            </div>
          )}

          {activeTab === 'helpdesk-tickets' && (
            <TechniciansList />
          )}
        </div>
      </main>
    </div>
  );
}
