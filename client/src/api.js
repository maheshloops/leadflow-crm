import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

// ─── Leads ───────────────────────────────────────────────────────────
export const getLeads = (params = {}) =>
  api.get('/leads', { params }).then((r) => r.data);

export const getLead = (id) =>
  api.get(`/leads/${id}`).then((r) => r.data);

export const createLead = (data) =>
  api.post('/leads', data).then((r) => r.data);

export const updateLead = (id, data) =>
  api.put(`/leads/${id}`, data).then((r) => r.data);

export const updateStatus = (id, status) =>
  api.patch(`/leads/${id}/status`, { status }).then((r) => r.data);

export const deleteLead = (id) =>
  api.delete(`/leads/${id}`).then((r) => r.data);

export const addNote = (id, text) =>
  api.post(`/leads/${id}/notes`, { text }).then((r) => r.data);

export const getStats = () =>
  api.get('/leads/stats').then((r) => r.data);

export const generateFollowup = (id) =>
  api.post(`/leads/${id}/followup`).then((r) => r.data);

export default api;
