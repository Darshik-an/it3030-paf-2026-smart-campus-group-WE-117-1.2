import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../../../services/api';
import { Loader2, Trash2, Shield, User, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setProcessingId(userId);
      setError('');
      setSuccessMsg('');
      
      const response = await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      
      // Use response data to ensure we have the backend's updated object
      setUsers(users.map(u => u.id === userId ? response.data : u));
      setSuccessMsg('User role updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      setError('You cannot delete your own account.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;

    try {
      setProcessingId(userId);
      setError('');
      setSuccessMsg('');
      
      await api.delete(`/api/admin/users/${userId}`);
      
      setUsers(users.filter(u => u.id !== userId));
      setSuccessMsg('User deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleIcon = (role) => {
    if (role === 'ADMIN') return <Shield className="w-4 h-4 text-[#D62828]" />;
    if (role === 'TECHNICIAN') return <Wrench className="w-4 h-4 text-[#F77F00]" />;
    return <User className="w-4 h-4 text-[#003049]" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col items-center justify-center p-12 h-64">
        <Loader2 className="w-8 h-8 text-[#D62828] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#003049] flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#D62828]" />
            User Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage system access, roles, and accounts.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-[#003049] border border-gray-200 shadow-sm">
          Total Users: {users.length}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 font-medium text-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mx-6 mt-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-3 font-medium text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="pb-4 pt-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-[#003049]">
                      {u.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-[#003049]">{u.name}</p>
                      {u.id === currentUser.id && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm font-medium text-gray-600">{u.email}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(u.role)}
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={processingId === u.id || u.id === currentUser.id}
                      className="text-sm font-bold bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#D62828] outline-none disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={processingId === u.id || u.id === currentUser.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={u.id === currentUser.id ? "Cannot delete yourself" : "Delete User"}
                  >
                    {processingId === u.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500 font-medium">
                  No users found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
