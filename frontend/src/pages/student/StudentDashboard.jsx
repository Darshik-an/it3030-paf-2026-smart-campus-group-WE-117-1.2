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
import api from '../../services/api';
import { CalendarDays, Ticket, ChevronRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [latestBooking, setLatestBooking] = useState(null);
  const [latestTicket, setLatestTicket] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  
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

  useEffect(() => {
    if (activeTab !== 'dashboard') return undefined;
    let cancelled = false;

    const fetchLatest = async () => {
      if (!cancelled) setCardsLoading(true);
      try {
        const [bookingRes, ticketRes] = await Promise.all([
          api.get('/api/bookings'),
          api.get('/api/tickets')
        ]);
        if (cancelled) return;

        const bookings = Array.isArray(bookingRes.data) ? bookingRes.data : [];
        const tickets = Array.isArray(ticketRes.data) ? ticketRes.data : [];

        const sortedBookings = [...bookings].sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          if (aTime !== bTime) return bTime - aTime;
          return (b.id || 0) - (a.id || 0);
        });

        const sortedTickets = [...tickets].sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          if (aTime !== bTime) return bTime - aTime;
          return (b.id || 0) - (a.id || 0);
        });

        setLatestBooking(sortedBookings[0] || null);
        setLatestTicket(sortedTickets[0] || null);
      } catch (error) {
        if (!cancelled) {
          setLatestBooking(null);
          setLatestTicket(null);
        }
      } finally {
        if (!cancelled) setCardsLoading(false);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeTab]);

  const formatWhen = (value) => {
    if (!value) return 'Just now';
    const date = new Date(value);
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${Math.floor(diffHour / 24)}d ago`;
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
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#003049] text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-black tracking-tight">Latest Booking</h3>
                      <p className="text-xs text-blue-100">Auto refreshes every 15s</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {cardsLoading ? (
                    <p className="text-gray-400 font-medium">Loading latest booking...</p>
                  ) : latestBooking ? (
                    <>
                      <p className="text-lg font-black text-[#003049]">
                        {latestBooking.resourceName || latestBooking.resource?.name || 'Facility booking'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {latestBooking.bookingDate} • {latestBooking.startTime} - {latestBooking.endTime}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FCBF49]/20 text-[#F77F00]">
                          {latestBooking.status || 'PENDING'}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">{formatWhen(latestBooking.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard/bookings/my')}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#003049] hover:text-[#F77F00] transition-colors"
                      >
                        View all bookings <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[#003049] font-black">No bookings yet</p>
                      <p className="text-sm text-gray-500 mt-1">Create your first booking request now.</p>
                      <button
                        onClick={() => navigate('/dashboard/bookings/create')}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#003049] hover:text-[#F77F00] transition-colors"
                      >
                        Create booking <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </article>

              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-[#D62828] text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <Ticket className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-black tracking-tight">Latest Ticket</h3>
                      <p className="text-xs text-red-100">Auto refreshes every 15s</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {cardsLoading ? (
                    <p className="text-gray-400 font-medium">Loading latest ticket...</p>
                  ) : latestTicket ? (
                    <>
                      <p className="text-lg font-black text-[#003049]">
                        {latestTicket.resource || 'Support ticket'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {latestTicket.description || 'No description'}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#D62828]/10 text-[#D62828]">
                          {latestTicket.status || 'OPEN'}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">{formatWhen(latestTicket.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => navigate('/tickets')}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#003049] hover:text-[#D62828] transition-colors"
                      >
                        View all tickets <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[#003049] font-black">No tickets yet</p>
                      <p className="text-sm text-gray-500 mt-1">Need help? Create your first support ticket.</p>
                      <button
                        onClick={() => navigate('/tickets')}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#003049] hover:text-[#D62828] transition-colors"
                      >
                        Create ticket <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </article>
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
