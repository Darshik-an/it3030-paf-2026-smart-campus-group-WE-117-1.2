import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, Calendar, Wrench, Users, Shield, LogOut, 
  LayoutDashboard, ChevronRight, Clock, Bell, CheckCircle2, Menu, X
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Derive initial or name
  const getFirstName = () => {
    if (!user || (!user.name && !user.sub)) return 'Student';
    const nameStr = user.name || user.sub;
    return nameStr.split(' ')[0];
  };
  
  const getInitial = () => {
      const name = getFirstName();
      return name ? name.charAt(0).toUpperCase() : 'S';
  };

  const isAdmin = user?.role === 'ADMIN';
  const unreadCount = 0; // Replace with your real notifications context later

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-sans">
      
      {/* SIDEBAR */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <aside 
        className={`fixed lg:relative flex col w-72 h-full bg-[#003049] text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex-col`}
      >
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FCBF49] rounded-2xl flex items-center justify-center text-[#003049] font-black text-2xl shadow-inner">SC</div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-none">SmartCampus</span>
              <span className="text-xs font-bold text-[#FCBF49] tracking-widest uppercase">Hub</span>
            </div>
          </div>
          <button 
            className="lg:hidden text-white/50 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#F77F00] text-white font-bold shadow-lg shadow-[#F77F00]/20 transition-all text-left">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard Overview</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-left font-semibold">
              <Building className="w-5 h-5" />
              <span>{isAdmin ? 'Manage Facilities' : 'Browse Facilities'}</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-left font-semibold">
              <Calendar className="w-5 h-5" />
              <span>{isAdmin ? 'All Bookings' : 'My Bookings'}</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-left font-semibold">
              <Wrench className="w-5 h-5" />
              <span>{isAdmin ? 'Incident Tickets' : 'Report Issue'}</span>
            </button>
          </nav>
        </div>

        {/* Role-Based Authorization Menu Items */}
        {isAdmin && (
          <div className="px-6 mt-4">
            <p className="text-[10px] font-bold text-[#D62828] uppercase tracking-widest mb-3">Admin Controls</p>
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-4 p-4 rounded-xl text-white/60 hover:text-[#D62828] hover:bg-white/5 transition-all text-left font-semibold">
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
          <button onClick={logout} className="w-full flex items-center justify-center gap-3 text-white/50 hover:text-[#D62828] transition-colors text-sm font-bold p-4 rounded-xl hover:bg-[#D62828]/10 group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-24 flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-30 relative">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-[#003049] hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-black text-[#003049] hidden sm:block">Operations Center</h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 text-gray-400 hover:text-[#003049] transition-colors hover:bg-gray-50 rounded-full"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#D62828] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#003049] leading-tight">{user?.name}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isAdmin ? 'text-[#D62828]' : 'text-[#F77F00]'}`}>
                  {user?.role || 'STUDENT'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border-2 shadow-sm flex items-center justify-center overflow-hidden transition-transform hover:scale-105 cursor-pointer ${isAdmin ? 'border-[#D62828] bg-[#D62828]/10' : 'border-[#FCBF49] bg-[#FCBF49]/10 text-[#003049] font-bold'}`}>
                {user?.picture ? (
                  <img src={user.picture} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitial()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10">
          
          {/* Welcome Banner */}
          <section className="bg-[#003049] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-[#003049]/10 border border-[#003049]">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm mb-6">
                <span className="bg-[#FCBF49] w-2 h-2 rounded-full animate-pulse"></span>
                <span className="text-white text-xs font-bold uppercase tracking-widest">System Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">Hello, {getFirstName()}! 👋</h1>
              <p className="text-blue-100/80 text-base md:text-lg mb-8 leading-relaxed font-medium">
                {isAdmin 
                  ? "Here is your administrative overview of campus operations today. There are 3 pending bookings requiring your attention."
                  : "Welcome to your operations portal. You can book facilities, track your reservations, or report maintenance issues here."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#FCBF49] text-[#003049] px-6 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-[#000000]/10 active:scale-95 flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" /> {isAdmin ? 'Review Bookings' : 'Book a Facility'}
                </button>
                {!isAdmin && (
                  <button className="bg-white/10 text-white border border-white/20 px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <Wrench className="w-5 h-5" /> Report Issue
                  </button>
                )}
              </div>
            </div>
            {/* Background Orbs */}
            <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-[#D62828] opacity-20 rounded-full blur-[100px]"></div>
          </section>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard icon={<Building />} color="#003049" title="24" subtitle="Available Rooms" />
            <MetricCard icon={<Calendar />} color="#F77F00" title={isAdmin ? "12" : "2"} subtitle={isAdmin ? "Pending Approvals" : "My Active Bookings"} />
            <MetricCard icon={<Wrench />} color="#D62828" title={isAdmin ? "8" : "0"} subtitle={isAdmin ? "Open Tickets" : "My Open Tickets"} />
            <MetricCard icon={<CheckCircle2 />} color="#FCBF49" title="98%" subtitle="Resolution Rate" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Main Column */}
            <div className="xl:col-span-2 space-y-10">
              
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-[#003049]">{isAdmin ? 'Recent Booking Requests' : 'My Upcoming Bookings'}</h2>
                  <button className="text-sm font-bold text-[#F77F00] hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4"/></button>
                </div>
                
                <div className="space-y-4">
                  <ListItem 
                    title="Main Auditorium" desc="Oct 24, 10:00 AM - 12:00 PM" 
                    status={isAdmin ? "PENDING" : "APPROVED"} 
                    icon={<Building className="w-5 h-5" />} color="#003049" 
                  />
                  <ListItem 
                    title="Computer Lab 402" desc="Oct 25, 02:00 PM - 04:00 PM" 
                    status="PENDING" 
                    icon={<Building className="w-5 h-5" />} color="#F77F00" 
                  />
                </div>
              </div>

            </div>

            {/* Side Column */}
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-[#003049] mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-[#F77F00]" /> Quick Actions</h2>
                <div className="space-y-4">
                  <button className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#003049] hover:bg-gray-50 flex items-center gap-4 transition-all group font-bold text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-[#003049]/10 text-[#003049] flex items-center justify-center group-hover:scale-110 transition-transform"><Building className="w-5 h-5"/></div>
                    Find a Room
                  </button>
                  <button className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#D62828] hover:bg-gray-50 flex items-center gap-4 transition-all group font-bold text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-[#D62828]/10 text-[#D62828] flex items-center justify-center group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5"/></div>
                    Submit Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponents helper
const MetricCard = ({ icon, color, title, subtitle }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center gap-5 border border-gray-100 hover:-translate-y-1 transition-transform cursor-default">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-black text-[#003049] leading-tight">{title}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
  </div>
);

const ListItem = ({ title, desc, status, icon, color }) => {
  const getStatusColor = (s) => {
    switch(s) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-[#FCBF49]/20 text-[#D62828]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-[#003049]">{title}</h4>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(status)}`}>
        {status}
      </span>
    </div>
  );
};