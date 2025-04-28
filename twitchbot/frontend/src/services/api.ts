import axios from 'axios';
import { store } from '../store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string, username: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

export const analyticsAPI = {
  getStreamMetrics: async (params: any) => {
    const response = await api.get('/analytics/twitch/streams', { params });
    return response.data;
  },
  getChatMetrics: async (params: any) => {
    const response = await api.get('/analytics/twitch/chat', { params });
    return response.data;
  },
  getDiscordMetrics: async (params: any) => {
    const response = await api.get('/analytics/discord/messages', { params });
    return response.data;
  },
};

export const botAPI = {
  getBots: async () => {
    const response = await api.get('/bots');
    return response.data;
  },
  createCommand: async (data: any) => {
    const response = await api.post('/bots/commands', data);
    return response.data;
  },
  updateCommand: async (id: string, data: any) => {
    const response = await api.put(`/bots/commands/${id}`, data);
    return response.data;
  },
  deleteCommand: async (id: string) => {
    const response = await api.delete(`/bots/commands/${id}`);
    return response.data;
  },
};

export default api; 