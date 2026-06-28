import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Hold for a moment
      Animated.delay(1000),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <LinearGradient
      colors={['#0a0a1a', '#0d1f1a', '#0a0a1a']}
      style={styles.container}
    >
      {/* Glow effect behind logo */}
      <View style={styles.glowContainer}>
        <View style={styles.glow} />
      </View>

      {/* Logo */}
<Animated.Image
  source={require('../../assets/logo.jpg')}
  style={[
    styles.logo,
    {
      opacity: logoOpacity,
      transform: [{ scale: logoScale }],
    },
  ]}
  resizeMode="contain"
/>


      {/* App Name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        Tax Tracker
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your smart Nigerian tax companion 🇳🇬
      </Animated.Text>

      {/* Bottom text */}
      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Powered by Nigerian Tax Law</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  // logoContainer: {
  //   width: 120,
  //   height: 120,
  //   marginBottom: SIZES.spacing.md,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  logo: {
    width: 150,
    height: 150,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.xl,
  },
  appName: {
    fontSize: SIZES.display,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: SIZES.spacing.sm,
  },
  tagline: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: 40,
  },
  bottomText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
  },
});