import { useState, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Header from '../../components/Header';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authService.login(form);
      // console.log('🔐 Full login response:', JSON.stringify(result));

      if (result.success && result.data) {
        const { token, refreshToken, password, otpCode, otpExpiresAt, ...userData } = result.data;
        // console.log('👤 User data being saved:', JSON.stringify(userData));
        await authService.saveToken(token, refreshToken);
        await login(userData);
      } else {
        Alert.alert(
          'Login Failed',
          result.message || 'Invalid email or password'
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
        title="Welcome Back 👋"
        subtitle="Login to your Tax Tracker account"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Input
            label="Email Address"
            placeholder="enter your email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            icon="📧"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="enter your password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
            icon="🔒"
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🇳🇬</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Nigerian Tax Compliant</Text>
            <Text style={styles.bannerSubtitle}>
              CIT & PIT calculations based on FIRS guidelines
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.registerContainer}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerLink}>Create one</Text>
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
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.lg,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.spacing.md,
    marginTop: -SIZES.spacing.sm,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    gap: SIZES.spacing.sm,
  },
  bannerIcon: {
    fontSize: 28,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  registerLink: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});