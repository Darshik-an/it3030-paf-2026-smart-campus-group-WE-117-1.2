import React, { useState } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Mail, Calendar, Shield, Clock, UserCircle, Key, Edit2, Trash2, X, Maximize2 } from 'lucide-react';
import AvatarUploader from '../features/auth/components/AvatarUploader';
import api from '../services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePicture = async () => {
    if (!user?.profilePicture) return;
    if (!window.confirm('Delete your profile picture?')) return;
    
    try {
      setIsDeleting(true);
      const response = await api.delete('/api/auth/profile/picture');
      setUser(response.data);
    } catch (err) {
      alert('Failed to delete picture');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans selection:bg-[#FCBF49] selection:text-[#003049] overflow-hidden">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDesktopMenuOpen={isDesktopMenuOpen}
        setIsDesktopMenuOpen={setIsDesktopMenuOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          setIsDesktopMenuOpen={setIsDesktopMenuOpen} 
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group/header">
              {/* Blobs */}
              <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-[#FCBF49]/20 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-[-50%] left-[-10%] w-[300px] h-[300px] bg-[#F77F00]/10 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Delete Icon */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 group/delete">
                <button className="bg-red-50 hover:bg-red-500 text-[#D62828] hover:text-white p-3 rounded-2xl transition-all shadow-sm">
                  <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-max bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover/delete:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                  Wanna delete your account?
                  <div className="absolute -top-1 right-5 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>

              {/* Avatar */}
              <div className="relative group/avatar">
                <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white shadow-xl shadow-gray-200 flex items-center justify-center overflow-hidden bg-[#003049]/5 flex-shrink-0 cursor-pointer group/avatar-main" onClick={() => user?.profilePicture && setShowLightbox(true)}>
                  {user?.profilePicture ? (
                    <div className="relative w-full h-full">
                      <img src={`http://localhost:8080${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover group-hover/avatar-main:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar-main:opacity-100 transition-opacity flex items-center justify-center">
                         <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-5xl font-black text-[#003049]">{getInitial()}</span>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 z-20 flex flex-col gap-2">
                  <button 
                    onClick={() => setShowUploader(true)}
                    className="bg-white p-2.5 rounded-2xl shadow-xl text-gray-500 hover:text-[#F77F00] transition-all border border-gray-100 hover:scale-110 active:scale-95"
                    title="Change Photo"
                  >
                    <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  {user?.profilePicture && (
                    <button 
                      onClick={handleDeletePicture}
                      disabled={isDeleting}
                      className="bg-white p-2.5 rounded-2xl shadow-xl text-gray-500 hover:text-red-500 transition-all border border-gray-100 hover:scale-110 active:scale-95 disabled:opacity-50"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Core Info */}
              <div className="relative z-10 text-center md:text-left flex-1 mt-2 group/info">
                <div className="inline-flex items-center px-3 py-1 bg-[#F77F00]/10 text-[#F77F00] rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                  {user?.role === 'USER' ? 'STUDENT' : (user?.role || 'STUDENT')}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 group/name cursor-pointer">
                  <h1 className="text-3xl md:text-4xl font-black text-[#003049] tracking-tight">{user?.name || 'User Name'}</h1>
                  <button className="text-gray-400 hover:text-[#F77F00] transition-colors opacity-0 group-hover/name:opacity-100 group-hover/info:opacity-100 md:opacity-0 focus:opacity-100">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-2 font-medium group/email cursor-pointer hover:text-gray-700 transition-colors w-fit mx-auto md:mx-0 pr-4">
                  <span>{user?.email || 'email@example.com'}</span>
                  <button className="text-gray-400 hover:text-[#F77F00] transition-colors opacity-0 group-hover/email:opacity-100 group-hover/info:opacity-100 md:opacity-0 focus:opacity-100 ml-1">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              {/* Account Card */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-shadow group flex flex-col">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#003049]/5 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <UserCircle className="w-6 h-6 text-[#003049]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#003049] mb-1">Account History</h3>
                  <p className="text-sm text-gray-500 font-medium">When you joined the Smart Campus</p>
                </div>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined On</p>
                      <p className="text-sm font-bold text-[#003049]">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Login</p>
                      <p className="text-sm font-bold text-[#003049]">{formatDateTime(user?.lastLoggedIn)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Card */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-shadow flex flex-col justify-between group">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#D62828]/5 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Key className="w-6 h-6 text-[#D62828]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#003049] mb-1">Authentication</h3>
                  <p className="text-sm text-gray-500 font-medium">Manage your security preferences</p>
                </div>
                
                <div className="space-y-3 mt-auto">
                  <button className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-[#003049] py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" /> Change Password
                  </button>
                  <button className="w-full bg-orange-50 border-2 border-[#F77F00]/20 hover:border-[#F77F00]/40 text-[#F77F00] py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" /> Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Uploader Modal */}
        {showUploader && (
          <AvatarUploader onClose={() => setShowUploader(false)} />
        )}

        {/* Lightbox / High-res Viewer */}
        {showLightbox && user?.profilePicture && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
            onClick={() => setShowLightbox(false)}
          >
            <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>
            <img 
              src={`http://localhost:8080${user.profilePicture}`} 
              alt="Profile" 
              className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain animate-in zoom-in duration-500" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </main>
    </div>
  );
}