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
import authService from '../../services/authService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Header from '../../components/Header';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      console.log('Forgot password result:', JSON.stringify(result));
      if (result.success) {
        setSent(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to send reset email');
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
        title="Forgot Password 🔐"
        subtitle="We'll send a reset link to your email"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!sent ? (
          <>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔑</Text>
            </View>

            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address and we'll send you a link to
              reset your password.
            </Text>

            <View style={styles.formContainer}>
              <Input
                label="Email Address"
                placeholder="enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                icon="📧"
                error={error}
              />

              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Check your spam folder if you don't see the email within a few
                minutes.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Success State */}
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>📬</Text>
              </View>

              <Text style={styles.successTitle}>Email Sent! 🎉</Text>
              <Text style={styles.successSubtitle}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <View style={styles.stepsCard}>
                <Text style={styles.stepsTitle}>Next steps:</Text>
                {[
                  'Check your email inbox',
                  'Click the reset link in the email',
                  'Create your new password',
                  'Login with your new password',
                ].map((step, index) => (
                  <View key={index} style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <Button
                title="Back to Login"
                onPress={() => navigation.navigate('Login')}
              />

              <Button
                title="Resend Email"
                variant="outline"
                onPress={() => {
                  setSent(false);
                  handleSubmit();
                }}
              />
            </View>
          </>
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
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
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
    paddingTop: SIZES.spacing.xl,
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
  },
  emailHighlight: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  stepsCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginBottom: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  stepsTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  stepNumberText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.bold,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    flex: 1,
  },
});