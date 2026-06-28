import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error = null,
  icon = null,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.errorBorder,
      ]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggle}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SIZES.spacing.md,
    width: '100%',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    marginBottom: SIZES.spacing.xs,
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.spacing.md,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  icon: {
    fontSize: SIZES.md,
    marginRight: SIZES.spacing.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    paddingVertical: SIZES.spacing.md,
    fontFamily: FONTS.regular,
  },
  toggle: {
    fontSize: SIZES.md,
    paddingLeft: SIZES.spacing.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.xs,
    marginTop: SIZES.spacing.xs,
    fontFamily: FONTS.regular,
  },
});