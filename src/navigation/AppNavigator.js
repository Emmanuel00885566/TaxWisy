import { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL('/');

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  const linking = {
    prefixes: [prefix, 'taxtracker://'],
    config: {
      screens: {
        // For logged out users
        AuthNavigator: {
          screens: {
            ResetPassword: 'reset-password/:token',
          },
        },
        // For logged in users
        ChangePassword: 'change-password',
      },
    },
  };

  if (loading) return <Loader message="Starting Tax Tracker..." />;

  return (
    <NavigationContainer linking={linking}>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}