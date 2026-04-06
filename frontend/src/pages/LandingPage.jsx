import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Wrench, Bell, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#FCBF49] selection:text-[#003049] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#003049]/95 backdrop-blur-md py-4 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCBF49] rounded-xl flex items-center justify-center text-[#003049] font-black text-xl shadow-inner">SC</div>
            <span className="text-2xl font-black tracking-tight text-white">SmartCampus<span className="text-[#F77F00]">Hub</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/login" className="text-white font-semibold hover:text-[#FCBF49] transition-colors">Log In</Link>
            <Link to="/signup" className="px-6 py-2.5 bg-[#F77F00] text-white rounded-xl font-bold hover:bg-[#e67600] transition-all shadow-lg shadow-[#F77F00]/20">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#003049] min-h-screen flex items-center">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#F77F00] opacity-20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D62828] opacity-20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
              <span className="bg-[#FCBF49] w-2 h-2 rounded-full animate-ping"></span>
              <span className="text-white/90 text-xs font-bold uppercase tracking-widest">IT3030 PAF Assignment</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Manage Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCBF49] to-[#F77F00]">Operations</span> Effortlessly
            </h1>
            
            <p className="text-xl text-blue-100/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              A unified platform to handle facility bookings, report maintenance incidents, and track real-time resolution statuses across the entire university.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-[#F77F00] text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-[#F77F00]/20 flex items-center justify-center gap-2 group">
                Access Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2">
                Staff & Admin Login
              </Link>
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0 hidden md:block">
            {/* Abstract Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#D62828] rounded-3xl -rotate-12 z-0 opacity-80 animate-bounce" style={{ animationDuration: '4s' }}></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#FCBF49] rounded-full z-0 opacity-80 animate-bounce" style={{ animationDuration: '5s' }}></div>
            
            {/* Dashboard Mockup Component */}
            <div className="relative bg-[#f8f9fa] p-4 rounded-[2.5rem] border-4 border-white/20 backdrop-blur-sm shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200" 
                alt="Smart Campus Environment" 
                className="rounded-[2rem] shadow-inner w-full object-cover h-[400px]"
              />
              {/* Floating Notification */}
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 flex gap-4 items-center animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Notification</p>
                  <p className="text-sm font-bold text-[#003049]">Main Hall Booking Approved!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[#003049] tracking-tight mb-4">Everything you need to run your campus</h2>
            <p className="text-lg text-gray-500 font-medium">Smart Campus Hub integrates all major logistical operations into one seamless user experience for students, staff, and administrators.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className="bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-[#003049]/10 text-[#003049] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#003049] mb-3">Facility Bookings</h3>
                <p className="text-gray-500 leading-relaxed mb-6 gap-2">Reserve auditoriums, laboratories, and meeting rooms instantly. Admins can review and approve requests with one click.</p>
             </div>

             {/* Feature 2 */}
             <div className="bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-[#D62828]/10 text-[#D62828] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wrench className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#003049] mb-3">Incident Management</h3>
                <p className="text-gray-500 leading-relaxed mb-6 gap-2">Create support tickets for maintenance or IT issues. Track the resolution process from IN_PROGRESS to RESOLVED.</p>
             </div>

             {/* Feature 3 */}
             <div className="bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-[#F77F00]/10 text-[#F77F00] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#003049] mb-3">Real-time Notifications</h3>
                <p className="text-gray-500 leading-relaxed mb-6 gap-2">Never miss an update. Receive instant alerts on booking status changes, ticket updates, and campus-wide announcements.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-[#003049] text-white/60 py-8 border-t border-white/10 text-center text-sm font-medium">
          <p>© 2026 Smart Campus Hub. PAF Group WE-117-1.2.</p>
      </footer>
    </div>
  );
}