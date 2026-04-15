import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';

export default function SignupPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score >= 3) return { score, label: 'Strong', color: 'bg-green-500' };
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const response = await api.post('/api/auth/register', { 
        name: `${firstName} ${lastName}`, 
        email, 
        password 
      });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-10 sm:p-6 bg-[#003049] relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D62828] opacity-15 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-[480px] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
        <Link to="/" className="absolute top-5 sm:top-6 left-5 sm:left-6 text-gray-400 hover:text-[#003049] transition-colors">
           <X className="w-6 h-6" />
        </Link>
        
        {error && <div className="text-[#D62828] text-center text-sm mt-2 mb-2 font-bold bg-[#D62828]/10 p-2 rounded-lg">{error}</div>}

        <div className="text-center mb-5 sm:mb-6 mt-2 sm:mt-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FCBF49] rounded-2xl flex items-center justify-center text-[#003049] font-black text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4 shadow-lg transform -rotate-3">SC</div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#003049] tracking-tight">Create Account</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">Smart Campus Operations Hub</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#003049] uppercase tracking-wider mb-1.5 ml-1">First Name</label>
                <input 
                  type="text" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#003049] uppercase tracking-wider mb-1.5 ml-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
                  required 
                />
              </div>
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-[#003049] uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@smartcampus.edu" 
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-[#003049] uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pr-12 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 ml-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password Strength</span>
                  <span className={`text-[10px] font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  <div className={`flex-1 rounded-full ${password.length > 0 ? strength.color : 'bg-gray-200'} transition-all duration-300`}></div>
                  <div className={`flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-gray-200'} transition-all duration-300`}></div>
                  <div className={`flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-gray-200'} transition-all duration-300`}></div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-[#003049] uppercase tracking-wider mb-1.5 ml-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pr-12 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#003049] text-white py-3 sm:py-3.5 mt-2 rounded-xl font-bold hover:bg-[#002030] transition-all shadow-xl shadow-[#003049]/20 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="relative my-5 sm:my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-[9px] sm:text-[10px] uppercase tracking-widest"><span className="bg-white px-4 text-gray-400 font-bold">Or continue with</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" className="w-5 h-5" alt="Google" />
          Google
        </button>

        <p className="text-center text-xs sm:text-sm text-gray-500 mt-5 sm:mt-6 font-medium">
          Already have an account? 
          <Link to="/login" className="text-[#F77F00] font-bold hover:underline ml-1">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}