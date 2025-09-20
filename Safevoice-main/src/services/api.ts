import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getMfaStatus: async () => {
    const response = await api.get('/auth/mfa-status');
    return response.data;
  },

  updateMfaStatus: async (status) => {
    const response = await api.put('/auth/mfa-status', { mfaEnabled: status });
    return response.data;
  },
};

export const incidentService = {
  createIncident: async (incidentData) => {
    const response = await api.post('/reports', incidentData);
    return response.data;
  },

  getIncidents: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  updateIncident: async (id, updateData) => {
    const response = await api.put(`/reports/${id}`, updateData);
    return response.data;
  },

  deleteIncident: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
};

export const evidenceService = {
  uploadEvidence: async (formData) => {
    const response = await api.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEvidence: async (incidentId) => {
    const response = await api.get(`/evidence/${incidentId}`);
    return response.data;
  },

  deleteEvidence: async (id) => {
    const response = await api.delete(`/evidence/${id}`);
    return response.data;
  },
};