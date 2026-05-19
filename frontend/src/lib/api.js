import { supabase } from './supabase';

const getApiBaseUrl = () => {
  // Manual override from Developer Settings gear icon (highest priority)
  const customUrl = localStorage.getItem('custom_api_url');
  if (customUrl) {
    return customUrl.endsWith('/') ? customUrl + 'api' : customUrl + '/api';
  }
  // Vite env variable override
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Mobile app (Capacitor) → always use the cloud backend
  if (window.Capacitor || window.location.origin.includes('capacitor') || (window.location.origin.includes('http://localhost') && !window.location.port)) {
    return 'https://aureon-1.onrender.com/api';
  }
  // Web dev → local Django server
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiFetch = async (endpoint, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || localStorage.getItem('supabase_token');

  const headers = {
    ...options.headers,
    'Bypass-Tunnel-Reminder': 'true',
  };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = '';
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
        } else {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const val = errorData[firstKey];
            errorMessage = Array.isArray(val) ? `${firstKey}: ${val.join(', ')}` : `${firstKey}: ${val}`;
          }
        }
      }
      throw new Error(errorMessage || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};
