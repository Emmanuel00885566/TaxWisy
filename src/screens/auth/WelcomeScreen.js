import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../utils/theme';
import Button from '../../components/Button';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>₦</Text>
      </View>

      <Text style={styles.title}>Tax Tracker</Text>
      <Text style={styles.subtitle}>
        Smart tax management for{'\n'}Nigerians, built for Nigerians 🇳🇬
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
        />
        <Button
          title="I already have an account"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
        />
      </View>

      <Text style={styles.footer}>Powered by Nigerian Tax Law 📋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.lg,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.glow,
  },
  logo: {
    fontSize: 42,
    fontFamily: FONTS.extraBold,
    color: COLORS.background,
  },
  title: {
    fontSize: SIZES.display,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
    gap: SIZES.spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
});