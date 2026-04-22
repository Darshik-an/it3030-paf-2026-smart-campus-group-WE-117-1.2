import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../../../services/api';
import {
  Loader2, Trash2, Shield, UserPlus, X, AlertTriangle, CheckCircle2,
  GraduationCap, Wrench, Users as UsersIcon, Briefcase, HeadphonesIcon,
  Building, Mail, Phone, Lock, User as UserIcon, Eye, EyeOff
} from 'lucide-react';

const STAFF_ROLES = [
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'INSTRUCTOR', label: 'Instructor' },
  { value: 'COORDINATOR', label: 'Coordinator' },
  { value: 'STUDENT_SUPPORT', label: 'Student Support' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'FACILITY_MANAGER', label: 'Facility Manager' },
];

const ALL_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  ...STAFF_ROLES,
];

const roleStyle = (role) => {
  switch (role) {
    case 'ADMIN': return { color: 'bg-red-100 text-red-700', icon: <Shield className="w-4 h-4" /> };
    case 'LECTURER': return { color: 'bg-blue-100 text-blue-700', icon: <GraduationCap className="w-4 h-4" /> };
    case 'INSTRUCTOR': return { color: 'bg-teal-100 text-teal-700', icon: <Briefcase className="w-4 h-4" /> };
    case 'COORDINATOR': return { color: 'bg-purple-100 text-purple-700', icon: <UsersIcon className="w-4 h-4" /> };
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

export default function ManageStaff() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Modal + form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const initialForm = {
    role: 'LECTURER',
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  };
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

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

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setProcessingId(userId);
      setError('');
      const response = await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setStaff(staff.map(u => u.id === userId ? response.data : u));
      showSuccess('Staff role updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update role.');
    } finally {
      setProcessingId(null);
    }
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
      showSuccess('Staff member deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member.');
    } finally {
      setProcessingId(null);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (!form.phoneNumber.trim()) return 'Phone number is required.';
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phoneNumber)) return 'Please enter a valid phone number.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.role) return 'Please select a staff type.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        role: form.role,
      };
      const response = await api.post('/api/admin/staff', payload);
      setStaff([response.data, ...staff]);
      showSuccess(`${formatRoleLabel(form.role)} "${form.name}" created successfully.`);
      setForm(initialForm);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setForm(initialForm);
    setFormError('');
    setShowPassword(false);
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
              Provision staff accounts for lecturers, technicians, coordinators, and support personnel.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-[#003049] border border-gray-200 shadow-sm">
              Total Staff: {staff.length}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#D62828] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#b01e1e] transition-all shadow-lg shadow-[#D62828]/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add New Staff Member
            </button>
          </div>
        </div>

        {/* Alerts */}
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

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Staff</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
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
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.color}`}>
                          {style.icon}
                          {formatRoleLabel(u.role)}
                        </span>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={processingId === u.id || isSelf}
                          className="text-xs font-bold bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#D62828] outline-none disabled:opacity-50"
                          title={isSelf ? "You cannot change your own role" : "Change role"}
                        >
                          {ALL_ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-medium">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={processingId === u.id || isSelf}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title={isSelf ? "Cannot delete yourself" : "Delete staff member"}
                      >
                        {processingId === u.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 font-medium">
                    No staff members yet. Click <strong>Add New Staff Member</strong> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#003049] to-[#001f30] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D62828] rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Add New Staff Member</h3>
                  <p className="text-xs text-white/60 font-medium">Create a staff account with role-based access</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/60 hover:text-white p-1" disabled={submitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

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
                  {STAFF_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. Saman Perera"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@smartcampus.edu"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none"
                      required
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
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
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
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Create Staff
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
