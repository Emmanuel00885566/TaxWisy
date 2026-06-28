import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES } from '../../utils/theme';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../../assets/onboarding1.png'),
    title: 'Know Where Your\nMoney Goes',
    subtitle:
      'Record every income and expense in seconds. Stay on top of your finances all year round.',
    accent: '#00d4aa',
  },
  {
    id: '2',
    image: require('../../assets/onboarding2.png'),
    title: 'Never Miss Your\nTax Deadline',
    subtitle:
      'We automatically calculate your CIT or PIT based on Nigerian tax laws. No accountant needed.',
    accent: '#00b8d9',
  },
  {
    id: '3',
    image: require('../../assets/onboarding3.jpg'),
    title: 'Reports &\nSmart Reminders',
    subtitle:
      'Download your tax summary as PDF or CSV and get reminded before every filing deadline.',
    accent: '#7c3aed',
  },
];

const Slide = ({ item }) => (
  <View style={styles.slide}>
    {/* Image */}
    <View style={styles.imageContainer}>
      <View style={[styles.imageGlow, { backgroundColor: item.accent }]} />
      <Image
        source={item.image}
        style={styles.image}
        resizeMode="contain"
      />
    </View>

    {/* Text */}
    <View style={styles.textContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  </View>
);

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as done
      await AsyncStorage.setItem('onboarded', 'true');
      navigation.replace('Welcome');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    navigation.replace('Welcome');
  };

  const Dots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
                backgroundColor: slides[currentIndex].accent,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient
      colors={['#0a0a1a', '#0d0d20', '#0a0a1a']}
      style={styles.container}
    >
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        <Dots />

        <View style={styles.buttonContainer}>
          <Button
            title={currentIndex === slides.length - 1 ? "Let's Get Started 🚀" : 'Next'}
            onPress={handleNext}
          />
        </View>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Welcome')}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Log In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: SIZES.spacing.lg,
    zIndex: 10,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.lg,
  },
  imageContainer: {
    width: width * 0.75,
    height: height * 0.38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  imageGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.08,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: SIZES.spacing.md,
  },
  subtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: 48,
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: SIZES.radius.full,
  },
  buttonContainer: {
    width: '100%',
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
  },
  loginLink: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
});