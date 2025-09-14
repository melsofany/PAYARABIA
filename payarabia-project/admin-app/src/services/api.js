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

export const apiService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  getRecentTransactions: async (limit = 10) => {
    const response = await api.get(`/admin/transactions/recent?limit=${limit}`);
    return response.data.data;
  },

  // Users
  getUsers: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get(`/admin/users?${params}`);
    return response.data.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data.data;
  },

  blockUser: async (userId, reason) => {
    const response = await api.post(`/admin/users/${userId}/block`, { reason });
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  // Support
  getTickets: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get(`/admin/support/tickets?${params}`);
    return response.data.data;
  },

  getTicketById: async (ticketId) => {
    const response = await api.get(`/admin/support/tickets/${ticketId}`);
    return response.data.data;
  },

  updateTicketStatus: async (ticketId, status, priority) => {
    const response = await api.put(`/admin/support/tickets/${ticketId}`, {
      status,
      priority,
    });
    return response.data.data;
  },

  addTicketMessage: async (ticketId, message) => {
    const response = await api.post(`/admin/support/tickets/${ticketId}/messages`, {
      message,
    });
    return response.data.data;
  },

  // Finance
  getTransactions: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get(`/admin/transactions?${params}`);
    return response.data.data;
  },

  getExchangeRates: async () => {
    const response = await api.get('/admin/finance/exchange-rates');
    return response.data.data;
  },

  updateExchangeRate: async (fromCurrency, toCurrency, rate) => {
    const response = await api.put('/admin/finance/exchange-rates', {
      fromCurrency,
      toCurrency,
      rate,
    });
    return response.data.data;
  },

  getCommissionSettings: async () => {
    const response = await api.get('/admin/finance/commission');
    return response.data.data;
  },

  updateCommissionSettings: async (settings) => {
    const response = await api.put('/admin/finance/commission', settings);
    return response.data.data;
  },

  // Voice Calls
  initiateVoiceCall: async (ticketId) => {
    const response = await api.post('/admin/support/voice-call/initiate', {
      ticketId,
    });
    return response.data.data;
  },

  endVoiceCall: async (callId) => {
    const response = await api.post(`/admin/support/voice-call/${callId}/end`);
    return response.data;
  },

  // Reports
  generateReport: async (type, dateRange, filters = {}) => {
    const response = await api.post('/admin/reports/generate', {
      type,
      dateRange,
      filters,
    });
    return response.data.data;
  },
};