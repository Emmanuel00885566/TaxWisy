import api from '../utils/api';

const dashboardService = {
  getSummary: async (userId) => {
    return await api(`/dashboard/summary/${userId}`);
  },
};

export default dashboardService;