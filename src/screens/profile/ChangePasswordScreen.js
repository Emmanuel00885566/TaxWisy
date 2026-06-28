import { useState, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Header from '../../components/Header';
import api from '../../utils/api';

export default function ChangePasswordScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.oldPassword) newErrors.oldPassword = 'Current password is required';
    if (!form.newPassword) newErrors.newPassword = 'New password is required';
    else if (form.newPassword.length < 6)
      newErrors.newPassword = 'Password must be at least 6 characters';
    if (!form.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (form.oldPassword === form.newPassword)
      newErrors.newPassword = 'New password must be different from current password';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await api('/auth/users/change_password', 'PATCH', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      console.log('Change password result:', JSON.stringify(result));

      if (result.success) {
        Alert.alert(
          'Password Changed! ✅',
          'Your password has been changed successfully. Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logout();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to change password');
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
        title="Change Password 🔐"
        subtitle="Update your account password"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔒</Text>
        </View>

        <Text style={styles.title}>Update Password</Text>
        <Text style={styles.subtitle}>
          Enter your current password and choose a new one.
        </Text>

        <View style={styles.formContainer}>
          <Input
            label="Current Password"
            placeholder="enter current password"
            value={form.oldPassword}
            onChangeText={(text) => setForm({ ...form, oldPassword: text })}
            secureTextEntry
            icon="🔑"
            error={errors.oldPassword}
          />

          <Input
            label="New Password"
            placeholder="enter new password"
            value={form.newPassword}
            onChangeText={(text) => setForm({ ...form, newPassword: text })}
            secureTextEntry
            icon="🔒"
            error={errors.newPassword}
          />

          <Input
            label="Confirm New Password"
            placeholder="confirm new password"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry
            icon="🔒"
            error={errors.confirmPassword}
          />

          {/* Password strength hints */}
          <View style={styles.hints}>
            {[
              {
                label: 'At least 6 characters',
                met: form.newPassword.length >= 6,
              },
              {
                label: 'Contains a number',
                met: /\d/.test(form.newPassword),
              },
              {
                label: 'Passwords match',
                met:
                  form.newPassword === form.confirmPassword &&
                  form.confirmPassword.length > 0,
              },
              {
                label: 'Different from current password',
                met:
                  form.oldPassword !== form.newPassword &&
                  form.newPassword.length > 0,
              },
            ].map((hint) => (
              <View key={hint.label} style={styles.hint}>
                <Text
                  style={[
                    styles.hintDot,
                    { color: hint.met ? COLORS.primary : COLORS.textMuted },
                  ]}
                >
                  {hint.met ? '✓' : '○'}
                </Text>
                <Text
                  style={[
                    styles.hintText,
                    { color: hint.met ? COLORS.primary : COLORS.textMuted },
                  ]}
                >
                  {hint.label}
                </Text>
              </View>
            ))}
          </View>

          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={loading}
          />
        </View>

        {/* Warning */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            You will be logged out after changing your password and will need
            to login again with your new password.
          </Text>
        </View>
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warningLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '44',
    gap: SIZES.spacing.sm,
  },
  warningIcon: {
    fontSize: 18,
  },
  warningText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
});