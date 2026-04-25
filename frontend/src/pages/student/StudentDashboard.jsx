import { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import {
  BookingsDashboard,
  CreateBooking,
  MyBookings,
  BookingDetails
} from '../../features/bookings';
import Resources from '../Resources';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const getFirstName = () => {
    if (!user?.name) return 'User';
    return user.name.split(' ')[0];
  };

  const renderBookingContent = () => {
    const isBookingRoute = location.pathname.startsWith('/dashboard/bookings');
    if (!isBookingRoute) return null;

    const path = location.pathname;
    
    const bookingDetailsMatch = path.match(/\/dashboard\/bookings\/(\d+)$/);
    if (bookingDetailsMatch) {
      const bookingId = Number(bookingDetailsMatch[1]);
      return <BookingDetails routeBookingId={bookingId} />;
    }

    if (path.endsWith('/create')) return <CreateBooking />;
    if (path.endsWith('/my')) return <MyBookings />;
    
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

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar setIsMobileMenuOpen={setIsMobileMenuOpen} setIsDesktopMenuOpen={setIsDesktopMenuOpen} />

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8">
          {activeTab === 'dashboard' && (
            <section className="bg-[#003049] rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-[#003049]/10">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                  Hello, {getFirstName()}! 👋
                </h1>
                <p className="text-blue-100/80 text-base md:text-lg mb-6 leading-relaxed font-medium">
                  Welcome back to your Smart Campus portal. Access your facilities, manage bookings, and track support tickets all in one place.
                </p>
              </div>
              <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-[#D62828] opacity-20 rounded-full blur-[100px]"></div>
            </section>
          )}

          {activeTab === 'facilities' && <Resources />}
          {activeTab === 'bookings' && renderBookingContent()}
          {activeTab === 'tickets' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[400px]">
              <h2 className="text-2xl font-black text-[#003049] mb-4">Support Tickets</h2>
              <p className="text-gray-500 max-w-md">Access your support tickets and track their status here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
