import api from '../utils/api';

const taxService = {
  // Compute tax - needs full body
  compute: async (userId, data) => {
    return await api(`/tax/compute/${userId}`, 'POST', data);
  },

  // Get all tax records
  getRecords: async (userId) => {
    return await api(`/tax/records/${userId}`);
  },

  // Get tax summary
  getSummary: async (userId) => {
    return await api(`/tax/summary/${userId}`);
  },

  // Mark tax as paid
  markPaid: async (userId, taxId, data) => {
    return await api(`/tax/mark-paid/${userId}/${taxId}`, 'PATCH', data);
  },
};

export default taxService;