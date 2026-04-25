import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Users, UserPlus, Wrench, Calendar, Building,
  AlertTriangle, ChevronRight, Clock, Activity, RefreshCw,
  Ticket, CheckCircle2, XCircle, BarChart3, TrendingUp,
  Zap, Eye, ArrowUpRight, CircleDot
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import UserManagement from '../../features/auth/components/admin/UserManagement';
import ManageStaff from '../../features/auth/components/admin/ManageStaff';
import SystemSettings from '../../features/auth/components/admin/SystemSettings';
import { AdminBookings } from '../../features/bookings';
import TicketAdminDashboard from '../Ticketting/TicketAdminDashboard';
import TicketingTechnicionDashboard from '../Ticketting/TicketingTechnicionDashboard';
import TechniciansList from '../Ticketting/TechniciansList';
import Resources from '../Resources';
import api from '../../services/api';

/* ─── helpers ──────────────────────────────────────────── */

const formatTimeAgo = (value) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
};

const priorityConfig = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  LOW:      { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
};

const statusConfig = {
  OPEN:        { bg: 'bg-orange-100', text: 'text-orange-700' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700' },
  RESOLVED:    { bg: 'bg-green-100', text: 'text-green-700' },
  CLOSED:      { bg: 'bg-gray-200', text: 'text-gray-600' },
  REJECTED:    { bg: 'bg-red-100', text: 'text-red-700' },
  PENDING:     { bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED:    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELLED:   { bg: 'bg-gray-200', text: 'text-gray-600' },
};

const resourceStatusConfig = {
  ACTIVE:         { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  OUT_OF_SERVICE: { bg: 'bg-red-100', text: 'text-red-600', label: 'Out of Service' },
};

const typeIcons = {
  LECTURE_HALL:  '🏛️',
  LAB:          '🔬',
  MEETING_ROOM: '🤝',
  EQUIPMENT:    '🖥️',
};

/* ─── sub-components ───────────────────────────────────── */

function StatCard({ icon: Icon, label, value, accent, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group text-left w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        {onClick && (
          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#F77F00] transition-colors" />
        )}
      </div>
      <p className="text-3xl font-black text-[#003049] tracking-tight">{value ?? '—'}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1 font-medium">{subtitle}</p>}
    </button>
  );
}

function Badge({ status, config }) {
  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-500' };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      {(status || '').replaceAll('_', ' ')}
    </span>
  );
}

function LiveIndicator({ lastRefreshed }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <span className="text-xs font-bold text-emerald-600">Live</span>
      {lastRefreshed && (
        <span className="text-[10px] text-gray-400 font-medium">
          Updated {formatTimeAgo(lastRefreshed)}
        </span>
      )}
    </div>
  );
}

function CriticalAlertBanner({ criticalTickets, navigate }) {
  if (!criticalTickets?.length) return null;
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 md:p-5 text-white shadow-lg shadow-red-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-black text-sm tracking-tight">
            {criticalTickets.length} Critical {criticalTickets.length === 1 ? 'Ticket' : 'Tickets'} Require Attention
          </p>
          <p className="text-red-100 text-xs font-medium mt-0.5">
            {criticalTickets.map(t => `#${t.id} — ${t.resource}`).join(' • ')}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-xs font-black bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all flex-shrink-0"
      >
        View Tickets
      </button>
    </div>
  );
}

function TicketDistributionBar({ tickets }) {
  const total = tickets.length || 1;
  const groups = [
    { key: 'OPEN', label: 'Open', color: 'bg-orange-400' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { key: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-500' },
    { key: 'CLOSED', label: 'Closed', color: 'bg-gray-400' },
    { key: 'REJECTED', label: 'Rejected', color: 'bg-red-400' },
  ];
  const counts = {};
  groups.forEach(g => { counts[g.key] = tickets.filter(t => t.status === g.key).length; });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-[#003049]" />
        <h3 className="font-black text-sm text-[#003049]">Ticket Distribution</h3>
      </div>
      {/* Bar */}
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
        {groups.map(g => {
          const pct = (counts[g.key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={g.key}
              className={`${g.color} transition-all duration-700`}
              style={{ width: `${pct}%` }}
              title={`${g.label}: ${counts[g.key]}`}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {groups.map(g => counts[g.key] > 0 && (
          <div key={g.key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${g.color}`} />
            <span className="text-[11px] text-gray-500 font-semibold">{g.label} ({counts[g.key]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline({ items }) {
  if (!items?.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#003049]" />
        <h3 className="font-black text-sm text-[#003049]">Recent Activity</h3>
      </div>
      <div className="space-y-0">
        {items.map((item, idx) => (
          <div key={`${item.type}-${item.id}`} className="flex gap-3 items-start">
            {/* timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                item.type === 'ticket' ? 'bg-[#D62828]' : 'bg-[#003049]'
              }`} />
              {idx < items.length - 1 && <div className="w-px flex-1 bg-gray-200 min-h-[28px]" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-bold text-[#003049]">
                {item.type === 'ticket' ? '🎫' : '📅'} {item.title}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {item.subtitle} • {formatTimeAgo(item.time)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────── */

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';
  const isStudentSupport = user?.role === 'STUDENT_SUPPORT';
  const isTechnician = user?.role === 'TECHNICIAN';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'dashboard');

  // Dashboard data
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    if (location.pathname === '/dashboard/facilities') {
      setActiveTab('facilities');
    } else if (location.pathname.startsWith('/dashboard/bookings')) {
      setActiveTab('bookings');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('dashboard');
    }
  }, [location.pathname, isAdmin]);

  /* ── Data fetching ── */
  const fetchDashboardData = useCallback(async () => {
    try {
      const promises = [];

      // Tickets — role-aware endpoint
      if (isTechnician) {
        promises.push(api.get('/api/tickets/technician').catch(() => ({ data: [] })));
      } else if (isAdmin || isStudentSupport) {
        promises.push(api.get('/api/tickets/manage').catch(() => ({ data: [] })));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // Bookings — admin gets all
      if (isAdmin) {
        promises.push(api.get('/api/bookings').catch(() => ({ data: [] })));
      } else {
        promises.push(api.get('/api/bookings').catch(() => ({ data: [] })));
      }

      // Resources
      promises.push(api.get('/api/resources').catch(() => ({ data: [] })));

      // Admin-only: users + staff
      if (isAdmin) {
        promises.push(api.get('/api/admin/users').catch(() => ({ data: [] })));
        promises.push(api.get('/api/admin/staff').catch(() => ({ data: [] })));
      } else {
        promises.push(Promise.resolve({ data: [] }));
        promises.push(Promise.resolve({ data: [] }));
      }

      const [ticketRes, bookingRes, resourceRes, userRes, staffRes] = await Promise.all(promises);

      setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : []);
      setResources(Array.isArray(resourceRes.data) ? resourceRes.data : []);
      setAllUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isStudentSupport, isTechnician]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    let cancelled = false;

    const run = async () => {
      if (!cancelled) setLoading(true);
      await fetchDashboardData();
    };

    run();
    const interval = setInterval(() => {
      if (!cancelled) fetchDashboardData();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeTab, fetchDashboardData]);

  /* ── Computed data ── */
  const sorted = useMemo(() => {
    const byCreated = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return {
      tickets: [...tickets].sort(byCreated).slice(0, 5),
      bookings: [...bookings].sort(byCreated).slice(0, 5),
      resources: [...resources].slice(0, 5),
    };
  }, [tickets, bookings, resources]);

  const stats = useMemo(() => {
    const studentUsers = allUsers.filter(u => u.role === 'USER').length;
    const staffCount = staff.length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const openTickets = tickets.filter(t => t.status === 'OPEN').length;
    const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedToday = tickets.filter(t => t.status === 'RESOLVED' && isToday(t.updatedAt)).length;
    const activeResources = resources.filter(r => r.status === 'ACTIVE').length;
    const totalResources = resources.length;
    const approvedBookings = bookings.filter(b => b.status === 'APPROVED').length;
    const criticalTickets = tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED');

    return {
      studentUsers, staffCount, pendingBookings, openTickets,
      inProgressTickets, resolvedToday, activeResources, totalResources,
      approvedBookings, criticalTickets, totalTickets: tickets.length,
      totalBookings: bookings.length,
    };
  }, [tickets, bookings, resources, allUsers, staff]);

  const activityItems = useMemo(() => {
    const items = [];
    tickets.forEach(t => {
      items.push({
        type: 'ticket',
        id: t.id,
        title: `Ticket #${t.id} — ${t.resource || 'Unknown'}`,
        subtitle: `${(t.status || '').replaceAll('_', ' ')} • ${t.priority || 'N/A'} priority`,
        time: t.createdAt,
      });
    });
    bookings.forEach(b => {
      items.push({
        type: 'booking',
        id: b.id,
        title: `Booking #${b.id} — ${b.resourceName || 'Facility'}`,
        subtitle: `${(b.status || '').replaceAll('_', ' ')} • ${b.bookingDate || ''}`,
        time: b.createdAt,
      });
    });
    return items.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 5);
  }, [tickets, bookings]);

  /* ── Render: Admin Overview ── */
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Live indicator + greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Here's what's happening across your campus today.
          </p>
        </div>
        <LiveIndicator lastRefreshed={lastRefreshed} />
      </div>

      {/* Critical alert banner */}
      <CriticalAlertBanner criticalTickets={stats.criticalTickets} navigate={navigate} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Users} label="Students" value={stats.studentUsers}
          accent="bg-[#003049]/10 text-[#003049]"
          subtitle={`${allUsers.length} total users`}
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          icon={UserPlus} label="Staff" value={stats.staffCount}
          accent="bg-[#D62828]/10 text-[#D62828]"
          subtitle="All roles"
          onClick={() => setActiveTab('staff')}
        />
        <StatCard
          icon={Calendar} label="Pending" value={stats.pendingBookings}
          accent="bg-[#F77F00]/10 text-[#F77F00]"
          subtitle={`${stats.totalBookings} total bookings`}
          onClick={() => setActiveTab('bookings')}
        />
        <StatCard
          icon={Ticket} label="Open Tickets" value={stats.openTickets}
          accent="bg-orange-100 text-orange-600"
          subtitle={`${stats.inProgressTickets} in progress`}
        />
        <StatCard
          icon={Building} label="Active Facilities" value={stats.activeResources}
          accent="bg-emerald-100 text-emerald-600"
          subtitle={`of ${stats.totalResources} total`}
          onClick={() => setActiveTab('facilities')}
        />
        <StatCard
          icon={CheckCircle2} label="Resolved Today" value={stats.resolvedToday}
          accent="bg-green-100 text-green-600"
          subtitle="Tickets closed today"
        />
      </div>

      {/* Ticket distribution */}
      {tickets.length > 0 && <TicketDistributionBar tickets={tickets} />}

      {/* Three column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest 5 tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#003049] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black tracking-tight">Latest Tickets</h3>
                <p className="text-xs text-blue-100/70">Last 5 support tickets</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-gray-400 font-medium text-sm">Loading tickets...</div>
            ) : sorted.tickets.length === 0 ? (
              <div className="p-6 text-gray-400 font-medium text-sm">No tickets found</div>
            ) : sorted.tickets.map(t => (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 cursor-pointer transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[t.priority]?.dot || 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#003049] truncate group-hover:text-[#F77F00] transition-colors">
                    #{t.id} — {t.resource || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 truncate font-medium mt-0.5">
                    {t.reporterName || t.reporterEmail || 'Unknown'} • {t.category}
                  </p>
                </div>
                <Badge status={t.priority} config={priorityConfig} />
                <Badge status={t.status} config={statusConfig} />
                <span className="text-[10px] text-gray-400 font-bold flex-shrink-0 hidden md:block">
                  {formatTimeAgo(t.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity timeline */}
        <ActivityTimeline items={activityItems} />
      </div>

      {/* Bookings + Facilities row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest 5 bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#F77F00] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black tracking-tight">Latest Bookings</h3>
                <p className="text-xs text-orange-100/70">Last 5 facility bookings</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-gray-400 font-medium text-sm">Loading bookings...</div>
            ) : sorted.bookings.length === 0 ? (
              <div className="p-6 text-gray-400 font-medium text-sm">No bookings found</div>
            ) : sorted.bookings.map(b => (
              <div key={b.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#003049]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-[#003049]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#003049] truncate">
                    {b.resourceName || 'Facility'} <span className="font-medium text-gray-400">#{b.id}</span>
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                    {b.userName || 'User'} • {b.bookingDate} • {b.startTime}–{b.endTime}
                  </p>
                </div>
                <Badge status={b.status} config={statusConfig} />
                <span className="text-[10px] text-gray-400 font-bold flex-shrink-0 hidden md:block">
                  {formatTimeAgo(b.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Facility availability */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#003049] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black tracking-tight">Facility Status</h3>
                <p className="text-xs text-blue-100/70">Latest 5 facilities</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('facilities')}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-gray-400 font-medium text-sm">Loading facilities...</div>
            ) : sorted.resources.length === 0 ? (
              <div className="p-6 text-gray-400 font-medium text-sm">No facilities found</div>
            ) : sorted.resources.map(r => {
              const sc = resourceStatusConfig[r.status] || resourceStatusConfig.ACTIVE;
              return (
                <div key={r.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-colors">
                  <span className="text-2xl flex-shrink-0">
                    {typeIcons[r.type] || '🏢'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#003049] truncate">{r.name}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                      {r.location || 'N/A'} • Capacity: {r.capacity || '—'} • {(r.type || '').replaceAll('_', ' ')}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Render: Student Support Overview ── */
  const renderSupportDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">
            Support Overview 🎧
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Ticket management and monitoring.
          </p>
        </div>
        <LiveIndicator lastRefreshed={lastRefreshed} />
      </div>

      <CriticalAlertBanner criticalTickets={stats.criticalTickets} navigate={navigate} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label="Open" value={stats.openTickets} accent="bg-orange-100 text-orange-600" />
        <StatCard icon={Clock} label="In Progress" value={stats.inProgressTickets} accent="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Resolved" value={tickets.filter(t => t.status === 'RESOLVED').length} accent="bg-green-100 text-green-600" />
        <StatCard icon={XCircle} label="Closed" value={tickets.filter(t => t.status === 'CLOSED').length} accent="bg-gray-200 text-gray-600" />
      </div>

      {tickets.length > 0 && <TicketDistributionBar tickets={tickets} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest 5 tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#D62828] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black tracking-tight">Latest Tickets</h3>
                <p className="text-xs text-red-100/70">Showing most recent 5</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-gray-400 font-medium text-sm">Loading...</div>
            ) : sorted.tickets.length === 0 ? (
              <div className="p-6 text-gray-400 font-medium text-sm">No tickets found</div>
            ) : sorted.tickets.map(t => (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 cursor-pointer transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[t.priority]?.dot || 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#003049] truncate group-hover:text-[#D62828] transition-colors">
                    #{t.id} — {t.resource || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 truncate font-medium mt-0.5">
                    {t.reporterName || t.reporterEmail || 'Unknown'} • {t.category}
                  </p>
                </div>
                <Badge status={t.priority} config={priorityConfig} />
                <Badge status={t.status} config={statusConfig} />
                <span className="text-[10px] text-gray-400 font-bold flex-shrink-0 hidden md:block">
                  {formatTimeAgo(t.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ActivityTimeline items={activityItems} />
      </div>

      {/* Latest bookings (read-only) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#F77F00] text-white px-6 py-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-black tracking-tight">Recent Bookings</h3>
            <p className="text-xs text-orange-100/70">Read-only overview</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-6 text-gray-400 font-medium text-sm">Loading...</div>
          ) : sorted.bookings.length === 0 ? (
            <div className="p-6 text-gray-400 font-medium text-sm">No bookings found</div>
          ) : sorted.bookings.map(b => (
            <div key={b.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#003049]/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-[#003049]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#003049] truncate">{b.resourceName || 'Facility'}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                  {b.userName || 'User'} • {b.bookingDate} • {b.startTime}–{b.endTime}
                </p>
              </div>
              <Badge status={b.status} config={statusConfig} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Render: Technician Overview ── */
  const renderTechnicianDashboard = () => {
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
    const total = tickets.length || 1;
    const resolutionRate = Math.round((resolved / total) * 100);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">
              My Assignments 🔧
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Tickets assigned to you for resolution.
            </p>
          </div>
          <LiveIndicator lastRefreshed={lastRefreshed} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Ticket} label="Total Assigned" value={tickets.length} accent="bg-[#003049]/10 text-[#003049]" />
          <StatCard icon={Clock} label="In Progress" value={stats.inProgressTickets} accent="bg-blue-100 text-blue-600" />
          <StatCard icon={CheckCircle2} label="Resolved" value={resolved} accent="bg-green-100 text-green-600" />
          <StatCard
            icon={TrendingUp} label="Resolution Rate" value={`${resolutionRate}%`}
            accent={resolutionRate >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
            subtitle={resolutionRate >= 70 ? 'Great performance!' : 'Keep going!'}
          />
        </div>

        {tickets.length > 0 && <TicketDistributionBar tickets={tickets} />}

        {/* Assigned tickets table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#003049] text-white px-6 py-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black tracking-tight">My Tickets</h3>
              <p className="text-xs text-blue-100/70">Latest 5 assigned to you</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-gray-400 font-medium text-sm">Loading...</div>
            ) : sorted.tickets.length === 0 ? (
              <div className="p-6 text-center">
                <Zap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-bold text-sm">No tickets assigned yet</p>
                <p className="text-xs text-gray-300 mt-1">You'll see them here once support assigns work to you.</p>
              </div>
            ) : sorted.tickets.map(t => (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 cursor-pointer transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[t.priority]?.dot || 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#003049] truncate group-hover:text-[#F77F00] transition-colors">
                    #{t.id} — {t.resource || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 truncate font-medium mt-0.5">
                    {t.description?.substring(0, 60) || 'No description'}
                  </p>
                </div>
                <Badge status={t.priority} config={priorityConfig} />
                <Badge status={t.status} config={statusConfig} />
                <span className="text-[10px] text-gray-400 font-bold flex-shrink-0 hidden md:block">
                  {formatTimeAgo(t.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── Tab rendering logic ─────────────────────────── */
  const renderDashboardTab = () => {
    if (loading && activeTab === 'dashboard') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-[#003049] animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (isAdmin) return renderAdminDashboard();
    if (isStudentSupport) return renderSupportDashboard();
    if (isTechnician) return renderTechnicianDashboard();
    return null;
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
          {activeTab === 'dashboard' && renderDashboardTab()}

          {activeTab === 'staff' && isAdmin && <ManageStaff />}
          {activeTab === 'users' && isAdmin && <UserManagement />}
          {activeTab === 'settings' && isAdmin && <SystemSettings />}
          {activeTab === 'bookings' && isAdmin && <AdminBookings />}
          {activeTab === 'helpdesk-tickets' && <TechniciansList />}
          {activeTab === 'facilities' && <Resources />}
        </div>
      </main>
    </div>
  );
}
