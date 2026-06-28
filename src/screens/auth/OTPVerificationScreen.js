import { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import Button from '../../components/Button';
import Header from '../../components/Header';

export default function OTPVerificationScreen({ navigation, route }) {
  const { email } = route.params;
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

 const handleVerify = async () => {
  const otpCode = otp.join('');
  if (otpCode.length < 6) {
    Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
    return;
  }

  setLoading(true);
  try {
    const result = await authService.verifyOTP(email, otpCode);
    console.log('🔐 OTP verify result:', JSON.stringify(result));

    if (result.success || result.token) {
      if (result.token) {
        await authService.saveToken(result.token);
        await login(result.user || { email });
      } else {
        Alert.alert('Success! 🎉', 'Account verified! Please log in.');
        navigation.replace('Login');
      }
    } else {
      Alert.alert('Invalid OTP', result.message || 'Please try again');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};

  const handleResend = async () => {
  setResending(true);
  try {
    const result = await authService.sendOTP(email);
    console.log('Resend OTP result:', JSON.stringify(result));
    Alert.alert('OTP Sent ✅', 'A new OTP has been sent to your email');
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setResending(false);
  }
};

  return (
    <View style={styles.container}>
      <Header
        title="Verify Email 📬"
        subtitle={`OTP sent to ${email}`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        <Text style={styles.title}>Enter OTP Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit verification code to your email. Enter it below to
          verify your account.
        </Text>

        {/* OTP Input boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Verify Account"
          onPress={handleVerify}
          loading={loading}
        />

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.md,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.lg,
    alignItems: 'center',
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.bold,
  },
});