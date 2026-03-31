// MainStack.tsx (or AppNavigator.tsx)
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

// Placeholder screens for drawer items
const SavedTripsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Saved Itineraries</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Settings</Text>
  </View>
);

// Safe fallback avatar (no local require – avoids resolution error)
const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content
function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  const displayName = profile?.first_name || profile?.full_name || 'Soft';
  const username = profile?.username || 'Softjit_Singh';
  const avatarUrl = profile?.avatar_url || DEFAULT_AVATAR_URL;

  return (
    <View style={{ flex: 1, backgroundColor: '#059669', paddingTop: insets.top + 16, paddingBottom: insets.bottom, justifyContent: 'space-between', borderRadius: 16 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, backgroundColor: '#047857', marginBottom: 16, position: 'relative', borderRadius: 18  }}>
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, backgroundColor: '#059669', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#6ee7b7' }}
          >
            <Feather name="x" size={20} color="#a7f3d0" />
          </TouchableOpacity>
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', marginBottom: 16, backgroundColor: '#064e3b' }}
          />
          <Text style={{ fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>{displayName}</Text>
          <Text style={{ color: '#d1fae5', fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>@{username}</Text>
        </View>

        {/* Drawer Items */}
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Sign Out Button */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#047857', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#10b981' }}
          onPress={async () => await supabase.auth.signOut()}
        >
          <Feather name="log-out" size={20} color="#fda4af" />
          <Text style={{ color: '#fda4af', fontWeight: 'bold', marginLeft: 12, fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tab Navigator (fixed positioning)
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
          borderTopColor: '#F3F4F6',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
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
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 16, backgroundColor: focused ? '#e8f5e9' : 'transparent' }}>
              <Ionicons name={iconName} size={24} color={focused ? '#30AF5B' : '#9CA3AF'} />
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

// Main Stack (no duplicate screens)
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RootTabs" component={TabNavigator} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

// Root Drawer Navigator – ensure no stray spaces/comments inside
export default function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
        },
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.15)',
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#d1fae5',
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