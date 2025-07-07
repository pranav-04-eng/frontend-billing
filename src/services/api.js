import axios from 'axios';

const API_BASE_URL = 'https://backend-billing-j81u.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  customerLogin: (email) => api.post('/auth/customer/login', { email }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Invoice API
export const invoiceAPI = {
  // Admin endpoints
  createInvoice: (invoiceData) => api.post('/invoices', invoiceData),
  getAllInvoices: (params) => api.get('/invoices', { params }),
  updateInvoice: (id, updates) => api.put(`/invoices/${id}`, updates),
  searchInvoice: (invoiceId) => api.get(`/invoices/search/${invoiceId}`),
  getOverdueInvoices: () => api.get('/invoices/overdue'),
  downloadAttachment: (id) => api.get(`/invoices/${id}/attachment`, { responseType: 'blob' }),
  deleteAttachment: (id) => api.delete(`/invoices/${id}/attachment`),
  batchUpdate: (data) => api.post('/invoices/batch', data),
  // Customer endpoints
  getCustomerInvoices: (email) => api.get(`/invoices/customer`, { params: { email } }),
};

export default api;