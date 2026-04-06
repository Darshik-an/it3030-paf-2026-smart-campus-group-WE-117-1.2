import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-primary text-white">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await response.json();
      login(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-primary relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent1 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent2 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="auth-card w-full max-w-md p-8 rounded-3xl card-shadow relative z-10">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-accent2 rounded-xl flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4">E</div>
                <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
                <p className="text-gray-500 text-sm">Please enter your details to sign in</p>
            </div>

            {error && <div className="text-secondary text-center text-sm mb-4 font-bold">{error}</div>}

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1 ml-1">Email Address</label>
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
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all" 
                      required 
                    />
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-accent1 focus:ring-accent1" />
                        <span className="text-gray-500">Remember me</span>
                    </label>
                    <a href="#" className="text-accent1 font-bold hover:underline">Forgot Password?</a>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20">Sign In</button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
            </div>

            <button onClick={handleGoogleLogin} type="button" className="btn-google w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm text-gray-700">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
                Sign in with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-8">
                Don't have an account? <Link to="/signup" className="text-accent1 font-bold hover:underline">Create an account</Link>
            </p>
        </div>
    </div>
  );
}