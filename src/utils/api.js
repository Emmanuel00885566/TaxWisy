import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tax-tracker-backend.onrender.com/api';

const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(`${BASE_URL}/auth/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (result.success && result.token) {
      await AsyncStorage.setItem('token', result.token);
      console.log('✅ Token refreshed successfully');
      return result.token;
    }
    return null;
  } catch (error) {
    console.log('Token refresh failed:', error);
    return null;
  }
};

const api = async (endpoint, method = 'GET', body = null, retry = true) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();

    // If token expired, try to refresh and retry once
    if ((response.status === 401 || response.status === 403) && retry) {
      console.log('🔄 Token expired, attempting refresh...');
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry with new token
        return api(endpoint, method, body, false);
      } else {
        // Refresh failed — clear storage and force logout
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        throw new Error('SESSION_EXPIRED');
      }
    }

    return result;
  } catch (error) {
    if (error.message === 'SESSION_EXPIRED') throw error;
    throw new Error('Network error. Please check your connection.');
  }
};

export default api;