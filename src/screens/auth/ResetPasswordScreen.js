import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../utils/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Header from '../../components/Header';

export default function ResetPasswordScreen({ navigation, route }) {
  const tokenFromLink = route?.params?.token || '';

  const [token, setToken] = useState(tokenFromLink);
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!token) newErrors.token = 'Reset token is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://tax-tracker-backend.onrender.com/api/auth/reset_password/${token}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: form.password,
            confirmPassword: form.confirmPassword,
          }),
        }
      );
      const result = await response.json();
      console.log('Reset result:', JSON.stringify(result));

      if (result.success) {
        setSuccess(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Reset Password 🔐"
        subtitle="Create a new password"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!success ? (
          <>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔒</Text>
            </View>

            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from your previous password.
            </Text>

            <View style={styles.formContainer}>
              {/* Show token input only if not coming from deep link */}
              {!tokenFromLink && (
                <Input
                  label="Reset Token"
                  placeholder="paste token from email"
                  value={token}
                  onChangeText={setToken}
                  icon="🔑"
                  error={errors.token}
                />
              )}

              <Input
                label="New Password"
                placeholder="enter new password"
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                secureTextEntry
                icon="🔒"
                error={errors.password}
              />

              <Input
                label="Confirm New Password"
                placeholder="confirm new password"
                value={form.confirmPassword}
                onChangeText={(text) =>
                  setForm({ ...form, confirmPassword: text })
                }
                secureTextEntry
                icon="🔒"
                error={errors.confirmPassword}
              />

              {/* Password strength hints */}
              <View style={styles.hints}>
                {[
                  {
                    label: 'At least 6 characters',
                    met: form.password.length >= 6,
                  },
                  {
                    label: 'Contains a number',
                    met: /\d/.test(form.password),
                  },
                  {
                    label: 'Passwords match',
                    met: form.password === form.confirmPassword &&
                      form.confirmPassword.length > 0,
                  },
                ].map((hint) => (
                  <View key={hint.label} style={styles.hint}>
                    <Text style={[
                      styles.hintDot,
                      { color: hint.met ? COLORS.primary : COLORS.textMuted },
                    ]}>
                      {hint.met ? '✓' : '○'}
                    </Text>
                    <Text style={[
                      styles.hintText,
                      { color: hint.met ? COLORS.primary : COLORS.textMuted },
                    ]}>
                      {hint.label}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                title="Reset Password"
                onPress={handleReset}
                loading={loading}
              />
            </View>

            {/* Manual token info */}
            {!tokenFromLink && (
              <View style={styles.infoBanner}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  Copy the token from the reset email and paste it above, then
                  enter your new password.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✅</Text>
            </View>

            <Text style={styles.successTitle}>Password Reset!</Text>
            <Text style={styles.successSubtitle}>
              Your password has been reset successfully. You can now login with
              your new password.
            </Text>

            <Button
              title="Go to Login"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.primary,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: SIZES.xxl,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  subtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.spacing.xl,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.lg,
  },
  hints: {
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.xs,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  hintDot: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    width: 20,
  },
  hintText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    gap: SIZES.spacing.sm,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SIZES.spacing.xxl,
    gap: SIZES.spacing.md,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.primary,
  },
  successEmoji: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: SIZES.xxxl,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SIZES.spacing.md,
  },
});