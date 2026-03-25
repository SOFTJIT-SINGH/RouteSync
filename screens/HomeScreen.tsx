import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// COMPONENTS
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';

export default function HomeScreen({ navigation }: any) {
  return (
    // Only ONE SafeAreaView per screen. flex-1 is critical here.
    // <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
    <SafeAreaView className="flex-1 bg-rs-bg" edges={['top']}>
      {/* Navbar sits pinned to the top */}
      <View className="px-5 pb-4 pt-2">
        <Navbar />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View className="my-8">
          <Text className="text-2xl font-black leading-tight tracking-tighter text-gray-900">
            Route<Text className="text-[#30AF5B]">Sync</Text>.
          </Text>
          <Text className="mt-1 pr-8 font-medium leading-relaxed text-gray-500 text-sm">
            Find the perfect companion for your next adventure.
          </Text>
        </View>

        {/* Hero Actions */}
        <View className="mb-5 mt-4">
          <HeroButtons />
        </View>

        {/* Active Syncs */}
        <View className="mb-10">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold tracking-tight text-gray-900">Active Syncs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text className="text-sm font-bold text-[#30AF5B]">See all</Text>
            </TouchableOpacity>
          </View>
          <ActiveSyncs />
        </View>

        {/* Add Itinerary */}
        <View className="mb-10 rounded-[32px] shadow-sm shadow-gray-200">
          <AddItinerary />
        </View>

        {/* Buddy Matches */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold tracking-tight text-gray-900">Find Matches</Text>
              <Text className="mt-0.5 text-sm font-medium text-gray-500">
                Travelers heading your way
              </Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Chat')}>
            <BuddyMatch />
          </TouchableOpacity>
        </View>

        {/* Your "Feeling Lost?" Card (Upgraded with Hilink Theme Colors) */}
        <View className="relative mb-20 mt-5 overflow-hidden rounded-[32px] border border-green-400 bg-emerald-800 p-8 shadow-xl shadow-green-900/20">
          <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <View className="absolute -bottom-10 -right-4 h-32 w-32 rounded-full bg-[#30AF5B]/20 blur-2xl" />
          <Text className="text-2xl font-black tracking-tight text-white">Feeling Lost?</Text>
          <Text className="mt-2 text-sm font-medium leading-6 text-white/90">
            Our RouteSync engine matches you with travelers who know the way.
          </Text>
          <TouchableOpacity
              className="mt-6 self-start rounded-2xl bg-rs-green backdrop-blur-2xl px-5 py-3.5 shadow-sm border-white/20 shadow-black/10"
              onPress={() => navigation.navigate('Matches')}>
              <Text className="text-base font-bold text-white">Get Started</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
