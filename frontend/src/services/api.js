import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Agregar token a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios de autenticación
export const authService = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Servicios de deudas
export const debtService = {
  createDebt: (description, amount, dueDate) =>
    api.post('/debts', { description, amount, dueDate }),
  getDebts: (isPaid) => {
    const params = isPaid !== null ? { isPaid } : {};
    return api.get('/debts', { params });
  },
  getDebtById: (debtId) =>
    api.get(`/debts/${debtId}`),
  updateDebt: (debtId, description, amount, dueDate) =>
    api.put(`/debts/${debtId}`, { description, amount, dueDate }),
  markAsPaid: (debtId) =>
    api.patch(`/debts/${debtId}/mark-paid`),
  deleteDebt: (debtId) =>
    api.delete(`/debts/${debtId}`),
  getAggregations: () =>
    api.get('/debts/aggregations/summary'),
  exportJSON: () =>
    api.get('/debts/export/json'),
  exportCSV: () =>
    api.get('/debts/export/csv'),
};

export default api;
