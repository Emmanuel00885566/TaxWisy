import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

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

    const CLOUD_NAME = 'dkb9g9jib';
    const UPLOAD_PRESET = 'taxwisy_avatars';

    console.log('☁️ Uploading to Cloudinary...');

    const uploadResult = await FileSystem.uploadAsync(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      imageUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        parameters: {
          upload_preset: UPLOAD_PRESET,
          folder: 'taxwisy/avatars',
        },
      }
    );

    const cloudinaryResult = JSON.parse(uploadResult.body);
    console.log('☁️ Cloudinary result:', JSON.stringify(cloudinaryResult));

    if (!cloudinaryResult.secure_url) {
      throw new Error(cloudinaryResult.error?.message || 'Upload failed');
    }

    const imageUrl = cloudinaryResult.secure_url;

    const backendResponse = await fetch(
      'https://tax-tracker-backend.onrender.com/api/auth/profile/avatar',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: imageUrl }),
      }
    );

    const result = await backendResponse.json();
    console.log('📤 Backend result:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.log('📤 Upload error:', error.message);
    throw new Error(error.message || 'Failed to upload image.');
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