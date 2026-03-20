import api from './axios';

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  
  getUnread: () => api.get('/notifications/unread'),
  
  getUnreadCount: () => api.get('/notifications/count'),
  
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/read-all'),
};