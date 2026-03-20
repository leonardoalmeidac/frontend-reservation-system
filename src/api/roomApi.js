import api from './axios';

export const roomApi = {
  getAll: () => api.get('/rooms'),
  
  getActive: () => api.get('/rooms/active'),
  
  getById: (id) => api.get(`/rooms/${id}`),
  
  create: (data) => api.post('/rooms', data),
  
  update: (id, data) => api.put(`/rooms/${id}`, data),
  
  delete: (id) => api.delete(`/rooms/${id}`),
  
  checkAvailability: (id, start, end) => 
    api.get(`/rooms/${id}/availability`, { params: { start, end } }),
};