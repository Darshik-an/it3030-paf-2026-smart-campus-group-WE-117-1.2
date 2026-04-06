import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SignupPage() {
  const { user, loading, login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-primary text-white">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await api.post('/api/auth/register', { name: fullName, email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Error creating account. Please try again.');
      }
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-primary relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
        
        <div className="auth-card w-full max-w-md p-8 rounded-3xl card-shadow relative z-10">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-accent2 rounded-xl flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4">E</div>
                <h1 className="text-2xl font-bold text-primary">Join EduFlow</h1>
                <p className="text-gray-500 text-sm">Start your learning journey today</p>
            </div>

            {error && <div className="text-secondary text-center text-sm mb-4 font-bold">{error}</div>}

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-primary uppercase mb-1 ml-1">First Name</label>
                        <input 
                            type="text" 
                            placeholder="Alex" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-primary uppercase mb-1 ml-1">Last Name</label>
                        <input 
                            type="text" 
                            placeholder="Johnson" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all" 
                            required 
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1 ml-1">Student Email</label>
                    <input 
                        type="email" 
                        placeholder="alex@university.edu" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1 ml-1">Password</label>
                    <input 
                        type="password" 
                        placeholder="Min. 8 characters" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all" 
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-accent1 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-accent1/20 mt-2">Create Account</button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or sign up with</span></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="btn-google w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm text-gray-700">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                Sign up with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? <Link to="/login" className="text-accent1 font-bold hover:underline">Log in here</Link>
            </p>
        </div>
    </div>
  );
}