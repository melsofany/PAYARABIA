import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.payarabia.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/admin/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  logout: async () => {
    await api.post('/admin/auth/logout');
  },

  getProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/admin/profile', profileData);
    return response.data.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/admin/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};