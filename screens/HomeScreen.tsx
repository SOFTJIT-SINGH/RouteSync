import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// COMPONENTS
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import MyJourneys from '../components/MyJourneys';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';

export default function HomeScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Explorer';

  const fetchGreeting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*, email').eq('id', user.id).maybeSingle();
        if (data) {
          setProfile(data);
        }
      }
    } catch (e) {
      console.warn('Greeting fetch error:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGreeting();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGreeting();
    setRefreshing(false);
  };

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />
        }
      >
        {/* Welcome Card */}
        <View className="mt-4 mb-6 bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-hi-gray-10">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-2xl font-black tracking-tight text-hi-dark">
                  Hello, {displayName}!
                </Text>
                {(profile?.is_verified || profile?.email?.includes('hacknapp.com') || profile?.email?.includes('sskaid.com')) && (
                  <View className="ml-2 bg-hi-green rounded-full p-0.5">
                    <Ionicons name="checkmark" size={10} color="white" />
                  </View>
                )}
                <Text className="text-2xl ml-1">👋</Text>
              </View>
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
          <ActiveSyncs navigation={navigation} />
        </View>

        {/* My Journeys – Section */}
        <MyJourneys navigation={navigation} />

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

        {/* Feeling Lost? – Dark Promo Card */}
        <View className="mb-10 mt-5">
          <View className="bg-hi-dark rounded-4xl p-6 shadow-lg shadow-gray-900/20 relative overflow-hidden">
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

        {/* Travel Safety Tips */}
        <View className="mb-20">
          <Text className="text-lg font-bold tracking-tight text-hi-dark mb-4 px-1">
            Travel Safety Tips 🛡️
          </Text>
          <View className="bg-white rounded-3xl p-5 border border-hi-gray-10">
            <View className="flex-row items-start mb-4">
               <View className="bg-hi-green/10 p-2 rounded-xl mr-3">
                  <Ionicons name="shield-checkmark" size={18} color="#30AF5B" />
               </View>
               <View className="flex-1">
                  <Text className="font-bold text-hi-dark text-sm">Verified Profiles</Text>
                  <Text className="text-xs text-hi-gray-30 mt-1">Look for the green checkmark to find verified travelers with high trust scores.</Text>
               </View>
            </View>
            <View className="flex-row items-start">
               <View className="bg-hi-orange/10 p-2 rounded-xl mr-3">
                  <Ionicons name="chatbubbles" size={18} color="#FF814C" />
               </View>
               <View className="flex-1">
                  <Text className="font-bold text-hi-dark text-sm">Meet in Public</Text>
                  <Text className="text-xs text-hi-gray-30 mt-1">Always meet your sync buddies in well-lit, public places for the first time.</Text>
               </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CreateTrip')}
        className="absolute bottom-10 right-6 w-16 h-16 bg-hi-dark rounded-full items-center justify-center shadow-2xl shadow-black"
      >
        <Ionicons name="add" size={32} color="#30AF5B" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}