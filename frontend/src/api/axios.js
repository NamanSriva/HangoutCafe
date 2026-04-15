import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Add interceptor to include token in headers if available
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
