import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const token = response.data.token;

      const meResponse = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = meResponse.data?.role;

      if (role !== 'USER' && role !== undefined) {
        setError('This portal is for students only. Staff must use the Staff Portal.');
        return;
      }

      login(token);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid user credentials');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-10 sm:p-6 bg-[#003049] relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D62828] opacity-15 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-[440px] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
        <Link to="/" className="absolute top-5 sm:top-6 left-5 sm:left-6 text-gray-400 hover:text-[#003049] transition-colors">
           <X className="w-6 h-6" />
        </Link>

        {error && <div className="text-[#D62828] text-center text-sm mt-2 mb-2 font-bold bg-[#D62828]/10 p-2 rounded-lg">{error}</div>}

        <div className="text-center mb-6 sm:mb-8 mt-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FCBF49] rounded-2xl flex items-center justify-center text-[#003049] font-black text-2xl sm:text-3xl mx-auto mb-4 sm:mb-5 shadow-lg transform rotate-3">SC</div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#003049] tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">Smart Campus Operations Hub</p>
        </div>

        <form className="space-y-5" onSubmit={handleEmailLogin}>
          <div>
            <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@smartcampus.edu" 
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 mx-1">
              <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider">Password</label>
              <Link to="#" className="text-[11px] font-bold text-[#F77F00] hover:text-[#e67600] hover:underline transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
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
            disabled={loading}
            className="w-full bg-[#003049] text-white py-4 rounded-xl font-bold hover:bg-[#002030] transition-all shadow-xl shadow-[#003049]/20 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-4 text-gray-400 font-bold">Or continue with</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" className="w-5 h-5" alt="Google" />
          Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Don't have an account? 
          <Link to="/signup" className="text-[#F77F00] font-bold hover:underline ml-1">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}