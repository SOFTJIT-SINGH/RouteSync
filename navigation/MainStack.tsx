// navigation/MainStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Sidebar from '../components/Sidebar';

// Import the new screens
import FindBuddyScreen from '../screens/FindBuddyScreen';
import SyncRouteScreen from '../screens/SyncRouteScreen';
import AddTripScreen from '../screens/AddTripScreen';
import SocialScreen from '../screens/SocialScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DashboardDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardDrawer} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      {/* Add new screens here so they sit on top of the drawer */}
      <Stack.Screen name="AddTrip" component={AddTripScreen} />
      <Stack.Screen name="SocialScreen" component={SocialScreen} />
      <Stack.Screen name="FindBuddy" component={FindBuddyScreen} />
      <Stack.Screen name="SyncRoute" component={SyncRouteScreen} />
    </Stack.Navigator>
  );
}
