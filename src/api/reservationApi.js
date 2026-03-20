import api from './axios';

export const reservationApi = {
  getAll: () => api.get('/reservations'),
  
  getMy: () => api.get('/reservations/my'),
  
  getById: (id) => api.get(`/reservations/${id}`),
  
  getCalendar: (startDate, endDate) => 
    api.get('/reservations/calendar', { params: { startDate, endDate } }),
  
  getPending: () => api.get('/reservations/pending'),
  
  create: (data) => api.post('/reservations', data),
  
  approve: (id) => api.post(`/reservations/${id}/approve`),
  
  reject: (id, notes) => api.post(`/reservations/${id}/reject`, { notes }),
  
  requestInfo: (id, notes) => api.post(`/reservations/${id}/request-info`, { notes }),
  
  cancel: (id) => api.delete(`/reservations/${id}`),
};