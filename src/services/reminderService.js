import api from '../utils/api';

const reminderService = {
  // Get all reminders for user
  getAll: async (userId) => {
    return await api(`/reminders/${userId}`);
  },

  // Update reminder preferences
  updatePreferences: async (data) => {
    return await api('/auth/preferences/reminders', 'PUT', data);
  },
};

export default reminderService;