import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  google: (data: { email: string; name: string; image?: string }) =>
    api.post('/auth/google', data),
  me: () => api.get('/auth/me'),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string; image?: string }) =>
    api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const businessApi = {
  get: () => api.get('/business'),
  update: (data: any) => api.post('/business', data),
  connectWhatsApp: (data: { phoneNumber: string; token: string }) =>
    api.post('/business/connect-whatsapp', data),
  disconnectWhatsApp: () => api.post('/business/disconnect-whatsapp'),
};

export const leadsApi = {
  getAll: (params?: { search?: string; status?: string; tag?: string }) =>
    api.get('/leads', { params }),
  create: (data: { name?: string; phone: string; email?: string; tags?: string[] }) =>
    api.post('/leads', data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  export: () => api.get('/leads/export', { responseType: 'blob' }),
};

export const messagesApi = {
  getAll: (leadId: string) => api.get(`/messages/${leadId}`),
  send: (data: { leadId: string; content: string }) => api.post('/messages', data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

export const appointmentsApi = {
  getAll: (params?: { date?: string }) =>
    api.get('/appointments', { params }),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const subscriptionsApi = {
  get: () => api.get('/subscriptions'),
  upgrade: (data: { plan: string; paymentMethod: string }) =>
    api.post('/subscriptions/upgrade', data),
  cancel: () => api.post('/subscriptions/cancel'),
};

export const analyticsApi = {
  get: (params?: { period?: string }) =>
    api.get('/analytics', { params }),
};

export const whatsappApi = {
  getStatus: () => api.get('/whatsapp/status'),
  updateSettings: (data: any) => api.post('/whatsapp/settings', data),
  toggleAI: (enabled: boolean) => api.post('/whatsapp/toggle', { enabled }),
  sendMessage: (to: string, text: string) => api.post('/whatsapp/send', { to, text }),
};

export default api;