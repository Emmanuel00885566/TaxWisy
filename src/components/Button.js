import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../utils/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.background}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'outline' && styles.outlineText,
            variant === 'secondary' && styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.primary,
  },
  secondary: {
    backgroundColor: COLORS.card,
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.background,
    letterSpacing: 0.5,
  },
  outlineText: {
    color: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
});