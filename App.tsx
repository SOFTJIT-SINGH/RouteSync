import './global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// COMPONENTS (Ensure these paths are correct!)
import Navbar from './components/Navbar';
import HeroButtons from './components/HeroButtons';
import ActiveSyncs from './components/ActiveSyncs';
import BuddyMatch from './components/BuddyMatch';
import AddItinerary from './components/AddItinerary';

// 1. Define the Home Screen right here in App.tsx for now
function HomeScreen({ navigation }: any) {
  return (
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

        {/* This triggers the navigation */}
        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <BuddyMatch />
        </TouchableOpacity>

        {/* JSM Inspired Card */}
        <View className="relative mt-10 mb-10 overflow-hidden rounded-5xl bg-rs-green p-8">
          <Text className="text-2xl font-bold text-white">Feeling Lost?</Text>
          <Text className="mt-2 text-sm leading-6 text-white/80">
            Our RouteSync engine matches you with travelers who know the way.
          </Text>
          <TouchableOpacity className="mt-6 self-start rounded-full bg-white px-6 py-3">
            <Text className="font-bold text-rs-green">Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 2. Define a very simple Chat Screen to test
function ChatScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-rs-green">Chat Screen Working!</Text>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="mt-5 bg-rs-green px-10 py-4 rounded-2xl"
      >
        <Text className="text-white font-bold">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

// 3. The Main App Entry
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}