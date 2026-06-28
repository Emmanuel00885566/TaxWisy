import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TransactionScreen from '../screens/transactions/TransactionScreen';
import TaxScreen from '../screens/tax/TaxScreen';
import ReportScreen from '../screens/reports/ReportScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingVertical: 8,
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💳" label="Transactions" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tax"
        component={TaxScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" label="Tax" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📄" label="Reports" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#12122a',
    borderTopColor: '#2a2a4a',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.4,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 8,
    color: '#888',
    fontFamily: 'Manrope_500Medium',
    
  },
  tabLabelFocused: {
    color: '#00d4aa',
    fontFamily: 'Manrope_600SemiBold',
  },
});