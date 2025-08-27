import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || "https://ishop-1-le5r.onrender.com"

const API = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
});

// Add auth token (optional)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

