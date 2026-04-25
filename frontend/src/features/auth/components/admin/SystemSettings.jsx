import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../../../services/api';
import {
  Loader2, AlertTriangle, CheckCircle2, RefreshCcw, Download,
  Shield, Users, GraduationCap, Wrench, HeadphonesIcon, Building,
  Server, Mail, Calendar, Info
} from 'lucide-react';

const ROLE_META = {
  ADMIN:            { label: 'Admin',           color: 'bg-red-100 text-red-700',       icon: Shield },
  USER:             { label: 'Student',         color: 'bg-blue-100 text-blue-700',     icon: GraduationCap },
  TECHNICIAN:       { label: 'Technician',      color: 'bg-orange-100 text-orange-700', icon: Wrench },
  FACILITY_MANAGER: { label: 'Facility Mgr.',   color: 'bg-amber-100 text-amber-700',   icon: Building },
  STUDENT_SUPPORT:  { label: 'Student Support', color: 'bg-green-100 text-green-700',   icon: HeadphonesIcon },
};

const ROLE_ORDER = ['ADMIN', 'USER', 'TECHNICIAN', 'FACILITY_MANAGER', 'STUDENT_SUPPORT'];

const csvEscape = (value) => {
  if (value == null) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

export default function SystemSettings() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system data.');
    } finally {
      setLoading(false);
    }
  };

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const counts = useMemo(() => {
    const byRole = {};
    for (const r of ROLE_ORDER) byRole[r] = 0;
    for (const u of users) {
      if (byRole[u.role] != null) byRole[u.role] += 1;
    }
    return {
      total: users.length,
      students: byRole.USER,
      admins: byRole.ADMIN,
      staff: users.length - byRole.USER - byRole.ADMIN,
      byRole,
    };
  }, [users]);

  const handleRefresh = async () => {
    await fetchUsers();
    flashSuccess('System data refreshed.');
  };

  const handleExport = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Role', 'Last Login', 'Joined'],
      ...users.map(u => [
        u.name, u.email, u.phoneNumber || '', u.role,
        u.lastLoggedIn || '', u.createdAt || '',
      ]),
    ];
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcampus-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flashSuccess('User list exported as CSV.');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-12 h-64">
        <Loader2 className="w-8 h-8 text-[#D62828] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading system data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 border-l-4 border-l-[#D62828]">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-[#D62828]" />
          <h2 className="text-2xl font-black text-[#003049]">System Settings</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Overview, role distribution, and admin tooling for the SmartCampus Hub.
        </p>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 font-medium text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-3 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}
      </div>

      {/* System Overview */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users" value={counts.total}
          icon={Users} accent="bg-[#003049] text-white"
        />
        <StatCard
          label="Students" value={counts.students}
          icon={GraduationCap} accent="bg-[#FCBF49]/20 text-[#003049] border border-[#FCBF49]/40"
        />
        <StatCard
          label="Staff" value={counts.staff}
          icon={Wrench} accent="bg-[#F77F00]/15 text-[#F77F00] border border-[#F77F00]/30"
        />
        <StatCard
          label="Admins" value={counts.admins}
          icon={Shield} accent="bg-[#D62828]/10 text-[#D62828] border border-[#D62828]/20"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-black text-[#003049] mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#003049]" />
            Role Distribution
          </h3>
          <p className="text-sm text-gray-500 mb-5">How accounts break down across roles.</p>

          <div className="space-y-3">
            {ROLE_ORDER.map(role => {
              const meta = ROLE_META[role];
              const count = counts.byRole[role] || 0;
              const pct = counts.total ? Math.round((count / counts.total) * 100) : 0;
              const Icon = meta.icon;
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${meta.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-sm font-bold text-[#003049]">
                      {count} <span className="text-gray-400 font-medium">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D62828] to-[#F77F00] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Tools */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-black text-[#003049] mb-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-[#003049]" />
            Session Tools
          </h3>
          <p className="text-sm text-gray-500 mb-5">Quick actions for day-to-day admin work.</p>

          <div className="space-y-3">
            <ToolRow
              icon={RefreshCcw}
              title="Refresh data cache"
              description="Pull the latest user roster from the server."
              buttonLabel="Refresh"
              onClick={handleRefresh}
            />
            <ToolRow
              icon={Download}
              title="Download user list (CSV)"
              description="Export every account for offline record-keeping."
              buttonLabel="Export"
              onClick={handleExport}
              primary
            />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h3 className="text-lg font-black text-[#003049] mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#003049]" />
          About This Deployment
        </h3>
        <p className="text-sm text-gray-500 mb-5">Read-only snapshot of the current system.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={Shield} label="Application" value="SmartCampus Hub" />
          <InfoRow icon={Mail}  label="Signed in as" value={currentUser?.email || '—'} />
          <InfoRow icon={Server} label="API base URL" value={api.defaults.baseURL || '—'} />
          <InfoRow icon={Calendar} label="Build date" value={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  const Icon = icon;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-[#003049] leading-tight">{value}</p>
      </div>
    </div>
  );
}

function ToolRow({ icon, title, description, buttonLabel, onClick, primary }) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#003049]/20 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#003049] flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-[#003049] text-sm">{title}</p>
          <p className="text-xs text-gray-500 font-medium">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
          primary
            ? 'bg-[#D62828] text-white hover:bg-[#b01e1e] shadow-lg shadow-[#D62828]/20'
            : 'bg-white border-2 border-[#003049] text-[#003049] hover:bg-[#003049] hover:text-white'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
      <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#003049] flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-[#003049] truncate">{value}</p>
      </div>
    </div>
  );
}
