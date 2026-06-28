import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';

export default function Badge({ label, type = 'default' }) {
  const getColors = () => {
    switch (type) {
      case 'income': return { bg: COLORS.incomeLight, text: COLORS.income };
      case 'expense': return { bg: COLORS.expenseLight, text: COLORS.expense };
      case 'paid': return { bg: COLORS.successLight, text: COLORS.success };
      case 'unpaid': return { bg: COLORS.warningLight, text: COLORS.warning };
      default: return { bg: 'rgba(255,255,255,0.1)', text: COLORS.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
});