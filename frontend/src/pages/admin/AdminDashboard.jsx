import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Users, UserPlus, Calendar, Building, Wrench,
  AlertTriangle, ChevronRight, Clock, Activity,
  Ticket, CheckCircle2, BarChart3, TrendingUp,
  Zap, ArrowUpRight, Briefcase
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

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

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

const priorityColors = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  LOW:      { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
};

const statusColors = {
  OPEN:        { bg: 'bg-orange-100', text: 'text-orange-700' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700' },
  RESOLVED:    { bg: 'bg-green-100', text: 'text-green-700' },
  CLOSED:      { bg: 'bg-gray-200', text: 'text-gray-600' },
  REJECTED:    { bg: 'bg-red-100', text: 'text-red-700' },
  PENDING:     { bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED:    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  CANCELLED:   { bg: 'bg-gray-200', text: 'text-gray-600' },
};

const facilityStatusColors = {
  ACTIVE:         { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  OUT_OF_SERVICE: { bg: 'bg-red-100', text: 'text-red-600', label: 'Out of Service' },
};

const facilityTypeEmoji = {
  LECTURE_HALL:  '🏛️',
  LAB:          '🔬',
  MEETING_ROOM: '🤝',
  EQUIPMENT:    '🖥️',
};

/* ═══════════════════════════════════════════════════════════
   REUSABLE UI COMPONENTS
   ═══════════════════════════════════════════════════════════ */

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

function Badge({ status, configMap }) {
  const c = configMap[status] || { bg: 'bg-gray-100', text: 'text-gray-500' };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${c.bg} ${c.text}`}>
      {(status || '').replaceAll('_', ' ')}
    </span>
  );
}

function LiveDot({ lastRefreshed }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
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

function CriticalBanner({ tickets, navigate }) {
  if (!tickets?.length) return null;
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 md:p-5 text-white shadow-lg shadow-red-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-black text-sm">
            {tickets.length} Critical {tickets.length === 1 ? 'Ticket' : 'Tickets'} Need Attention
          </p>
          <p className="text-red-100 text-xs font-medium mt-0.5">
            {tickets.slice(0, 3).map(t => `#${t.id} ${t.resource}`).join(' • ')}
          </p>
        </div>
      </div>
    </div>
  );
}

function DistributionBar({ tickets }) {
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
        <span className="text-[10px] text-gray-400 font-bold ml-auto">{tickets.length} total</span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
        {groups.map(g => {
          const pct = (counts[g.key] / total) * 100;
          if (pct === 0) return null;
          return <div key={g.key} className={`${g.color} transition-all duration-700`} style={{ width: `${pct}%` }} title={`${g.label}: ${counts[g.key]}`} />;
        })}
      </div>
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
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${item.type === 'ticket' ? 'bg-[#D62828]' : 'bg-[#003049]'}`} />
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

/* ─── Ticket list card ─── */
function LatestTicketsCard({ tickets, loading, navigate, headerBg = 'bg-[#003049]', headerLabel = 'Latest Tickets' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`${headerBg} text-white px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-black tracking-tight">{headerLabel}</h3>
            <p className="text-xs text-white/60">Most recent 5</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 text-gray-400 font-medium text-sm">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-6 text-center">
            <Zap className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-sm">No tickets found</p>
          </div>
        ) : tickets.map(t => (
          <div
            key={t.id}
            onClick={() => navigate(`/tickets/${t.id}`)}
            className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 cursor-pointer transition-colors group"
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[t.priority]?.dot || 'bg-gray-300'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#003049] truncate group-hover:text-[#F77F00] transition-colors">
                #{t.id} — {t.resource || 'N/A'}
              </p>
              <p className="text-xs text-gray-400 truncate font-medium mt-0.5">
                {t.reporterName || t.reporterEmail || 'Unknown'} • {t.category}
              </p>
            </div>
            <Badge status={t.priority} configMap={priorityColors} />
            <Badge status={t.status} configMap={statusColors} />
            <span className="text-[10px] text-gray-400 font-bold flex-shrink-0 hidden md:block">
              {formatTimeAgo(t.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Booking list card ─── */
function LatestBookingsCard({ bookings, loading, onViewAll }) {
  return (
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
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 text-gray-400 font-medium text-sm">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-sm">No bookings found</p>
          </div>
        ) : bookings.map(b => (
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
            <Badge status={b.status} configMap={statusColors} />
            <span className="text-[10px] text-gray-400 font-bold flex-shrink-0 hidden md:block">
              {formatTimeAgo(b.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Facility status card ─── */
function FacilityStatusCard({ resources, loading, onManage }) {
  return (
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
        {onManage && (
          <button onClick={onManage} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 text-gray-400 font-medium text-sm">Loading facilities...</div>
        ) : resources.length === 0 ? (
          <div className="p-6 text-center">
            <Building className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-sm">No facilities found</p>
          </div>
        ) : resources.map(r => {
          const sc = facilityStatusColors[r.status] || facilityStatusColors.ACTIVE;
          return (
            <div key={r.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-colors">
              <span className="text-2xl flex-shrink-0">{facilityTypeEmoji[r.type] || '🏢'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#003049] truncate">{r.name}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                  {r.location || 'N/A'} • Capacity: {r.capacity || '—'} • {(r.type || '').replaceAll('_', ' ')}
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${sc.bg} ${sc.text}`}>
                {sc.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD OVERVIEW COMPONENT — injected into the dashboard tab
   ═══════════════════════════════════════════════════════════ */

function DashboardOverview({ role, user, navigate, setActiveTab }) {
  const isAdmin = role === 'ADMIN';
  const isSupport = role === 'STUDENT_SUPPORT';
  const isTechnician = role === 'TECHNICIAN';
  const isFacilityManager = role === 'FACILITY_MANAGER';

  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const promises = [];

      // Tickets
      if (isTechnician) {
        promises.push(api.get('/api/tickets/technician').catch(() => ({ data: [] })));
      } else if (isAdmin || isSupport) {
        promises.push(api.get('/api/tickets/manage').catch(() => ({ data: [] })));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // Bookings (admin sees all via admin endpoint)
      promises.push(api.get('/api/bookings').catch(() => ({ data: [] })));

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
      setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Dashboard fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isSupport, isTechnician]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchData();
    const interval = setInterval(() => { if (!cancelled) fetchData(); }, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [fetchData]);

  /* ── derived data ── */
  const sorted = useMemo(() => {
    const byDate = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return {
      tickets: [...tickets].sort(byDate).slice(0, 5),
      bookings: [...bookings].sort(byDate).slice(0, 5),
      resources: [...resources].slice(0, 5),
    };
  }, [tickets, bookings, resources]);

  const stats = useMemo(() => ({
    studentUsers:     allUsers.filter(u => u.role === 'USER').length,
    staffCount:       staffList.length,
    pendingBookings:  bookings.filter(b => b.status === 'PENDING').length,
    approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
    openTickets:      tickets.filter(t => t.status === 'OPEN').length,
    inProgress:       tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolvedToday:    tickets.filter(t => t.status === 'RESOLVED' && isToday(t.updatedAt)).length,
    resolved:         tickets.filter(t => t.status === 'RESOLVED').length,
    closed:           tickets.filter(t => t.status === 'CLOSED').length,
    activeResources:  resources.filter(r => r.status === 'ACTIVE').length,
    totalResources:   resources.length,
    totalTickets:     tickets.length,
    totalBookings:    bookings.length,
    criticalTickets:  tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'),
  }), [tickets, bookings, resources, allUsers, staffList]);

  const activityItems = useMemo(() => {
    const items = [];
    tickets.forEach(t => items.push({
      type: 'ticket', id: t.id,
      title: `Ticket #${t.id} — ${t.resource || 'Unknown'}`,
      subtitle: `${(t.status || '').replaceAll('_', ' ')} • ${t.priority || 'N/A'}`,
      time: t.createdAt,
    }));
    bookings.forEach(b => items.push({
      type: 'booking', id: b.id,
      title: `Booking #${b.id} — ${b.resourceName || 'Facility'}`,
      subtitle: `${(b.status || '').replaceAll('_', ' ')} • ${b.bookingDate || ''}`,
      time: b.createdAt,
    }));
    return items.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 5);
  }, [tickets, bookings]);

  /* ═══ ADMIN VIEW ═══ */
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Here's what's happening across your campus today.</p>
          </div>
          <LiveDot lastRefreshed={lastRefreshed} />
        </div>

        <CriticalBanner tickets={stats.criticalTickets} navigate={navigate} />

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Students" value={stats.studentUsers} accent="bg-[#003049]/10 text-[#003049]" subtitle={`${allUsers.length} total users`} onClick={() => setActiveTab('users')} />
          <StatCard icon={UserPlus} label="Staff" value={stats.staffCount} accent="bg-[#D62828]/10 text-[#D62828]" subtitle="All roles" onClick={() => setActiveTab('staff')} />
          <StatCard icon={Calendar} label="Pending" value={stats.pendingBookings} accent="bg-[#F77F00]/10 text-[#F77F00]" subtitle={`${stats.totalBookings} total bookings`} onClick={() => setActiveTab('bookings')} />
          <StatCard icon={Ticket} label="Open Tickets" value={stats.openTickets} accent="bg-orange-100 text-orange-600" subtitle={`${stats.inProgress} in progress`} />
          <StatCard icon={Building} label="Active Facilities" value={stats.activeResources} accent="bg-emerald-100 text-emerald-600" subtitle={`of ${stats.totalResources} total`} onClick={() => setActiveTab('facilities')} />
          <StatCard icon={CheckCircle2} label="Resolved Today" value={stats.resolvedToday} accent="bg-green-100 text-green-600" subtitle="Tickets closed today" />
        </div>

        {tickets.length > 0 && <DistributionBar tickets={tickets} />}

        {/* Tickets + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LatestTicketsCard tickets={sorted.tickets} loading={loading} navigate={navigate} />
          </div>
          <ActivityTimeline items={activityItems} />
        </div>

        {/* Bookings + Facilities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatestBookingsCard bookings={sorted.bookings} loading={loading} onViewAll={() => setActiveTab('bookings')} />
          <FacilityStatusCard resources={sorted.resources} loading={loading} onManage={() => setActiveTab('facilities')} />
        </div>
      </div>
    );
  }

  /* ═══ STUDENT_SUPPORT VIEW ═══ (overview cards ABOVE their existing TicketAdminDashboard) */
  if (isSupport) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">Support Overview 🎧</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Quick snapshot before diving into tickets.</p>
          </div>
          <LiveDot lastRefreshed={lastRefreshed} />
        </div>

        <CriticalBanner tickets={stats.criticalTickets} navigate={navigate} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Ticket} label="Open" value={stats.openTickets} accent="bg-orange-100 text-orange-600" />
          <StatCard icon={Clock} label="In Progress" value={stats.inProgress} accent="bg-blue-100 text-blue-600" />
          <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} accent="bg-green-100 text-green-600" />
          <StatCard icon={TrendingUp} label="Closed" value={stats.closed} accent="bg-gray-200 text-gray-600" />
        </div>

        {tickets.length > 0 && <DistributionBar tickets={tickets} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatestBookingsCard bookings={sorted.bookings} loading={loading} />
          <FacilityStatusCard resources={sorted.resources} loading={loading} />
        </div>
      </div>
    );
  }

  /* ═══ TECHNICIAN VIEW ═══ (overview cards ABOVE their existing TicketingTechnicionDashboard) */
  if (isTechnician) {
    const total = tickets.length || 1;
    const rate = Math.round((stats.resolved / total) * 100);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">My Assignments 🔧</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Tickets assigned to you, refreshing live.</p>
          </div>
          <LiveDot lastRefreshed={lastRefreshed} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Ticket} label="Total Assigned" value={tickets.length} accent="bg-[#003049]/10 text-[#003049]" />
          <StatCard icon={Clock} label="In Progress" value={stats.inProgress} accent="bg-blue-100 text-blue-600" />
          <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} accent="bg-green-100 text-green-600" />
          <StatCard icon={TrendingUp} label="Resolution Rate" value={`${rate}%`} accent={rate >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} subtitle={rate >= 70 ? 'Great performance!' : 'Keep going!'} />
        </div>

        {tickets.length > 0 && <DistributionBar tickets={tickets} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatestBookingsCard bookings={sorted.bookings} loading={loading} />
          <FacilityStatusCard resources={sorted.resources} loading={loading} />
        </div>
      </div>
    );
  }

  /* ═══ FACILITY_MANAGER VIEW ═══ */
  if (isFacilityManager) {
    const outOfService = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#003049] tracking-tight">Facility Overview 🏢</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Monitor campus facility status and bookings.</p>
          </div>
          <LiveDot lastRefreshed={lastRefreshed} />
        </div>

        {outOfService > 0 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 md:p-5 text-white shadow-lg shadow-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm">{outOfService} {outOfService === 1 ? 'Facility' : 'Facilities'} Out of Service</p>
              <p className="text-amber-100 text-xs font-medium mt-0.5">Requires maintenance attention</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Building} label="Total Facilities" value={stats.totalResources} accent="bg-[#003049]/10 text-[#003049]" />
          <StatCard icon={CheckCircle2} label="Active" value={stats.activeResources} accent="bg-emerald-100 text-emerald-600" />
          <StatCard icon={Wrench} label="Out of Service" value={outOfService} accent="bg-red-100 text-red-600" />
          <StatCard icon={Calendar} label="Pending Bookings" value={stats.pendingBookings} accent="bg-[#F77F00]/10 text-[#F77F00]" subtitle={`${stats.approvedBookings} approved`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FacilityStatusCard resources={sorted.resources} loading={loading} />
          <LatestBookingsCard bookings={sorted.bookings} loading={loading} />
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD — preserves ALL existing tab logic
   ═══════════════════════════════════════════════════════════ */

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
  
  useEffect(() => {
    if (location.pathname === '/dashboard/facilities') {
      setActiveTab('facilities');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('dashboard');
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

          {/* ═══ DASHBOARD TAB ═══ */}
          {activeTab === 'dashboard' && (
            <>
              {/* Overview cards — shown for EVERY role */}
              <DashboardOverview
                role={user?.role}
                user={user}
                navigate={navigate}
                setActiveTab={setActiveTab}
              />

              {/* EXISTING dashboards — rendered BELOW the new overview cards, completely untouched */}
              {isStudentSupport && <TicketAdminDashboard />}
              {isTechnician && <TicketingTechnicionDashboard />}
            </>
          )}

          {/* ═══ ALL OTHER TABS — 100% UNTOUCHED ═══ */}
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
