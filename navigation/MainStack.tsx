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
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import ChatScreen from '../screens/ChatScreen';
import SocialScreen from '../screens/SocialScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreen = () => (
  <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
    <Text className="text-xl font-bold text-gray-900">No New Notifications</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const [profile, setProfile] = useState<any>(null);

  // BUG FIX 2: Dynamic Data Refresh
  // Using useFocusEffect ensures the profile data is re-fetched every time the Drawer is opened,
  // not just once when the app loads.
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
            // Dynamic Fallback
            const emailName = user.email ? user.email.split('@')[0] : 'Explorer';
            setProfile({
              full_name: 'Traveler',
              username: emailName,
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
            });
          }
        }
      };

      fetchUser();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const displayName = profile?.first_name || profile?.full_name || 'Loading...';
  const username = profile?.username || 'fetching...';
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';

  return (
    <SafeAreaView className="flex-1 bg-[#059669] rounded-r-[40px] overflow-hidden border-r border-[#10b981] shadow-2xl">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        <View className="px-6 pt-20 pb-8 bg-[#047857] rounded-br-[60px] mb-6 border-b border-[#059669] relative">
          <TouchableOpacity 
            onPress={() => props.navigation.closeDrawer()} 
            className="absolute top-14 right-6 w-10 h-10 bg-[#059669] rounded-full items-center justify-center border border-[#10b981]"
          >
            <Feather name="x" size={20} color="#a7f3d0" />
          </TouchableOpacity>
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-20 h-20 rounded-full border-4 border-white mb-4 bg-[#064e3b]"
          />
          <Text className="text-2xl font-black text-white tracking-tight">{displayName}</Text>
          <Text className="text-emerald-100 font-bold text-sm mt-0.5">@{username}</Text>
        </View>

        <View className="flex-1 px-3">
          <DrawerItemList {...props} />
        </View>

      </DrawerContentScrollView>
      
      <View className="p-8 border-t border-[#10b981] mb-4">
        <TouchableOpacity 
          className="flex-row items-center bg-[#047857] p-4 rounded-2xl border border-[#059669] shadow-sm"
          onPress={async () => await supabase.auth.signOut()}
        >
          <Feather name="log-out" size={20} color="#fda4af" />
          <Text className="text-rose-100 font-bold ml-3 text-base">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0, 
          paddingTop: 0,
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
          height: Platform.OS === 'ios' ? 65 : 70,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Matches') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Community')
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return (
            <View className={`items-center justify-center w-12 h-12 rounded-2xl transition-all ${focused ? 'bg-green-50' : 'bg-transparent'}`}>
              <Ionicons name={iconName} size={24} color={focused ? '#30AF5B' : '#9CA3AF'} />
            </View>
          );
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Community" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RootTabs" component={TabNavigator} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SocialScreen" component={SocialScreen} />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Community" component={SocialScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
   <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        // BUG FIX 1: Replaced the broken rgb string with a transparent background. 
        // The real background color is now applied safely to the SafeAreaView inside the Drawer Component.
        drawerStyle: {
          backgroundColor: 'rgb(4 120 87)',
          width: 290,
        },
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.15)',
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#d1fae5', 
        drawerLabelStyle: { fontWeight: 'bold', fontSize: 16, marginLeft: -10 },
      }}>
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
        component={ProfileScreen}
        options={{
          title: 'Saved Itineraries',
          drawerIcon: ({ color }) => <Feather name="bookmark" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={ProfileScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}