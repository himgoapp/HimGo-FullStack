import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import KYCScreen from './src/screens/auth/KYCScreen';
import DashboardScreen from './src/screens/app/DashboardScreen';
import RideFlowScreen from './src/screens/app/RideFlowScreen';
import EarningsScreen from './src/screens/app/EarningsScreen';
import ProfileScreen from './src/screens/app/ProfileScreen';

// Context
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="KYC" component={KYCScreen} />
    </Stack.Navigator>
  );
};

// App Stack (Tabs)
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#00914e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 8, paddingTop: 8, height: 65 }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Rides"
        component={RideFlowScreen}
        options={{
          title: 'Rides',
          tabBarLabel: 'Rides',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: 'Earnings',
          tabBarLabel: 'Earnings',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <AuthProvider>
        <SplashScreen />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            <Stack.Group>
              <Stack.Screen name="Auth" component={AuthStack} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="App" component={AppTabs} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
      <StatusBar barStyle="dark-content" />
    </AuthProvider>
  );
}
