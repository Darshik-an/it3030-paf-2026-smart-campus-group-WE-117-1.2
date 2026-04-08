import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import api from '../services/api';

export default function SignupPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    login('dummy-token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#003049] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F77F00] opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D62828] opacity-15 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-[480px] p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-[#003049] transition-colors">
           <X className="w-6 h-6" />
        </Link>
        
        {error && <div className="text-[#D62828] text-center text-sm mt-2 mb-2 font-bold bg-[#D62828]/10 p-2 rounded-lg">{error}</div>}

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-[#FCBF49] rounded-2xl flex items-center justify-center text-[#003049] font-black text-3xl mx-auto mb-5 shadow-lg transform -rotate-3">SC</div>
          <h1 className="text-3xl font-black text-[#003049] tracking-tight">Create Account</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Smart Campus Operations Hub</p>
        </div>

        <form className="space-y-5" onSubmit={handleSignup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2 ml-1">First Name</label>
                <input 
                  type="text" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2 ml-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
                  required 
                />
              </div>
          </div>
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
            <label className="block text-xs font-bold text-[#003049] uppercase tracking-wider mb-2 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm transition-all focus:border-[#F77F00] focus:ring-4 focus:ring-[#F77F00]/10 outline-none font-medium" 
              required 
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#003049] text-white py-4 rounded-xl font-bold hover:bg-[#002030] transition-all shadow-xl shadow-[#003049]/20 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Creating Account...' : 'Register'}
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
          Google OAuth Sign In
        </button>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Already have an account? 
          <Link to="/login" className="text-[#F77F00] font-bold hover:underline ml-1">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}