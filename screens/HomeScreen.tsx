import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// COMPONENTS
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      {/* Navbar */}
      <View className="px-5 pt-2 pb-3 bg-hi-bg">
        <Navbar />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Welcome Card */}
        <View className="mt-4 mb-6 bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-hi-gray-10">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-black tracking-tight text-hi-dark">
                Hello, Traveler! 👋
              </Text>
              <Text className="mt-1 text-sm font-medium text-hi-gray-30">
                Ready to explore new places?
              </Text>
            </View>
            <View className="w-12 h-12 bg-hi-green/10 rounded-full items-center justify-center">
              <Ionicons name="airplane" size={24} color="#30AF5B" />
            </View>
          </View>
        </View>

        {/* Quick Actions – HeroButtons */}
        <View className="mb-8">
          <HeroButtons />
        </View>

        {/* Active Syncs – Section */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="flash" size={20} color="#30AF5B" />
              <Text className="text-lg font-bold tracking-tight text-hi-dark">
                Active Syncs
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text className="text-sm font-bold text-hi-green">See all →</Text>
            </TouchableOpacity>
          </View>
          <ActiveSyncs />
        </View>

        {/* Add Itinerary – Prominent Card */}
        <View className="mb-10">
          <AddItinerary navigation={navigation} />
        </View>

        {/* Buddy Matches – Section */}
        <View className="mb-8">
          <View className="flex-row items-center space-x-2 mb-3">
            <Ionicons name="people" size={20} color="#30AF5B" />
            <Text className="text-lg font-bold tracking-tight text-hi-dark">
              Find Matches
            </Text>
          </View>
          <Text className="text-sm font-medium text-hi-gray-30 mb-4">
            Travelers heading your way
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Chat')}
            className="bg-white rounded-3xl shadow-sm shadow-gray-200 border border-hi-gray-10 overflow-hidden"
          >
            <BuddyMatch navigation={navigation} />
          </TouchableOpacity>
        </View>

        {/* Feeling Lost? – Dark Promo Card (Hilink "Get App" Style) */}
        <View className="mb-20 mt-5">
          <View className="bg-hi-dark rounded-4xl p-6 shadow-lg shadow-gray-900/20 relative overflow-hidden">
            {/* Subtle background circles */}
            <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
            <View className="absolute -left-8 -bottom-8 w-32 h-32 bg-hi-green/10 rounded-full" />

            <View className="flex-row items-center justify-between mb-3 z-10">
              <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
                <Ionicons name="compass" size={24} color="#30AF5B" />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Matches')}
                className="bg-hi-green px-5 py-2.5 rounded-full"
              >
                <Text className="text-white font-bold text-sm">Get Started →</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-2xl font-black tracking-tight text-white z-10">
              Feeling Lost?
            </Text>
            <Text className="mt-2 text-sm font-medium leading-6 text-white/60 z-10">
              Our RouteSync engine matches you with travelers who know the way.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}