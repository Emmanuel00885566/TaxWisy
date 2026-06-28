import api from '../utils/api';

const reportService = {
  // Download report
  download: async (format = 'pdf', type = 'summary', from, to) => {
    return await api(
      `/report/download?format=${format}&type=${type}&from=${from}&to=${to}`
    );
  },
};

export default reportService;