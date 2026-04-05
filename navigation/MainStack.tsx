// MainStack.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import ChatScreen from '../screens/ChatScreen';
import SocialScreen from '../screens/SocialScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import UserProfileScreen from '../screens/UserProfileScreen';

// Placeholder screen for drawer items
const SavedTripsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#292C27' }}>Saved Itineraries</Text>
  </View>
);

// Safe fallback avatar
const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// ─── Custom Drawer Content (Hilink Dark Style) ───
function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
      let isActive = true;
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isActive) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (data && (data.full_name || data.first_name)) {
            setProfile(data);
          } else {
            const emailName = user.email?.split('@')[0] || 'Explorer';
            setProfile({
              full_name: 'Traveler',
              username: emailName,
              avatar_url: null,
            });
          }
        }
      };
      fetchUser();
      return () => { isActive = false; };
  }, []);

  const displayName = profile?.first_name || profile?.full_name || 'Traveler';
  const username = profile?.username || 'explorer';
  const avatarUrl = profile?.avatar_url || DEFAULT_AVATAR_URL;

  return (
    <View style={{ flex: 1, backgroundColor: '#292C27', paddingTop: insets.top + 16, paddingBottom: insets.bottom, justifyContent: 'space-between' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, backgroundColor: '#1f211e', marginBottom: 16, borderRadius: 18, marginHorizontal: 8 }}>
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, backgroundColor: '#292C27', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3a3d38' }}
          >
            <Feather name="x" size={18} color="#7B7B7B" />
          </TouchableOpacity>
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#30AF5B', marginBottom: 16, backgroundColor: '#1f211e' }}
          />
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>{displayName}</Text>
          <Text style={{ color: '#30AF5B', fontWeight: 'bold', fontSize: 13, marginTop: 4 }}>@{username}</Text>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f211e', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#3a3d38' }}
          onPress={async () => await supabase.auth.signOut()}
        >
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={{ color: '#EF4444', fontWeight: 'bold', marginLeft: 12, fontSize: 15 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Tab Navigator ───
function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({ focused }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Matches') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Community') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: focused ? '#30AF5B' : 'transparent' }}>
              <Ionicons name={iconName} size={22} color={focused ? '#fff' : '#A2A2A2'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Community" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Main Stack ───
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RootTabs" component={TabNavigator} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Drawer Navigator ───
export default function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: '#292C27',
        },
        drawerActiveBackgroundColor: 'rgba(48, 175, 91, 0.15)',
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#7B7B7B',
        drawerLabelStyle: { fontWeight: 'bold', fontSize: 16, marginLeft: -10 },
      }}
    >
      <Drawer.Screen
        name="MainApp"
        component={MainStack}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color }) => <Feather name="grid" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="SavedTrips"
        component={SavedTripsScreen}
        options={{
          title: 'Saved Itineraries',
          drawerIcon: ({ color }) => <Feather name="bookmark" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}