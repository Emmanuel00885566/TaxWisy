import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications and get token
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get push token
  const token = await Notifications.getExpoPushTokenAsync();
  console.log('📱 Push token:', token.data);

  // Android channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('taxbuddy', {
      name: 'TaxBuddy Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00d4aa',
      sound: true,
    });
  }

  return token.data;
}

// Schedule a local notification
export async function scheduleLocalNotification({ title, body, seconds = 5 }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      color: '#00d4aa',
    },
    trigger: {
      seconds,
    },
  });
}

// Schedule tax deadline reminder
export async function scheduleTaxReminder(daysBeforeDeadline = 7) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Nigerian tax deadlines
  const deadlines = [
    { month: 2, day: 31, name: 'Q1 WHT Returns' },      // March 31
    { month: 5, day: 30, name: 'Q2 WHT Returns' },      // June 30
    { month: 8, day: 30, name: 'Q3 WHT Returns' },      // September 30
    { month: 11, day: 31, name: 'Annual CIT Returns' }, // December 31
  ];

  for (const deadline of deadlines) {
    const deadlineDate = new Date(currentYear, deadline.month, deadline.day);
    const reminderDate = new Date(deadlineDate);
    reminderDate.setDate(reminderDate.getDate() - daysBeforeDeadline);

    // Only schedule future reminders
    if (reminderDate > now) {
      const secondsUntilReminder = Math.floor((reminderDate - now) / 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Tax Deadline Reminder',
          body: `${deadline.name} is due in ${daysBeforeDeadline} days (${deadlineDate.toLocaleDateString('en-NG')}). File on time to avoid penalties!`,
          sound: true,
          color: '#00d4aa',
          data: { type: 'tax_deadline', deadline: deadline.name },
        },
        trigger: {
          seconds: secondsUntilReminder,
        },
      });

      console.log(`📅 Scheduled reminder for ${deadline.name}`);
    }
  }
}

// Send immediate test notification
export async function sendTestNotification() {
  await scheduleLocalNotification({
    title: '🇳🇬 TaxBuddy Reminder',
    body: 'Your tax deadline is approaching! Open TaxBuddy to check your records.',
    seconds: 3,
  });
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}