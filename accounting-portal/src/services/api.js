import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const branchId = localStorage.getItem('selectedBranch');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (branchId) {
      config.headers['X-Branch-Id'] = branchId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
