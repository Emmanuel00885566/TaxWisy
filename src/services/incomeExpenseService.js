import api from '../utils/api';

const incomeExpenseService = {
  create: async (userId, data) => {
    return await api(`/income-expense/user/${userId}`, 'POST', data);
  },

  getAll: async (userId, page = 0, limit = 10) => {
  const offset = page * limit;
  return await api(`/income-expense/user/${userId}?limit=${limit}&offset=${offset}`);
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