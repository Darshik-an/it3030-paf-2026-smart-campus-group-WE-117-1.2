import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Calendar, Wrench, AlertCircle, MessageSquare, XCircle, CheckCircle2, CheckCheck, Settings, Mail } from 'lucide-react';

export default function NotificationPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const isMockMode = !localStorage.getItem('token') || localStorage.getItem('token') === 'dummy-token';

  const mockNotifications = [
    {
      id: 1,
      title: 'Booking Approved',
      message: 'Your facility booking for the main hall has been approved.',
      type: 'BOOKING_APPROVED',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 2,
      title: 'Ticket Updated',
      message: 'A technician has started working on your maintenance ticket.',
      type: 'TICKET_STATUS_CHANGED',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 3,
      title: 'System Maintenance',
      message: 'The Smart Campus Hub will be down for maintenance this Sunday from 2 AM to 4 AM.',
      type: 'GENERAL',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMockMode) {
      setNotifications(mockNotifications);
      setUnreadCount(3);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/unread/count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch unread count', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isMockMode]);

  useEffect(() => {
    if (isOpen && !isMockMode) {
      fetchNotifications();
    }
  }, [isOpen, isMockMode]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    if (isMockMode) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
      return;
    }
    
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (isMockMode) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return;
    }

    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED':
      case 'BOOKING_REJECTED':
      case 'BOOKING_CANCELLED':
        return <Calendar className="w-5 h-5" />;
      case 'TICKET_STATUS_CHANGED':
      case 'TICKET_ASSIGNED':
      case 'TICKET_COMMENT':
        return <Wrench className="w-5 h-5" />;
      case 'GENERAL':
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-400 hover:text-[#003049] transition-colors hover:bg-gray-50 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-[#D62828] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="bg-[#003049] p-4 flex items-center justify-between">
            <h3 className="font-bold text-white">Notifications</h3>
            <div className="flex items-center gap-1">
              <button 
                title="View Unread"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center relative"
              >
                <Mail className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#F77F00] rounded-full"></span>}
              </button>
              <button 
                onClick={handleMarkAllRead}
                title="Mark all as done"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                  unreadCount > 0 ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-white/30 cursor-not-allowed'
                }`}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button 
                title="Notification Settings"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-[#F77F00] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">You have no notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 relative ${
                      !notification.read ? 'bg-[#003049]/5' : ''
                    }`}
                  >
                    {!notification.read && (
                      <div className="absolute top-5 right-4 w-2 h-2 rounded-full bg-[#D62828]"></div>
                    )}
                    
                    <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type.includes('BOOKING') ? 'bg-[#FCBF49]/20 text-[#F77F00]' :
                      notification.type.includes('TICKET') ? 'bg-[#D62828]/10 text-[#D62828]' :
                      'bg-[#003049]/10 text-[#003049]'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 pr-6">
                      <p className={`text-sm ${!notification.read ? 'font-bold text-[#003049]' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <button className="text-xs font-bold text-[#003049] hover:text-[#F77F00] transition-colors uppercase tracking-widest">
              View All Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}