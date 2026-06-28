import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import authService from '../../services/authService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Header from '../../components/Header';

export default function RegisterScreen({ navigation }) {
  const [accountType, setAccountType] = useState('individual');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'Limited Liability Company',
    annualIncomeRange: '₦1,000,000 - ₦4,999,999',
  });

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.fullname) newErrors.fullname = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Enter a valid email';
    if (accountType === 'business' && !form.businessName)
      newErrors.businessName = 'Business name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
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

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

const handleRegister = async () => {
  if (!validateStep2()) return;

  setLoading(true);
  try {
    const result =
      accountType === 'individual'
        ? await authService.registerIndividual(form)
        : await authService.registerBusiness(form);

    console.log('Register result:', JSON.stringify(result));

    if (result.success || result.data) {
      // OTP already sent by backend automatically — just navigate
      navigation.navigate('OTPVerification', { email: form.email });
    } else {
      Alert.alert(
        'Registration Failed',
        result.message || 'Please try again'
      );
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
        title="Create Account 🚀"
        subtitle={`Step ${step} of 2 — ${step === 1 ? 'Your Details' : 'Set Password'}`}
        onBack={() => (step === 1 ? navigation.goBack() : setStep(1))}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Account Type Toggle */}
        {step === 1 && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                accountType === 'individual' && styles.toggleActive,
              ]}
              onPress={() => setAccountType('individual')}
            >
              <Text style={styles.toggleIcon}>👤</Text>
              <Text
                style={[
                  styles.toggleText,
                  accountType === 'individual' && styles.toggleTextActive,
                ]}
              >
                Individual
              </Text>
              <Text style={styles.toggleSub}>Personal Income Tax</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                accountType === 'business' && styles.toggleActive,
              ]}
              onPress={() => setAccountType('business')}
            >
              <Text style={styles.toggleIcon}>🏢</Text>
              <Text
                style={[
                  styles.toggleText,
                  accountType === 'business' && styles.toggleTextActive,
                ]}
              >
                Business
              </Text>
              <Text style={styles.toggleSub}>Company Income Tax</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1 — Personal Details */}
        {step === 1 && (
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="enter your full name"
              value={form.fullname}
              onChangeText={(text) => updateForm('fullname', text)}
              icon="👤"
              error={errors.fullname}
            />

            <Input
              label="Email Address"
              placeholder="enter your email"
              value={form.email}
              onChangeText={(text) => updateForm('email', text)}
              keyboardType="email-address"
              icon="📧"
              error={errors.email}
            />

            {accountType === 'business' && (
              <Input
                label="Business Name"
                placeholder="enter your business name"
                value={form.businessName}
                onChangeText={(text) => updateForm('businessName', text)}
                icon="🏢"
                error={errors.businessName}
              />
            )}

            <Button title="Continue" onPress={handleNext} />
          </View>
        )}

        {/* Step 2 — Password */}
        {step === 2 && (
          <View style={styles.formContainer}>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>
                {accountType === 'individual' ? '👤' : '🏢'}
              </Text>
              <View>
                <Text style={styles.summaryName}>{form.fullname}</Text>
                <Text style={styles.summaryEmail}>{form.email}</Text>
                <Text style={styles.summaryType}>
                  {accountType === 'individual'
                    ? 'Individual (PIT)'
                    : `Business (CIT) — ${form.businessName}`}
                </Text>
              </View>
            </View>

            <Input
              label="Password"
              placeholder="create a strong password"
              value={form.password}
              onChangeText={(text) => updateForm('password', text)}
              secureTextEntry
              icon="🔒"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="confirm your password"
              value={form.confirmPassword}
              onChangeText={(text) => updateForm('confirmPassword', text)}
              secureTextEntry
              icon="🔒"
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
            />
          </View>
        )}

        {/* Login link */}
        <TouchableOpacity
          style={styles.loginContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.lg,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  toggleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  toggleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toggleText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  toggleSub: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
  },
  summaryIcon: {
    fontSize: 32,
  },
  summaryName: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
  summaryEmail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  summaryType: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.semiBold,
    marginTop: 2,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  loginLink: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});