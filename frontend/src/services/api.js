import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (!error.response) {
      error.message = error.message || 'Network error';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'avatar' && data[key]) {
        formData.append('avatar', data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Complaint API
export const complaintAPI = {
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/complaints', data);
    }

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && data[key]) {
        data[key].forEach(file => formData.append('attachments', file));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });

    return api.post('/complaints', formData);
  },
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  assign: (id, data) => api.put(`/complaints/${id}/assign`, data),
  resolve: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/complaints/${id}/resolve`, data);
    }

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'images' && data[key]) {
        data[key].forEach(file => formData.append('images', file));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/complaints/${id}/resolve`, formData);
  },
  submitFeedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
  getByLocation: (params) => api.get('/complaints/location', { params })
};

// Department API
export const departmentAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  addStaff: (id, data) => api.post(`/departments/${id}/staff`, data),
  removeStaff: (id, data) => api.delete(`/departments/${id}/staff`, { data }),
  getWorkload: (id) => api.get(`/departments/${id}/workload`)
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: (id) => api.get(`/users/stats/${id || ''}`)
};

// Chat API
export const chatAPI = {
  getMessages: (complaintId) => api.get(`/chat/${complaintId}`),
  sendMessage: (complaintId, data) => {
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.attachments) {
      data.attachments.forEach(file => formData.append('attachments', file));
    }
    return api.post(`/chat/${complaintId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrend: (params) => api.get('/analytics/trend', { params })
};

export default api;




