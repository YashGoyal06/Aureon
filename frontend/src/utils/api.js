export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('supabase_token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};