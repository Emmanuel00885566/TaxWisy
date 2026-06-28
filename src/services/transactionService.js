import api from '../utils/api';

const transactionService = {
  // Get all transactions
  getAll: async (userId) => {
    return await api(`/transactions/${userId}`);
  },

  // Get single transaction
  getOne: async (userId, transactionId) => {
    return await api(`/transactions/${userId}/${transactionId}`);
  },

  // Add transaction
  add: async (userId, data) => {
    return await api(`/transactions/${userId}`, 'POST', data);
  },

  // Update transaction
  update: async (userId, transactionId, data) => {
    return await api(`/transactions/${userId}/${transactionId}`, 'PUT', data);
  },

  // Delete transaction
  delete: async (userId, transactionId) => {
    return await api(`/transactions/${userId}/${transactionId}`, 'DELETE');
  },
};

export default transactionService;