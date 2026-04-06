import api from './api';

export const recordsService = {
  getAll: async (params = {}) => {
    const res = await api.get('/records', { params });
    return res.data; // PagedResponse<FinancialRecordResponse>
  },

  getById: async (id) => {
    const res = await api.get(`/records/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/records', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/records/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/records/${id}`);
  },
};
