import { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import { TransactionContext } from '../../context/TransactionContext';
import authService from '../../services/authService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { sendTestNotification, scheduleTaxReminder } from '../../utils/notifications';

export default function ProfileScreen({ navigation }) {
  const { user, logout, login } = useContext(AuthContext);
  const { summary } = useContext(TransactionContext);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isBusinessUser = user?.account_type === 'business';

  const formatAmount = (amt) =>
    `₦${Number(amt || 0).toLocaleString('en-NG')}`;

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload a profile picture.'
        );
        return;
      }

      Alert.alert(
        'Update Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: '📷 Take Photo',
            onPress: async () => {
              const { status: cameraStatus } =
                await ImagePicker.requestCameraPermissionsAsync();
              if (cameraStatus !== 'granted') return;

              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled) {
                await handleUpload(result.assets[0].uri);
              }
            },
          },
          {
            text: '🖼️ Choose from Gallery',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled) {
                await handleUpload(result.assets[0].uri);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async (imageUri) => {
    setUploadingAvatar(true);
    try {
      const result = await authService.uploadAvatar(imageUri);
      if (result.success) {
        // Update user in context with new avatar
        const updatedUser = { ...user, avatar: result.data.avatar };
        await login(updatedUser);
        Alert.alert('Success! ✅', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await authService.logout();
              await logout();
            } catch (error) {
              console.log('Logout error:', error);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: '🔔',
      label: 'Tax Reminders',
      sub: user?.tax_reminder ? 'Enabled' : 'Disabled',
      onPress: () => {
        Alert.alert(
          'Tax Reminders',
          'Would you like to schedule tax deadline reminders?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send Test Now',
              onPress: async () => {
                await sendTestNotification();
                Alert.alert('✅ Done', 'You will receive a test notification in 3 seconds!');
              },
            },
            {
              text: 'Schedule All',
              onPress: async () => {
                await scheduleTaxReminder(7);
                Alert.alert('✅ Done', 'Tax deadline reminders scheduled!');
              },
            },
          ]
        );
      },
    },
    {
      icon: '🔒',
      label: 'Change Password',
      sub: 'Update your password',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      icon: '📋',
      label: 'Tax Information',
      sub: isBusinessUser ? 'Company Income Tax (CIT)' : 'Personal Income Tax (PIT)',
      onPress: () => Alert.alert(
        isBusinessUser ? 'CIT Info' : 'PIT Info',
        isBusinessUser
          ? '20% for turnover below ₦100M\n30% for ₦100M and above'
          : 'Progressive tax brackets from 7% to 24% based on annual income per Nigeria PIT Act'
      ),
    },
    {
      icon: '📞',
      label: 'Support',
      sub: 'Get help with TaxBuddy',
      onPress: () => Alert.alert('Support', 'Contact us at support@taxbuddy.ng'),
    },
    {
      icon: '⚖️',
      label: 'Legal & Privacy',
      sub: 'Terms of service and privacy policy',
      onPress: () => Alert.alert('Legal', 'TaxBuddy complies with FIRS guidelines and Nigerian tax law.'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Profile"
        subtitle="Your account details"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <View style={styles.avatar}>
                <ActivityIndicator color={COLORS.background} size="large" />
              </View>
            ) : user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
            <View style={styles.profileGlow} />
          </TouchableOpacity>

          <Text style={styles.fullname}>{user?.fullname}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <Badge
              label={isBusinessUser ? 'Business (CIT)' : 'Individual (PIT)'}
              type={user?.isVerified ? 'paid' : 'unpaid'}
            />
            {user?.isVerified && (
              <Badge label="✓ Verified" type="paid" />
            )}
          </View>

          {user?.tin && (
            <View style={styles.tinRow}>
              <Text style={styles.tinLabel}>TIN:</Text>
              <Text style={styles.tinValue}>{user.tin}</Text>
            </View>
          )}

          <Text style={styles.tapToChange}>Tap photo to change</Text>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Financial Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statAmount, { color: COLORS.income }]}>
                {formatAmount(summary?.totalIncome)}
              </Text>
              <Text style={styles.statLabel}>Total Income</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statAmount, { color: COLORS.expense }]}>
                {formatAmount(summary?.totalExpenses)}
              </Text>
              <Text style={styles.statLabel}>Total Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statAmount, { color: COLORS.primary }]}>
                {formatAmount(
                  (summary?.totalIncome || 0) - (summary?.totalExpenses || 0)
                )}
              </Text>
              <Text style={styles.statLabel}>Taxable Income</Text>
            </View>
          </View>
        </Card>

        {/* Annual Income Range */}
        {user?.annualIncomeRange && (
          <Card style={styles.incomeRangeCard}>
            <Text style={styles.incomeRangeLabel}>Annual Income Range</Text>
            <Text style={styles.incomeRangeValue}>{user.annualIncomeRange}</Text>
          </Card>
        )}

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>TaxBuddy v1.0.0</Text>
          <Text style={styles.appInfoText}>Powered by Nigerian Tax Law 🇳🇬</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? 'Logging out...' : '🚪 Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    borderColor: COLORS.primary + '33',
    paddingVertical: SIZES.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 40,
    fontFamily: FONTS.extraBold,
    color: COLORS.background,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  profileGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 49,
    borderWidth: 2,
    borderColor: COLORS.primary + '44',
  },
  fullname: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  tinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  tinLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  tinValue: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.bold,
  },
  tapToChange: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  statsCard: {
    marginBottom: SIZES.spacing.md,
  },
  statsTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statAmount: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  incomeRangeCard: {
    marginBottom: SIZES.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeRangeLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  incomeRangeValue: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  menuCard: {
    marginBottom: SIZES.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  menuArrow: {
    color: COLORS.textSecondary,
    fontSize: 22,
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.spacing.lg,
  },
  appInfoText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
  },
  logoutButton: {
    backgroundColor: COLORS.expenseLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.expense + '44',
  },
  logoutText: {
    color: COLORS.expense,
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
  },
});