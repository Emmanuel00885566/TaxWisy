import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://tax-tracker-backend.onrender.com/api';

const authService = {
  // ==========================
  // AUTH
  // ==========================

  registerIndividual: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/sign_up/individual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          account_type: 'individual',
          annualIncomeRange:
            data.annualIncomeRange || '₦1,000,000 - ₦4,999,999',
          tax_reminder: true,
        }),
      });

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  registerBusiness: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/sign_up/business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          role: 'business',
          businessName: data.businessName,
          businessType:
            data.businessType || 'Limited Liability Company',
          tax_reminder: true,
        }),
      });

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  login: async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // ==========================
  // OTP
  // ==========================

  sendOTP: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/send_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  // ==========================
  // PROFILE
  // ==========================

  getIndividualProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `${BASE_URL}/auth/individual/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  getBusinessProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `${BASE_URL}/auth/business/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error('Network error. Please check your connection.');
    }
  },

  uploadAvatar: async (imageUri) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();

      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      const response = await fetch(
        `${BASE_URL}/auth/profile/avatar`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error('Failed to upload image.');
    }
  },

  // ==========================
  // STORAGE
  // ==========================

  saveToken: async (token, refreshToken = null) => {
    try {
      await AsyncStorage.setItem('token', token);

      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.log('Error saving token:', error);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      return null;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        'token',
        'refreshToken',
        'user',
      ]);
    } catch (error) {
      console.log('Logout Error:', error);
    }
  },
};

export default authService;