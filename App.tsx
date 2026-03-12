// App.tsx
import 'react-native-gesture-handler'; // MUST be at the top
import './global.css';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { RootStackParamList } from './types/navigation';

// Supabase Client
import { supabase } from './lib/supabase';

// Components & Screens
import Sidebar from './components/Sidebar';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen'; 
import ProfileScreen from './screens/ProfileScreen';

// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator initialRouteName="HomeDashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  
  // Global Match Notification Listener
  useEffect(() => {
    const setupMatchListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('global-match-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'match_requests',
          },
          async (payload) => {
            // Verify if the trip belongs to the current user
            const { data: trip } = await supabase
              .from('trips')
              .select('user_id, destination')
              .eq('id', payload.new.trip_id)
              .single();

            if (trip && trip.user_id === user.id) {
              Alert.alert(
                "⚡ New Sync Request!",
                `Someone wants to join your journey to ${trip.destination}. Check your matches!`,
                [{ text: "OK", style: "default" }]
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupMatchListener();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Drawer.Navigator 
          drawerContent={(props) => <Sidebar {...props} />} 
          screenOptions={{ headerShown: false }}
        >
          <Drawer.Screen name="Main" component={MainStack} />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}