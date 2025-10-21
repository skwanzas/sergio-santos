import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token a todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail);
    } else {
      toast.error('Erro ao processar requisição');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = response.data;
    localStorage.setItem('token', access_token);

    // Buscar dados do usuário
    const userResponse = await api.get('/api/v1/auth/me');
    localStorage.setItem('user', JSON.stringify(userResponse.data));

    return userResponse.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
};

// Agents endpoints
export const agents = {
  // Orchestrator
  runOrchestrator: async (payload) => {
    const response = await api.post('/api/v1/agents/orchestrator/run', payload);
    return response.data;
  },

  // Market Research
  runMarketResearch: async (payload) => {
    const response = await api.post('/api/v1/agents/market-research/run', payload);
    return response.data;
  },

  // Copywriter
  runCopywriter: async (payload) => {
    const response = await api.post('/api/v1/agents/copywriter/run', payload);
    return response.data;
  },

  // Tasks
  getTask: async (taskId) => {
    const response = await api.get(`/api/v1/agents/task/${taskId}`);
    return response.data;
  },

  listTasks: async (params) => {
    const response = await api.get('/api/v1/agents/tasks', { params });
    return response.data;
  },
};

// Products endpoints
export const products = {
  list: async (params) => {
    const response = await api.get('/api/v1/products/', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/api/v1/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/api/v1/products/', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/api/v1/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/v1/products/${id}`);
  },
};

export default api;
