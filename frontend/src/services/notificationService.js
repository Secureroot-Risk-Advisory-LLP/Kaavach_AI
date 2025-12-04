// frontend/src/services/notificationService.js
import api from './api';

export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  markRead: (id) => api.post(`/notifications/read/${id}`),
  markAllRead: () => api.post('/notifications/read-all'),
};
