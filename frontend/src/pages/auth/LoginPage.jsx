// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader, AlertCircle, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const LoginPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dev settings
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(localStorage.getItem('custom_api_url') || '');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (data?.session) {
        localStorage.setItem('supabase_token', data.session.access_token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("Failed to fetch. Your app cannot connect to the backend server. Tap the Gear icon in the top right to verify your backend server's IP address!");
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Your email is not verified.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const isMobile = window.Capacitor || window.location.origin.includes('capacitor') || (window.location.origin.includes('http://localhost') && !window.location.port);
      const redirectUrl = isMobile ? 'aureon://login' : `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 animate-[fadeIn_0.8s_ease-out]"
        style={{
          backgroundImage: 'url("/common-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <div className="max-w-md w-full relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-white hover:text-gray-300 mb-6 transition-all duration-300 animate-[slideInLeft_0.6s_ease-out] hover:translate-x-[-4px]"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 relative animate-[slideUp_0.8s_ease-out]">
          
          {/* Subtle Dev Settings button */}
          <button 
            type="button"
            onClick={() => setShowDevSettings(true)}
            className="absolute top-4 right-4 text-white/20 hover:text-emerald-400 transition-all duration-300 z-20"
            title="Developer Settings"
          >
            <Settings size={18} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-[scaleIn_0.6s_ease-out] hover:scale-110 transition-transform duration-300">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-[fadeInDown_0.8s_ease-out_0.2s_both]">Welcome Back</h1>
            <p className="text-gray-400 animate-[fadeInDown_0.8s_ease-out_0.3s_both]">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="animate-[slideInRight_0.6s_ease-out_0.4s_both]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative group">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300 text-white bg-white/5 placeholder-gray-500 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="animate-[slideInRight_0.6s_ease-out_0.5s_both]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative group">
                <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300 text-white bg-white/5 placeholder-gray-500 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-[slideInRight_0.6s_ease-out_0.7s_both] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="relative my-6 animate-[fadeIn_0.8s_ease-out_0.8s_both]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/40 text-gray-400 backdrop-blur-xl">Or</span>
            </div>
          </div>

          <div className="animate-[slideUp_0.6s_ease-out_0.9s_both]">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-300">Continue with Google</span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400 animate-[fadeIn_0.8s_ease-out_1s_both]">
            Don't have an account?{' '}
            <Link to="/onboarding/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300 hover:underline">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Developer Settings Modal */}
      {showDevSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Settings className="text-emerald-400" size={20} />
              <span>Dev Settings</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Override your backend API base URL directly. Perfect if your Mac IP address changed. Make sure to specify the protocol (e.g. <code>http://192.168.31.92:8000</code>).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Backend Base URL</label>
                <input 
                  type="text" 
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="e.g. http://192.168.31.92:8000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('custom_api_url', customUrlInput.trim());
                    setShowDevSettings(false);
                    window.location.reload();
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  Save & Reload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('custom_api_url');
                    setCustomUrlInput('');
                    setShowDevSettings(false);
                    window.location.reload();
                  }}
                  className="px-3 py-2 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowDevSettings(false)}
                  className="px-3 py-2 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default LoginPage;