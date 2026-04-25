import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../../../services/api';
import {
  Loader2, Trash2, Shield, UserPlus, X, AlertTriangle, CheckCircle2,
  Wrench, HeadphonesIcon, Building, Mail, Phone, Lock,
  User as UserIcon, Eye, EyeOff, Pencil, Clock
} from 'lucide-react';

const STAFF_ROLES = [
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'FACILITY_MANAGER', label: 'Facility Manager' },
  { value: 'STUDENT_SUPPORT', label: 'Student Support' },
];

const roleStyle = (role) => {
  switch (role) {
    case 'ADMIN': return { color: 'bg-red-100 text-red-700', icon: <Shield className="w-4 h-4" /> };
    case 'STUDENT_SUPPORT': return { color: 'bg-green-100 text-green-700', icon: <HeadphonesIcon className="w-4 h-4" /> };
    case 'TECHNICIAN': return { color: 'bg-orange-100 text-orange-700', icon: <Wrench className="w-4 h-4" /> };
    case 'FACILITY_MANAGER': return { color: 'bg-amber-100 text-amber-700', icon: <Building className="w-4 h-4" /> };
    default: return { color: 'bg-gray-100 text-gray-700', icon: <UserIcon className="w-4 h-4" /> };
  }
};

const formatRoleLabel = (role) =>
  role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return '—'; }
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return '—'; }
};

const emptyCreateForm = {
  role: 'TECHNICIAN',
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

export default function ManageStaff() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createShowPassword, setCreateShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/admin/staff');
      setStaff(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.id) {
      setError('You cannot delete your own account.');
      return;
    }
    if (!window.confirm('Permanently delete this staff member? This cannot be undone.')) return;

    try {
      setProcessingId(userId);
      setError('');
      await api.delete(`/api/admin/users/${userId}`);
      setStaff(staff.filter(u => u.id !== userId));
      flashSuccess('Staff member deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member.');
    } finally {
      setProcessingId(null);
    }
  };

  // ---- Create ----
  const closeCreate = () => {
    if (createSubmitting) return;
    setIsCreateOpen(false);
    setCreateForm(emptyCreateForm);
    setCreateError('');
    setCreateShowPassword(false);
  };

  const validateCreate = () => {
    const f = createForm;
    if (!f.name.trim()) return 'Full name is required.';
    if (!f.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Please enter a valid email address.';
    if (!f.phoneNumber.trim()) return 'Phone number is required.';
    if (!/^[+\d][\d\s-]{6,}$/.test(f.phoneNumber)) return 'Please enter a valid phone number.';
    if (f.password.length < 6) return 'Password must be at least 6 characters.';
    if (f.password !== f.confirmPassword) return 'Passwords do not match.';
    if (!f.role) return 'Please select a staff type.';
    return '';
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    const problem = validateCreate();
    if (problem) { setCreateError(problem); return; }
    try {
      setCreateSubmitting(true);
      const payload = {
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        phoneNumber: createForm.phoneNumber.trim(),
        password: createForm.password,
        role: createForm.role,
      };
      const response = await api.post('/api/admin/staff', payload);
      setStaff([response.data, ...staff]);
      flashSuccess(`${formatRoleLabel(createForm.role)} "${createForm.name}" created.`);
      setCreateForm(emptyCreateForm);
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ---- Edit ----
  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      role: u.role,
      password: '',
      confirmPassword: '',
    });
    setEditError('');
    setEditShowPassword(false);
  };

  const closeEdit = () => {
    if (editSubmitting) return;
    setEditTarget(null);
    setEditForm(null);
    setEditError('');
    setEditShowPassword(false);
  };

  const validateEdit = () => {
    const f = editForm;
    if (!f.name.trim()) return 'Full name is required.';
    if (!f.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Please enter a valid email address.';
    if (f.phoneNumber.trim() && !/^[+\d][\d\s-]{6,}$/.test(f.phoneNumber)) return 'Please enter a valid phone number.';
    if (f.password || f.confirmPassword) {
      if (f.password.length < 6) return 'New password must be at least 6 characters.';
      if (f.password !== f.confirmPassword) return 'Passwords do not match.';
    }
    if (!f.role) return 'Please select a role.';
    return '';
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    const problem = validateEdit();
    if (problem) { setEditError(problem); return; }
    try {
      setEditSubmitting(true);
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        phoneNumber: editForm.phoneNumber.trim(),
        role: editForm.role,
      };
      if (editForm.password) payload.password = editForm.password;

      const response = await api.patch(`/api/admin/users/${editTarget.id}`, payload);
      setStaff(staff.map(u => u.id === editTarget.id ? response.data : u));
      flashSuccess(`${response.data.name} updated successfully.`);
      closeEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update staff member.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center justify-center p-12 h-64">
        <Loader2 className="w-8 h-8 text-[#D62828] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading staff data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#003049] flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-[#D62828]" />
              Manage Staff
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Provision staff accounts for technicians, facility managers, and support personnel.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-[#003049] border border-gray-200 shadow-sm">
              Total Staff: {staff.length}
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#D62828] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#b01e1e] transition-all shadow-lg shadow-[#D62828]/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add New Staff Member
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 font-medium text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-3 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Staff</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Last Login</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((u) => {
                const style = roleStyle(u.role);
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003049] to-[#001f30] text-white flex items-center justify-center font-bold">
                          {u.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-[#003049]">{u.name}</p>
                          {isSelf && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}
                      </p>
                      {u.phoneNumber && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {u.phoneNumber}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.color}`}>
                        {style.icon}
                        {formatRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDateTime(u.lastLoggedIn)}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-medium">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(u)}
                          disabled={processingId === u.id}
                          className="p-2 text-gray-400 hover:text-[#003049] hover:bg-[#003049]/5 rounded-xl transition-all disabled:opacity-30"
                          title="Edit staff member"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={processingId === u.id || isSelf}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          title={isSelf ? 'Cannot delete yourself' : 'Delete staff member'}
                        >
                          {processingId === u.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    No staff members yet. Click <strong>Add New Staff Member</strong> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {isCreateOpen && (
        <StaffModal
          title="Add New Staff Member"
          iconBg="bg-[#D62828]"
          submitLabel="Create Staff"
          submitting={createSubmitting}
          error={createError}
          onClose={closeCreate}
          onSubmit={submitCreate}
          showPassword={createShowPassword}
          setShowPassword={setCreateShowPassword}
          form={createForm}
          setForm={setCreateForm}
          showRole
          roleOptions={STAFF_ROLES}
          passwordRequired
        />
      )}

      {/* Edit Staff Modal */}
      {editTarget && editForm && (
        <StaffModal
          title={`Edit ${editTarget.name}`}
          subtitle="Update staff details. Leave password blank to keep the current one."
          iconBg="bg-[#003049]"
          submitLabel="Save Changes"
          submitting={editSubmitting}
          error={editError}
          onClose={closeEdit}
          onSubmit={submitEdit}
          showPassword={editShowPassword}
          setShowPassword={setEditShowPassword}
          form={editForm}
          setForm={setEditForm}
          showRole
          roleOptions={STAFF_ROLES}
          passwordRequired={false}
        />
      )}
    </>
  );
}

// ---- Shared modal component ----
function StaffModal({
  title, subtitle, iconBg = 'bg-[#D62828]', submitLabel, submitting, error,
  onClose, onSubmit, showPassword, setShowPassword, form, setForm,
  showRole, roleOptions, passwordRequired,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#003049] to-[#001f30] text-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">{title}</h3>
              {subtitle && (
                <p className="text-xs text-white/60 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1" disabled={submitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {showRole && (
            <div>
              <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                Staff Type
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                required
              >
                {roleOptions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          )}

          <LabeledInput
            label="Full Name" icon={UserIcon} type="text"
            placeholder="e.g. Dr. Saman Perera"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <LabeledInput
            label="Email Address" icon={Mail} type="email"
            placeholder="staff@smartcampus.edu"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <LabeledInput
            label="Phone Number" icon={Phone} type="tel"
            placeholder="+94 77 123 4567"
            value={form.phoneNumber}
            onChange={(v) => setForm({ ...form, phoneNumber: v })}
            required={passwordRequired}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                {passwordRequired ? 'Password' : 'New Password (optional)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={passwordRequired ? 'At least 6 characters' : 'Leave blank to keep current'}
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                  required={passwordRequired}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                  required={passwordRequired || !!form.password}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#D62828] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b01e1e] transition-all shadow-lg shadow-[#D62828]/20 disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> {submitLabel}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LabeledInput({ label, icon: Icon, type, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
          required={required}
        />
      </div>
    </div>
  );
}
