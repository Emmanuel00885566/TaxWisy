import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    try {
      const { password, otpCode, otpExpiresAt, ...safeUser } = userData;
      const normalizedUser = {
        ...safeUser,
        userId: safeUser.id,
        role: safeUser.account_type,
      };
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    } catch (error) {
      console.log('Error saving user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.log('Error removing user:', error);
    }
  };

  const handleSessionExpired = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, handleSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
}