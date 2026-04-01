import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  TextInput, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import FilterModal from '../components/FilterModal';

export default function MatchesScreen({ navigation }: any) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('All Matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = ['All Matches', 'Same Dates', 'High Compatibility', 'Nearby'];

  useFocusEffect(
    useCallback(() => {
      fetchDynamicMatches();
    }, [])
  );

  const fetchDynamicMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          profiles:user_id (
            full_name,
            first_name,
            avatar_url
          )
        `)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDynamicMatches();
  };

  const handleSeeAll = () => {
    setSearchQuery('');
    setActiveTab('All Matches');
    fetchDynamicMatches();
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return 'Dates flexible';
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  // Simple compatibility score based on destination overlap (just for demo)
  const getCompatibility = (match: any) => {
    // You can replace with real logic later
    return Math.floor(Math.random() * (98 - 70 + 1) + 70);
  };

  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true;
    const dest = match.destination?.toLowerCase() || '';
    const name = match.profiles?.full_name?.toLowerCase() || match.profiles?.first_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return dest.includes(query) || name.includes(query);
  });

  return (
    <SafeAreaView className="flex-1 bg-rs-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9F0" />
      
      {/* Subtle gradient background */}
      <LinearGradient
        colors={['rgba(48,175,91,0.08)', 'transparent']}
        className="absolute top-0 left-0 right-0 h-80"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View className="px-5 pt-2 pb-2 z-10">
        <Navbar />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />
        }
      >
        {/* Header Section with Glass Effect */}
        <BlurView intensity={15} tint="light" className="mx-5 mt-2 mb-6 rounded-3xl overflow-hidden">
          <View className="p-5 border border-white/20 bg-white/30">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-3xl font-black tracking-tighter text-rs-dark">Find Buddies</Text>
              <TouchableOpacity onPress={handleSeeAll}>
                <Text className="text-rs-green font-bold text-sm">See All →</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-rs-gray text-sm">Connect with travelers going your way</Text>
          </View>
        </BlurView>

        {/* Search + Filter */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-white/70 backdrop-blur-sm flex-row items-center px-4 py-3.5 rounded-2xl border border-white/40 shadow-sm">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search destinations or names..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base font-medium text-rs-dark"
              />
            </View>
            <TouchableOpacity
              onPress={() => setFilterVisible(true)}
              className="bg-rs-green w-14 h-14 rounded-2xl items-center justify-center shadow-md shadow-green-900/20"
            >
              <Feather name="sliders" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs with glass styling */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full border ${
                activeTab === tab
                  ? 'bg-rs-dark border-rs-dark'
                  : 'bg-white/60 border-white/40 backdrop-blur-sm'
              }`}
            >
              <Text className={`font-bold ${activeTab === tab ? 'text-white' : 'text-rs-dark'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Matches List */}
        <View className="px-5" style={{ gap: 16 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#30AF5B" className="mt-10" />
          ) : filteredMatches.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <BlurView intensity={20} tint="light" className="rounded-2xl overflow-hidden p-8 w-full">
                <View className="items-center">
                  <View className="w-16 h-16 bg-white/50 rounded-full items-center justify-center mb-4">
                    <Ionicons name="sad-outline" size={32} color="#7B7B7B" />
                  </View>
                  <Text className="text-lg font-bold text-rs-dark">No trips found</Text>
                  <Text className="text-rs-gray text-center mt-2">
                    Try adjusting your search or reset filters.
                  </Text>
                </View>
              </BlurView>
            </View>
          ) : (
            filteredMatches.map((match) => {
              const userProfile = match.profiles || {};
              const displayName = userProfile.full_name || userProfile.first_name || userProfile.username || 'Traveler';
              const avatar = userProfile.avatar_url || 'https://i.pravatar.cc/150';
              const compatibility = getCompatibility(match);

              return (
                <BlurView key={match.id} intensity={25} tint="light" className="rounded-2xl overflow-hidden">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Chat', { buddyId: match.user_id, tripId: match.id })}
                    className="bg-white/40 p-4 border border-white/40"
                  >
                    <View className="flex-row">
                      <View className="relative">
                        <Image
                          source={{ uri: avatar }}
                          className="w-24 h-24 rounded-xl bg-gray-200 border border-white/50"
                        />
                        <View className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                          <View className="bg-rs-green w-8 h-8 rounded-full items-center justify-center">
                            <Text className="text-white text-[10px] font-black">{compatibility}%</Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-1 ml-4 justify-center">
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center flex-1 pr-2">
                            <Text className="text-lg font-black text-rs-dark mr-1" numberOfLines={1}>
                              {displayName}
                            </Text>
                            <Ionicons name="checkmark-circle" size={16} color="#30AF5B" />
                          </View>
                          <View className="bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
                            <Text className="text-[10px] font-black text-rs-green uppercase">
                              {match.vibe || 'Vibe'}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center mb-2 mt-0.5">
                          <FontAwesome6 name="location-dot" size={12} color="#7B7B7B" />
                          <Text className="text-sm font-semibold text-rs-gray ml-1.5 flex-1" numberOfLines={1}>
                            {match.destination || 'Flexible'}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-1">
                          <View className="bg-white/50 px-3 py-1.5 rounded-lg border border-white/40 flex-shrink mr-2">
                            <Text className="text-xs font-bold text-rs-dark" numberOfLines={1}>
                              {formatDateRange(match.start_date, match.end_date)}
                            </Text>
                          </View>

                          <View className="bg-rs-dark px-4 py-2 rounded-xl">
                            <Text className="text-white font-bold text-xs">Say Hi</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </BlurView>
              );
            })
          )}
        </View>
      </ScrollView>

      <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </SafeAreaView>
  );
}