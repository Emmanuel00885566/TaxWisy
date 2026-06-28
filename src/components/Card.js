import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

export default function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.sm,
    ...SHADOWS.card,
  },
});