import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';

export default function AdminLogin() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" />;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    localStorage.removeItem('token');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const token = response.data.token;

      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const role = meRes.data?.role;

      if (role === 'USER' || !role) {
        setError('This portal is for staff only. Students must use the Student Portal.');
        return;
      }

      login(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid staff credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#001f30] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D62828] opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#003049] opacity-40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/95 backdrop-blur-xl w-full max-w-[440px] p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-[#D62828] transition-colors">
          <X className="w-6 h-6" />
        </Link>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-[#D62828] rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-5 shadow-lg shadow-[#D62828]/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-[#001f30] tracking-tight">Staff Portal</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="text-[#D62828] text-center text-sm mb-4 font-semibold bg-[#D62828]/10 p-3 rounded-xl border border-[#D62828]/20">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleAdminLogin}>
          <div>
            <label className="block text-xs font-bold text-[#001f30] uppercase tracking-wider mb-2 ml-1">Staff Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartcampus.edu"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#001f30] uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#D62828] focus:ring-4 focus:ring-[#D62828]/10 outline-none font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="w-full bg-[#D62828] text-white py-4 rounded-xl font-bold hover:bg-[#b01e1e] transition-all shadow-xl shadow-[#D62828]/20 disabled:opacity-70 active:scale-[0.98] mt-4"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In to Staff Portal'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Students must use the{' '}
          <Link to="/login" className="text-[#003049] font-bold hover:underline">
            Student Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
