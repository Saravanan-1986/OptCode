import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codeopt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Only clear if on protected request
      const path = error.config.url || '';
      if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
        localStorage.removeItem('codeopt_token');
        localStorage.removeItem('codeopt_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, email, password, confirmPassword });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  }
};

export const compilerService = {
  compile: async (sourceCode, projectId = null, projectName = null, saveHistory = true) => {
    const res = await api.post('/compiler/compile', {
      sourceCode,
      projectId,
      projectName,
      saveHistory
    });
    return res.data;
  }
};

export const projectService = {
  getAll: async () => {
    const res = await api.get('/projects');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
  duplicate: async (id) => {
    const res = await api.post(`/projects/${id}/duplicate`);
    return res.data;
  }
};

export const historyService = {
  getAll: async () => {
    const res = await api.get('/history');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/history/${id}`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  },
  clear: async () => {
    const res = await api.delete('/history');
    return res.data;
  }
};

export const statsService = {
  getDashboardStats: async () => {
    const res = await api.get('/stats/dashboard');
    return res.data;
  }
};

export default api;
