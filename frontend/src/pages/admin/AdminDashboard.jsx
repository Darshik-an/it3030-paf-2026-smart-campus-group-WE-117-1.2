import { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, UserPlus } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import UserManagement from '../../features/auth/components/admin/UserManagement';
import ManageStaff from '../../features/auth/components/admin/ManageStaff';
import SystemSettings from '../../features/auth/components/admin/SystemSettings';
import { AdminBookings } from '../../features/bookings';
import TicketAdminDashboard from '../Ticketting/TicketAdminDashboard';
import TicketingTechnicionDashboard from '../Ticketting/TicketingTechnicionDashboard';
import TechniciansList from '../Ticketting/TechniciansList';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = user?.role === 'ADMIN';
  const isStudentSupport = user?.role === 'STUDENT_SUPPORT';
  const isTechnician = user?.role === 'TECHNICIAN';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'staff' : 'dashboard');
  
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setActiveTab(isAdmin ? 'staff' : 'dashboard');
    }
  }, [location.pathname, isAdmin]);

  const getFirstName = () => user?.name?.split(' ')[0] || 'Admin';

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
          {activeTab === 'dashboard' && !isStudentSupport && !isTechnician && (
            <section className="bg-[#003049] rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-[#003049]/10">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                  Admin Dashboard 👋
                </h1>
                <p className="text-blue-100/80 text-base md:text-lg mb-6 leading-relaxed font-medium">
                  Manage users, oversee system activity, and monitor support services.
                </p>
                <div className="flex flex-wrap gap-4">
                   <button onClick={() => navigate('/admin/staff')} className="bg-[#D62828] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2">
                     <UserPlus className="w-5 h-5" /> Manage Staff
                   </button>
                   <button onClick={() => navigate('/admin/users')} className="bg-white text-[#003049] border-2 border-[#003049] px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2">
                     <Users className="w-5 h-5" /> All Users
                   </button>
                </div>
              </div>
              <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[120px]"></div>
            </section>
          )}

          {activeTab === 'dashboard' && isStudentSupport && <TicketAdminDashboard />}
          {activeTab === 'dashboard' && isTechnician && <TicketingTechnicionDashboard />}
          
          {activeTab === 'staff' && isAdmin && <ManageStaff />}
          {activeTab === 'users' && isAdmin && <UserManagement />}
          {activeTab === 'settings' && isAdmin && <SystemSettings />}
          {activeTab === 'bookings' && isAdmin && <AdminBookings />}
          {activeTab === 'helpdesk-tickets' && <TechniciansList />}
        </div>
      </main>
    </div>
  );
}
