import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary
  primary: '#00d4aa',
  primaryDark: '#00a884',
  primaryLight: 'rgba(0, 212, 170, 0.15)',

  // Background
  background: '#0a0a1a',
  card: '#12122a',
  cardDark: '#0d0d20',

  // Borders
  border: '#2a2a4a',
  borderLight: '#3a3a5a',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#555555',

  // Status
  income: '#00d4aa',
  incomeLight: 'rgba(0, 212, 170, 0.15)',
  expense: '#ff4d4d',
  expenseLight: 'rgba(255, 77, 77, 0.15)',
  warning: '#ffa500',
  warningLight: 'rgba(255, 165, 0, 0.15)',
  error: '#ff4d4d',
  errorLight: 'rgba(255, 77, 77, 0.15)',
  success: '#00d4aa',
  successLight: 'rgba(0, 212, 170, 0.15)',

  // Misc
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const FONTS = {
  thin: 'Manrope_200ExtraLight',
  light: 'Manrope_300Light',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

export const SIZES = {
  // Font sizes
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },

  // Screen dimensions
  width,
  height,
};

export const SHADOWS = {
  primary: {
    shadowColor: '#00d4aa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: '#00d4aa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
};