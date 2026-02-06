/**
 * API Service
 * Centralized API calls using Axios with automatic token refresh
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and automatic token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      const currentPath = window.location.pathname;
      
      // Don't refresh on login/register pages or if no refresh token
      if (currentPath === '/login' || currentPath === '/register' || !refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        
        const { token, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('token', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        
        processQueue(null, token);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  facultyLogin: (credentials) => api.post('/auth/faculty-login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  verifyToken: () => api.post('/auth/verify-token'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  // Admin only
  getAllUsers: () => api.get('/auth/users'),
  updateUserRole: (userId, role) => api.put(`/auth/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`)
};

// ============================================================
// FACULTY API
// ============================================================
export const facultyApi = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  bulkCreate: (data) => api.post('/faculty/bulk', { faculty: data }),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`)
};

// ============================================================
// ROOMS API
// ============================================================
export const roomsApi = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  bulkCreate: (data) => api.post('/rooms/bulk', { rooms: data }),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`)
};

// ============================================================
// SUBJECTS API
// ============================================================
export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  bulkCreate: (data) => api.post('/subjects/bulk', { subjects: data }),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

// ============================================================
// CLASSES API
// ============================================================
export const classesApi = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  bulkCreate: (data) => api.post('/classes/bulk', { classes: data }),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`)
};

// ============================================================
// TIMETABLE API
// ============================================================
export const timetableApi = {
  generate: (data = {}) => api.post('/generate-timetable', data),
  getActive: () => api.get('/timetable'),
  getById: (id) => api.get(`/timetable/${id}`),
  getAll: () => api.get('/timetables'),
  getClassGrid: (classId) => api.get(`/timetable/class/${classId}/grid`),
  getFacultySchedule: (facultyId) => api.get(`/timetable/faculty/${facultyId}`),
  delete: (id) => api.delete(`/timetable/${id}`)
};

// ============================================================
// HEALTH CHECK
// ============================================================
export const healthCheck = () => api.get('/health');

export default api;
