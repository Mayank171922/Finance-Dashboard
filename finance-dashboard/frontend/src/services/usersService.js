import api from './api';

export const usersService = {
  getAll: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/users', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/users/${id}`, payload);
    return res.data;
  },

  toggleStatus: async (id) => {
    await api.patch(`/users/${id}/toggle-status`);
  },

  delete: async (id) => {
    await api.delete(`/users/${id}`);
  },
};
