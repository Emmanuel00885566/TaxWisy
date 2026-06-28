import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';

export default function Loader({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
  },
});