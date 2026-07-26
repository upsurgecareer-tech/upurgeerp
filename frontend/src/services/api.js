import axios from 'axios';

// Get the correct API URL dynamically
const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (url && !url.includes('localhost')) {
    url = url.replace(/\/+$/, '');
    if (!url.endsWith('/api/v1')) {
      url = `${url}/api/v1`;
    }
    return url;
  }
  
  // If in production (on Vercel / non-localhost domain), automatically use Render live URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    return 'https://upurgeerp.onrender.com/api/v1';
  }

  // Construct based on current hostname (works for localhost and network IPs)
  const hostname = window.location.hostname;
  return `http://${hostname}:3000/api/v1`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
