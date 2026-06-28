import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';

export default function Header({ title, subtitle, onBack, rightAction }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress}>
          <Text style={styles.rightAction}>{rightAction.icon}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: 60,
    paddingBottom: SIZES.spacing.md,
    backgroundColor: COLORS.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backIcon: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  rightAction: {
    fontSize: SIZES.xl,
  },
});