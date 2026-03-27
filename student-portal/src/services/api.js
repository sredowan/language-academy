import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if needed
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const deviceId = localStorage.getItem('deviceId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (deviceId) {
    config.headers['x-device-id'] = deviceId;
  }
  
  return config;
});

export default api;
