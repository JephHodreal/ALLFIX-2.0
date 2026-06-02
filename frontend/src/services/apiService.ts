import axios from 'axios';
import { getIdToken } from './firebaseService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Axios instance configured with base URL and Firebase auth token interceptor.
 * All API calls to Spring Boot go through this instance.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: 10 * 1024 * 1024, // 10MB for image uploads
  maxBodyLength: 10 * 1024 * 1024,
});

// Request interceptor: attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored auth state and redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
