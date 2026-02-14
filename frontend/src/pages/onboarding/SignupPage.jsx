// src/pages/onboarding/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader, ArrowRight, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false); // New state for success message
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // Handle auto-redirect after success
  useEffect(() => {
    if (signupSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000); // Wait 2 seconds so user can read the message
      return () => clearTimeout(timer);
    }
  }, [signupSuccess, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create User in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;

      // 2. Show Success Message (instead of auto-redirecting)
      if (data.user) {
        setSignupSuccess(true);
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative py-8 px-4 flex items-center justify-center">
      {/* Background Image */}
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
        {!signupSuccess && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-gray-300 mb-6 transition-all duration-300 animate-[slideInLeft_0.6s_ease-out] hover:translate-x-[-4px]"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 animate-[slideUp_0.8s_ease-out]">
          
          {/* --- SUCCESS STATE --- */}
          {signupSuccess ? (
            <div className="text-center py-8 animate-[scaleIn_0.5s_ease-out]">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Signup Successful!</h2>
              <p className="text-gray-300 mb-8">
                Your account has been created. <br/>
                Redirecting you to the login page...
              </p>
              <div className="flex justify-center">
                <Loader className="animate-spin text-emerald-400" size={30} />
              </div>
            </div>
          ) : (
            /* --- FORM STATE --- */
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-[scaleIn_0.6s_ease-out] hover:scale-110 transition-transform duration-300">
                  <Lock size={32} className="text-white animate-[fadeIn_1s_ease-out]" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3 animate-[fadeInDown_0.8s_ease-out_0.2s_both]">
                  Create Account
                </h1>
                <p className="text-gray-400 animate-[fadeInDown_0.8s_ease-out_0.3s_both]">Start your journey to financial freedom</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 animate-[fadeIn_0.3s_ease-out]">
                  <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="animate-[slideInRight_0.6s_ease-out_0.4s_both]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative group">
                    <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02]"
                    />
                  </div>
                </div>

                <div className="animate-[slideInRight_0.6s_ease-out_0.5s_both]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02]"
                    />
                  </div>
                </div>

                <div className="animate-[slideInRight_0.6s_ease-out_0.6s_both]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative group">
                    <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/10 focus:scale-[1.02]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] disabled:hover:scale-100 animate-[slideInRight_0.6s_ease-out_1s_both] active:scale-95 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400 animate-[fadeIn_0.8s_ease-out_1.1s_both]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300 hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

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

export default SignUpPage;