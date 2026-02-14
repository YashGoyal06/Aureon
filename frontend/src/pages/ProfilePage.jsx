// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import {
  User,
  Mail,
  CheckCircle,
  Edit2,
  Save,
  X,
  Loader,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('supabase_token');

  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || errorJson.error);
    } catch {
      throw new Error(errorText);
    }
  }

  return response;
};

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    emailVerified: false,
    profilePhoto: null,
  });

  const ensureValidToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (session?.access_token) {
      localStorage.setItem('supabase_token', session.access_token);
      return true;
    }
    return false;
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Loading profile...' });

      const hasValidToken = await ensureValidToken();
      if (!hasValidToken) {
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      let backendProfile = {};
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/me/`);
        if (res.ok) backendProfile = await res.json();
      } catch {
        // ignore, use supabase data
      }

      const combinedProfile = {
        name:
          user?.user_metadata?.full_name ||
          backendProfile.username ||
          'User',
        email: user?.email || backendProfile.email || '',
        profilePhoto:
          user?.user_metadata?.avatar_url ||
          user?.user_metadata?.picture ||
          null,
        emailVerified: backendProfile.profile?.is_email_verified || false,
      };

      setProfileData(combinedProfile);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    setSendingOTP(true);
    setMessage({ type: 'info', text: 'Sending verification code...' });

    try {
      await ensureValidToken();

      const res = await fetchWithAuth(`${API_BASE_URL}/send-email-otp/`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setShowOTPInput(true);
        setMessage({ type: 'success', text: `Verification code sent to ${data.email}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
      return;
    }

    setVerifyingOTP(true);
    setMessage({ type: 'info', text: 'Verifying code...' });

    try {
      await ensureValidToken();

      const res = await fetchWithAuth(`${API_BASE_URL}/verify-email-otp/`, {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });

      if (res.ok) {
        setProfileData((prev) => ({ ...prev, emailVerified: true }));
        setShowOTPInput(false);
        setOtp('');
        setMessage({ type: 'success', text: 'Email verified successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleOtpInput = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    let otpArray = otp.split('');
    while (otpArray.length < 6) otpArray.push('');
    otpArray[index] = value;
    setOtp(otpArray.join('').slice(0, 6));

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  if (loading && !profileData.email) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/dashboard-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10">
        <Header
          user={{
            name: profileData.name,
            email: profileData.email,
            avatar: profileData.profilePhoto,
          }}
        />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                message.type === 'error'
                  ? 'bg-red-500/20 border border-red-500/30'
                  : message.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-blue-500/20 border border-blue-500/30'
              }`}
            >
              {message.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
              {message.type === 'success' && <CheckCircle size={20} className="text-emerald-400" />}
              {message.type === 'info' && <Loader size={20} className="animate-spin text-blue-400" />}
              <span className="text-sm text-white">{message.text}</span>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
              <p className="text-gray-300">Manage your account information</p>
            </div>
          </div>

          {/* Account Overview */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-white/10">
            <div className="flex items-center space-x-6">
              <img
                src={profileData.profilePhoto || '/default-avatar.png'}
                alt="avatar"
                className="w-24 h-24 rounded-2xl object-cover border border-white/10"
              />

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white">{profileData.name}</h2>
                <p className="text-gray-400">{profileData.email}</p>

                {profileData.emailVerified ? (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <CheckCircle size={16} className="text-emerald-400 mr-2" />
                    <span className="text-emerald-300 text-sm">Verified Account</span>
                  </div>
                ) : (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <AlertCircle size={16} className="text-orange-400 mr-2" />
                    <span className="text-orange-300 text-sm">Not Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Verification */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Mail size={24} className="text-emerald-400" />
              <span>Email Verification</span>
            </h2>

            {profileData.emailVerified ? (
              <div className="flex items-center space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle size={24} className="text-emerald-400" />
                <div>
                  <p className="text-emerald-300 font-semibold">Email Verified</p>
                  <p className="text-emerald-200 text-sm">
                    Your email has been successfully verified
                  </p>
                </div>
              </div>
            ) : showOTPInput ? (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-emerald-400">{profileData.email}</span>
                </p>

                <div className="flex gap-2 justify-center mb-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      maxLength="1"
                      value={otp[i] || ''}
                      onChange={(e) => handleOtpInput(e, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      className="w-12 h-14 bg-white/5 border border-white/10 text-center text-white text-2xl rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowOTPInput(false);
                      setOtp('');
                      setMessage(null);
                    }}
                    className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleVerifyEmailOTP}
                    disabled={verifyingOTP || otp.length !== 6}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl disabled:opacity-50"
                  >
                    {verifyingOTP ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>

                <button
                  onClick={handleSendEmailOTP}
                  disabled={sendingOTP}
                  className="w-full text-emerald-400 text-sm disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendEmailOTP}
                disabled={sendingOTP}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl disabled:opacity-50"
              >
                {sendingOTP ? 'Sending...' : 'Send Verification Code'}
              </button>
            )}
          </div>

          {/* Security & Status */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
              <ShieldCheck size={24} className="text-emerald-400" />
              <span>Security & Status</span>
            </h2>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div>
                <p className="text-white font-medium">Authentication</p>
                <p className="text-gray-400 text-sm">Logged in via Supabase</p>
              </div>
              <span className="text-emerald-400 text-sm">Active</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
