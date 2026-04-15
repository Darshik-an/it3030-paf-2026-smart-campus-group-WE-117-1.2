import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Settings, UserCircle, Shield, ChevronDown } from 'lucide-react';
import NotificationPanel from '../NotificationPanel';

export default function Navbar({ setIsMobileMenuOpen, setIsDesktopMenuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const getInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-10 flex-shrink-0 z-30">
      <div className="flex items-center gap-4">
        {setIsMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            onMouseEnter={() => window.innerWidth >= 1024 && setIsDesktopMenuOpen && setIsDesktopMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-[#003049] transition-transform hover:scale-105"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#003049]">
          SmartCampus<span className="text-[#F77F00]">Hub</span>
        </h2>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <NotificationPanel />

        {/* User info */}
        <div className="relative group cursor-pointer border-l border-gray-200 pl-4 md:pl-8">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#003049] leading-tight">{user?.name || 'User'}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isAdmin ? 'text-[#D62828]' : 'text-[#F77F00]'}`}>
                {user?.role === 'USER' ? 'STUDENT' : (user?.role || 'STUDENT')}
              </p>
            </div>
            <div 
              onClick={() => navigate('/profile')}
              className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform ${isAdmin ? 'border-[#D62828] bg-[#D62828]/10' : 'border-[#FCBF49] bg-[#FCBF49]/10'}`}
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-[#003049]">{getInitial()}</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#003049] transition-colors" />
          </div>

          {/* Profile Dropdown Menu */}
          <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
            {/* Arrow pointer */}
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
            
            <div className="p-4 border-b border-gray-100 flex flex-col items-center">
              <div 
                onClick={() => navigate('/profile')}
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center overflow-hidden mb-2 ${isAdmin ? 'border-[#D62828] bg-[#D62828]/10' : 'border-[#FCBF49] bg-[#FCBF49]/10'} hover:scale-105 transition-transform`}
              >
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-[#003049]">{getInitial()}</span>
                )}
              </div>
              <p className="text-sm font-bold text-[#003049]">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
            </div>
            
            <div className="py-2">
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-[#003049] hover:bg-gray-50 transition-colors">
                <UserCircle className="w-4 h-4" /> Profile
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-[#003049] hover:bg-gray-50 transition-colors">
                <Shield className="w-4 h-4" /> Change Password
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-[#003049] hover:bg-gray-50 transition-colors border-b border-gray-50">
                <Settings className="w-4 h-4" /> Settings
              </Link>
              
              <button onClick={handleLogout} className="w-full mt-1 flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#D62828] hover:bg-[#D62828]/10 transition-colors">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}