import api from '../utils/api';

const incomeExpenseService = {
  create: async (userId, data) => {
    return await api(`/income-expense/user/${userId}`, 'POST', data);
  },

  getAll: async (userId) => {
    return await api(`/income-expense/user/${userId}`);
  },

  getOne: async (userId, id) => {
    return await api(`/income-expense/${userId}/${id}`);
  },

  update: async (userId, id, data) => {
    return await api(`/income-expense/${userId}/${id}`, 'PUT', data);
  },

  delete: async (userId, id) => {
    return await api(`/income-expense/${userId}/${id}`, 'DELETE');
  },

  getSummary: async (userId) => {
    return await api(`/income-expense/user/${userId}/summary`);
  },
};

export default incomeExpenseService;