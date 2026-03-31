import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// COMPONENTS (adjust imports to your actual paths)
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-rs-bg" edges={['top']}>
      {/* Subtle gradient overlay for depth */}
      <LinearGradient
        colors={['rgba(48,175,91,0.05)', 'transparent']}
        className="absolute top-0 left-0 right-0 h-64"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Navbar */}
      <View className="px-5 pb-4 pt-2 z-10">
        <Navbar />
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section with Glass Card */}
        <BlurView intensity={15} tint="light" className="rounded-3xl overflow-hidden mt-2 mb-6">
          <View className="p-6 border border-white/20 bg-white/30">
            <Text className="text-3xl font-black tracking-tighter text-rs-dark">
              Route<Text className="text-rs-green">Sync</Text>
            </Text>
            <Text className="mt-2 text-base font-medium text-rs-gray leading-6">
              Find the perfect companion for your next adventure.
            </Text>
          </View>
        </BlurView>

        {/* Hero Actions (buttons) */}
        <View className="mb-8">
          <HeroButtons />
        </View>

        {/* Active Syncs - Glass Card Style */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-xl font-bold tracking-tight text-rs-dark">Active Syncs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text className="text-sm font-bold text-rs-green">See all →</Text>
            </TouchableOpacity>
          </View>
          <BlurView intensity={20} tint="light" className="rounded-2xl overflow-hidden">
            <View className="bg-white/30 p-1 border border-white/40">
              <ActiveSyncs />
            </View>
          </BlurView>
        </View>

        {/* Add Itinerary - Glass Card */}
        <View className="mb-10">
          <BlurView intensity={25} tint="light" className="rounded-[32px] overflow-hidden shadow-sm">
            <View className="bg-white/20 p-1">
              <AddItinerary />
            </View>
          </BlurView>
        </View>

        {/* Buddy Matches - Glass Card */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <View>
              <Text className="text-xl font-bold tracking-tight text-rs-dark">Find Matches</Text>
              <Text className="text-sm font-medium text-rs-gray mt-0.5">
                Travelers heading your way
              </Text>
            </View>
          </View>
          <BlurView intensity={20} tint="light" className="rounded-2xl overflow-hidden">
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => navigation.navigate('Chat')}
              className="bg-white/30"
            >
              <BuddyMatch />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Feeling Lost? - Prominent Glass Card with Gradient Border */}
        <View className="mb-20 mt-5">
          <BlurView intensity={40} tint="dark" className="rounded-[32px] overflow-hidden">
            <LinearGradient
              colors={['#30AF5B', '#1e7e3e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute top-0 left-0 right-0 bottom-0"
              style={{ opacity: 0.15 }}
            />
            <View className="p-6 border border-white/30 bg-black/10">
              <Text className="text-2xl font-black tracking-tight text-white">Feeling Lost?</Text>
              <Text className="mt-2 text-sm font-medium leading-6 text-white/90">
                Our RouteSync engine matches you with travelers who know the way.
              </Text>
              
              {/* Glass Button */}
              <BlurView intensity={60} tint="dark" className="mt-6 self-start rounded-2xl overflow-hidden">
                <TouchableOpacity
                  className="px-6 py-3.5 flex-row items-center"
                  onPress={() => navigation.navigate('Matches')}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-bold text-white mr-2">Get Started</Text>
                  <Text className="text-white text-lg">→</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}