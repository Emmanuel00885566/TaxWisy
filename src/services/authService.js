import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tax-tracker-backend.onrender.com/api';

const authService = {
  // Register Individual
  registerIndividual: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/sign_up/individual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          account_type: 'individual',
          annualIncomeRange: data.annualIncomeRange || '₦1,000,000 - ₦4,999,999',
          tax_reminder: true,
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Register Business
  registerBusiness: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/sign_up/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          role: 'business',
          businessName: data.businessName,
          businessType: data.businessType || 'Limited Liability Company',
          tax_reminder: true,
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Login
login: async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/sign_in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    throw new Error('Network error. Please check your connection.');
  }
},

saveToken: async (token, refreshToken) => {
  try {
    await AsyncStorage.setItem('token', token);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
  } catch (error) {
    console.log('Error saving token:', error);
  }
},

  // Send OTP
  sendOTP: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/send_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Get individual profile
  getIndividualProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/individual/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Get business profile
  getBusinessProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/business/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Get token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      return null;
    }
  },

  // Save token
  saveToken: async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.log('Error saving token:', error);
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken')
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.log('Error during logout:', error);
    }
  },
};

export default authService;