import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, Feather } from '@expo/vector-icons';

// Import your existing screens
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTripScreen from '../screens/CreateTripScreen';

// 1. Placeholder Screens for the dead buttons
const CommunityScreen = () => <View className="flex-1 justify-center items-center bg-[#FAFAFA]"><Text className="text-xl font-bold text-gray-900">Community Feed Coming Soon</Text></View>;
const NotificationsScreen = () => <View className="flex-1 justify-center items-center bg-[#FAFAFA]"><Text className="text-xl font-bold text-gray-900">No New Notifications</Text></View>;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// 2. The Bottom Tab Navigator
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
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'compass' : 'compass-outline';
          else if (route.name === 'Matches') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Community') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return (
            <View className={`items-center justify-center ${focused ? 'bg-green-50 p-2 rounded-xl' : ''}`}>
              <Ionicons name={iconName} size={24} color={focused ? '#30AF5B' : '#9CA3AF'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 3. The Main Stack (Wraps Tabs + Modals/Full Screens)
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* The Tabs act as the base layer */}
      <Stack.Screen name="RootTabs" component={TabNavigator} />
      
      {/* Screens that slide over the tabs */}
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      {/* <Stack.Screen name="Chat" component={ChatScreen} /> */}
    </Stack.Navigator>
  );
}

// 4. The Sidebar Drawer (Wraps the entire app)
export default function AppNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false, drawerActiveTintColor: '#30AF5B' }}>
      <Drawer.Screen name="MainApp" component={MainStack} options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Settings" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}