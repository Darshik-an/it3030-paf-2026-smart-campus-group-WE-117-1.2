import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Wrench, Bell, CheckCircle2, Menu, X, Building2, Flag, Mail, Phone, MapPin, Clock3 } from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 10) {
        setShowNavbar(true);
      } else if (currentY > lastY) {
        setShowNavbar(false);
        setIsMobileMenuOpen(false);
      } else {
        setShowNavbar(true);
      }
      lastY = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#FCBF49] selection:text-[#003049] overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 bg-transparent py-4 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCBF49] rounded-xl flex items-center justify-center text-[#003049] font-black text-xl shadow-inner">SC</div>
            <span className="text-2xl font-black tracking-tight text-white">SmartCampus<span className="text-[#F77F00]">Hub</span></span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-white/90 font-semibold hover:text-[#FCBF49] transition-colors">Home</a>
            <a href="#about" className="text-white/90 font-semibold hover:text-[#FCBF49] transition-colors">About Us</a>
            <a href="#report" className="text-white/90 font-semibold hover:text-[#FCBF49] transition-colors">Report Us</a>
            <a href="#contact" className="text-white/90 font-semibold hover:text-[#FCBF49] transition-colors">Contact Us</a>
            <Link to="/login" className="text-white font-semibold hover:text-[#FCBF49] transition-colors">Log In</Link>
            <Link to="/signup" className="px-6 py-2.5 bg-[#F77F00] text-white rounded-xl font-bold hover:bg-[#e67600] transition-all shadow-lg shadow-[#F77F00]/20">Get Started</Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#003049] border-t border-white/10 shadow-2xl flex flex-col p-6 gap-6 z-50">
            <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold text-center text-lg hover:text-[#FCBF49] transition-colors p-2">Home</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold text-center text-lg hover:text-[#FCBF49] transition-colors p-2">About Us</a>
            <a href="#report" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold text-center text-lg hover:text-[#FCBF49] transition-colors p-2">Report Us</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold text-center text-lg hover:text-[#FCBF49] transition-colors p-2">Contact Us</a>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-semibold text-center text-lg hover:text-[#FCBF49] transition-colors p-2">Log In</Link>
            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center px-6 py-4 bg-[#F77F00] text-white rounded-xl font-bold hover:bg-[#e67600] transition-all shadow-lg shadow-[#F77F00]/20">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#003049] min-h-screen flex items-center">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#F77F00] opacity-20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D62828] opacity-20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Manage Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCBF49] to-[#F77F00]">Operations</span> Effortlessly
            </h1>

            <p className="text-xl text-blue-100/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              A unified platform to handle facility bookings, report maintenance incidents, and track real-time resolution statuses across the entire university.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-[#F77F00] text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-[#F77F00]/20 flex items-center justify-center gap-2 group">
                Access Student Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin-login" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2">
                Staff Login
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
      <section id="about" className="py-24 bg-white relative">
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

          <div className="mt-16 bg-[#f8f9fa] rounded-[2rem] p-8 md:p-10 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#003049]/10 text-[#003049] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#003049]">About SmartCampusHub</h3>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              SmartCampusHub is maintained by the Smart Campus Operations Team to centralize facility booking,
              support ticketing, and campus notifications in one place. Our goal is to reduce response times,
              improve transparency, and make daily campus operations easier for students and staff.
            </p>
          </div>
        </div>
      </section>

      {/* Report Section */}
      <section id="report" className="py-24 bg-[#f8f9fa] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl font-black text-[#003049] tracking-tight mb-4">Report Us</h2>
            <p className="text-lg text-gray-500 font-medium">
              Found a system issue, security concern, or incorrect booking/ticket behavior? Reach our support desk quickly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#D62828]/10 text-[#D62828] flex items-center justify-center mb-4">
                <Flag className="w-6 h-6" />
              </div>
              <h3 className="font-black text-[#003049] text-xl mb-2">Platform Bugs</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Report broken forms, login issues, missing data, notification failures, and dashboard errors.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F77F00]/10 text-[#F77F00] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-black text-[#003049] text-xl mb-2">Email Reporting</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Send details and screenshots to <span className="text-[#003049] font-bold">support@smartcampushub.edu</span>.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#003049]/10 text-[#003049] flex items-center justify-center mb-4">
                <Clock3 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-[#003049] text-xl mb-2">Response SLA</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Critical issues: within 2 hours. Normal issues: within 1 business day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl font-black text-[#003049] tracking-tight mb-4">Contact Us</h2>
            <p className="text-lg text-gray-500 font-medium">
              Reach the Campus Digital Operations Office for account, booking, and platform support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#f8f9fa] rounded-2xl border border-gray-100 p-6">
              <MapPin className="w-6 h-6 text-[#003049] mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Office</p>
              <p className="text-[#003049] font-bold leading-relaxed">Digital Operations Unit<br />Admin Building, Level 2</p>
            </div>
            <div className="bg-[#f8f9fa] rounded-2xl border border-gray-100 p-6">
              <Phone className="w-6 h-6 text-[#D62828] mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Hotline</p>
              <p className="text-[#003049] font-bold">+94 11 234 5678</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Mon–Fri, 8:30 AM – 5:00 PM</p>
            </div>
            <div className="bg-[#f8f9fa] rounded-2xl border border-gray-100 p-6">
              <Mail className="w-6 h-6 text-[#F77F00] mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email</p>
              <p className="text-[#003049] font-bold">support@smartcampushub.edu</p>
              <p className="text-xs text-gray-500 font-medium mt-1">General support & incident reporting</p>
            </div>
            <div className="bg-[#f8f9fa] rounded-2xl border border-gray-100 p-6">
              <Clock3 className="w-6 h-6 text-[#003049] mb-3" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Support Hours</p>
              <p className="text-[#003049] font-bold">24/7 Monitoring</p>
              <p className="text-xs text-gray-500 font-medium mt-1">After-hours incidents are queued for urgent triage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003049] text-white/70 relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F77F00] opacity-[0.04] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FCBF49] opacity-[0.04] rounded-full blur-[100px] pointer-events-none"></div>

        {/* Upper Footer — Main Link Columns */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 border-b border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {/* Column 1 — Platform */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">Platform</h4>
              <ul className="space-y-3">
                {['Facility Booking', 'Incident Tickets', 'Maintenance Requests', 'Notifications Center', 'Event Scheduling', 'Room Availability', 'Task Planner', 'Resource Calendar'].map((item) => (
                  <li key={item}>
                    <a href="#about" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Student Services */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">Student Services</h4>
              <ul className="space-y-3">
                {['Student Dashboard', 'My Bookings', 'Support Tickets', 'Campus Map', 'Study Room Reservations', 'Equipment Loans', 'Lost & Found', 'Transport Info'].map((item) => (
                  <li key={item}>
                    <a href="#about" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">Resources</h4>
              <ul className="space-y-3">
                {['Knowledge Base', 'User Guides', 'API Documentation', 'System Status', 'FAQs', 'Video Tutorials', 'Release Notes', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <a href="#about" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Staff & Admin */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">Staff & Admin</h4>
              <ul className="space-y-3">
                {['Admin Dashboard', 'Approval Queue', 'Staff Management', 'Analytics & Reports', 'Role Permissions', 'Audit Logs', 'Bulk Operations', 'System Configuration'].map((item) => (
                  <li key={item}>
                    <a href="#about" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lower Footer — Brand + Secondary Columns */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {/* Brand Column */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">SmartCampusHub</h4>
              <ul className="space-y-3">
                {['About', 'What We Offer', 'Leadership', 'Careers', 'Partners', 'Campus News', 'Events', 'Social Impact'].map((item) => (
                  <li key={item}>
                    <a href="#about" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Column */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">Community</h4>
              <ul className="space-y-3">
                {['Student Forum', 'Staff Network', 'Beta Testers', 'Blog', 'Feedback Hub', 'Tech Talks'].map((item) => (
                  <li key={item}>
                    <a href="#about" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Column */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5">More</h4>
              <ul className="space-y-3">
                {['Press', 'Investors', 'Terms of Service', 'Privacy Policy', 'Help Center', 'Accessibility', 'Contact', 'Cookie Preferences'].map((item) => (
                  <li key={item}>
                    <a href="#contact" className="text-sm font-medium hover:text-[#FCBF49] transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA + Download Column */}
            <div className="space-y-6">
              {/* Logo & tagline */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#FCBF49] rounded-xl flex items-center justify-center text-[#003049] font-black text-lg shadow-inner">SC</div>
                  <span className="text-xl font-black text-white tracking-tight">Smart<span className="text-[#F77F00]">Campus</span></span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-medium">Unified campus operations for students, staff, and administrators.</p>
              </div>

              {/* Download-style badges */}
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-3 transition-all group">
                  <div className="text-[#FCBF49]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Download on the</p>
                    <p className="text-sm text-white font-bold -mt-0.5">App Store</p>
                  </div>
                </a>

                <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-3 transition-all group">
                  <div className="text-[#FCBF49]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Get it on</p>
                    <p className="text-sm text-white font-bold -mt-0.5">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40 font-medium">© 2026 SmartCampusHub — PAF Group WE-117-1.2. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-white/40 hover:text-[#FCBF49] transition-colors font-medium">Privacy</a>
              <a href="#" className="text-xs text-white/40 hover:text-[#FCBF49] transition-colors font-medium">Terms</a>
              <a href="#" className="text-xs text-white/40 hover:text-[#FCBF49] transition-colors font-medium">Cookies</a>
              <a href="#" className="text-xs text-white/40 hover:text-[#FCBF49] transition-colors font-medium">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}