// MainStack.tsx
import React, { useState, useCallback } from 'react';
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
import Avatar from '../components/Avatar';

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
import UserSearchScreen from '../screens/UserSearchScreen';

import MyTripsScreen from '../screens/MyTripsScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import EditPostScreen from '../screens/EditPostScreen';
import SavedPostsScreen from '../screens/SavedPostsScreen';
import LikedPostsScreen from '../screens/LikedPostsScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

// Safe fallback avatar
const DEFAULT_AVATAR_URL = null; // No more placeholder — initials will be used

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// ─── Custom Drawer Content (Hilink Dark Style) ───
function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile({ ...data, email: user.email });
      } else {
        // No profile row yet — derive from auth
        const emailName = user.email?.split('@')[0] || '';
        setProfile({
          full_name: emailName,
          username: emailName,
          avatar_url: null,
          email: user.email,
        });
      }
    } catch (e) {
      console.warn('Drawer profile fetch error:', e);
    }
  }, []);

  // Refresh profile every time the drawer is opened
  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );

  const displayName = profile?.first_name?.trim() || profile?.full_name?.trim() || 'Explorer';
  const username = profile?.username || profile?.email?.split('@')[0] || 'user';
  const avatarUrl = profile?.avatar_url || null;

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
          <Avatar uri={avatarUrl} name={displayName} size={72} borderWidth={3} borderColor="#30AF5B" />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>{displayName}</Text>
            {(profile?.is_verified || profile?.email?.includes('hacknapp.com') || profile?.email?.includes('sskaid.com')) && (
              <View style={{ marginLeft: 6, backgroundColor: '#30AF5B', borderRadius: 10, padding: 2 }}>
                <Ionicons name="checkmark" size={8} color="white" />
              </View>
            )}
          </View>
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
      <Stack.Screen name="UserSearch" component={UserSearchScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="EditPost" component={EditPostScreen} />
      <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
      <Stack.Screen name="LikedPosts" component={LikedPostsScreen} />
      <Stack.Screen name="Connections" component={ConnectionsScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
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
        component={MyTripsScreen}
        options={{
          title: 'My Journeys',
          drawerIcon: ({ color }) => <Feather name="map" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="DrawerSettings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}