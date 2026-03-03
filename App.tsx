// App.tsx
import './global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Navbar from './components/Navbar';
import HeroButtons from './components/HeroButtons';
import ActiveSyncs from './components/ActiveSyncs';
import BuddyMatch from './components/BuddyMatch';
import AddItinerary from './components/AddItinerary';
import ChatScreen from './screens/ChatScreen'; 
import ProfileScreen from 'screens/ProfileScreen';

function HomeScreen({ navigation }: any) {
  return (
    // Only ONE SafeAreaView per screen. flex-1 is critical here.
    <SafeAreaView className="flex-1 bg-rs-bg">
      <StatusBar style="dark" />
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <Navbar />
        
        <View className="my-8">
          <Text className="text-4xl font-bold leading-tight text-rs-dark">
            Route<Text className="text-rs-green">Sync</Text>
          </Text>
          <Text className="mt-2 text-lg text-rs-gray">
            Find the perfect companion for your next adventure.
          </Text>
        </View>

        <HeroButtons />
        <ActiveSyncs />
        <AddItinerary />

        {/* This triggers the navigation to the Chat screen */}
        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <BuddyMatch />
        </TouchableOpacity>
        
        <View className="relative mt-10 mb-20 overflow-hidden rounded-5xl bg-rs-green p-8">
          <Text className="text-2xl font-bold text-white">Feeling Lost?</Text>
          <Text className="mt-2 text-sm leading-6 text-white/80">
            Our RouteSync engine matches you with travelers who know the way.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}