import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  TextInput, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
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
  const [activeFilters, setActiveFilters] = useState<{ vibe?: string; budget?: string; minBudget?: string; maxBudget?: string }>({});

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
    setActiveFilters({});
    fetchDynamicMatches();
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return 'Dates flexible';
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  // Stable compatibility score based on trip ID hash — won't flicker on re-render
  const getCompatibility = useMemo(() => {
    const cache: Record<string, number> = {};
    return (match: any) => {
      const id = match.id || '';
      if (!cache[id]) {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = ((hash << 5) - hash) + id.charCodeAt(i);
          hash |= 0;
        }
        cache[id] = 70 + (Math.abs(hash) % 29); // 70-98 range
      }
      return cache[id];
    };
  }, [matches]);

  const filteredMatches = matches.filter(match => {
    // Text search filter
    if (searchQuery) {
      const dest = match.destination?.toLowerCase() || '';
      const name = match.profiles?.full_name?.toLowerCase() || match.profiles?.first_name?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      if (!dest.includes(query) && !name.includes(query)) return false;
    }
    // Vibe filter
    if (activeFilters.vibe && activeFilters.vibe !== 'Any') {
      if (match.vibe?.toLowerCase() !== activeFilters.vibe.toLowerCase()) return false;
    }
    // Budget range filter
    if (activeFilters.minBudget) {
      const min = parseFloat(activeFilters.minBudget);
      if (!isNaN(min) && (match.budget == null || match.budget < min)) return false;
    }
    if (activeFilters.maxBudget) {
      const max = parseFloat(activeFilters.maxBudget);
      if (!isNaN(max) && (match.budget == null || match.budget > max)) return false;
    }
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Navbar */}
      <View className="px-5 pt-2 pb-2">
        <Navbar />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />
        }
      >
        {/* Header Section */}
        <View className="mx-5 mt-4 mb-6 bg-white rounded-3xl border border-hi-gray-10 overflow-hidden shadow-sm shadow-gray-200">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-3xl font-black tracking-tighter text-hi-dark">Find Buddies</Text>
              <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.7}>
                <Text className="text-hi-green font-bold text-sm">See All →</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-hi-gray-30 text-sm font-medium">Connect with travelers going your way</Text>
          </View>
        </View>

        {/* Search + Filter */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center px-4 py-3.5 rounded-full border border-hi-gray-10 bg-white">
              <Ionicons name="search" size={20} color="#A2A2A2" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search destinations or names..."
                placeholderTextColor="#A2A2A2"
                className="flex-1 ml-3 text-base font-medium text-hi-dark"
              />
            </View>
            <TouchableOpacity
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.8}
              className="w-[52px] h-[52px] rounded-full items-center justify-center border border-hi-gray-10 bg-white shadow-sm shadow-gray-200"
            >
              <Feather name="sliders" size={20} color="#292C27" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              className={`px-5 py-3 rounded-full border ${
                activeTab === tab
                  ? 'bg-hi-dark border-hi-dark'
                  : 'bg-white border-hi-gray-10'
              }`}
            >
              <Text className={`font-bold tracking-tight ${activeTab === tab ? 'text-white' : 'text-hi-gray-30'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Matches List */}
        <View className="px-5" style={{ gap: 14 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#30AF5B" className="mt-10" />
          ) : filteredMatches.length === 0 ? (
            <View className="items-center justify-center mt-6">
              <View className="rounded-3xl overflow-hidden p-10 w-full border border-hi-gray-10 bg-white shadow-sm shadow-gray-200">
                <View className="items-center">
                  <View className="w-20 h-20 bg-hi-bg rounded-full items-center justify-center mb-5 border border-hi-gray-10">
                    <Ionicons name="sad-outline" size={36} color="#A2A2A2" />
                  </View>
                  <Text className="text-xl font-black text-hi-dark">No trips found</Text>
                  <Text className="text-hi-gray-30 font-medium text-center mt-2 max-w-[200px]">
                    Try adjusting your search or reset filters to explore more.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            filteredMatches.map((match) => {
              const userProfile = match.profiles || {};
              const displayName = userProfile.full_name || userProfile.first_name || userProfile.username || 'Traveler';
              const avatar = userProfile.avatar_url || 'https://i.pravatar.cc/150';
              const compatibility = getCompatibility(match);

              return (
                <View key={match.id} className="shadow-sm shadow-gray-200">
                  <View className="bg-white rounded-3xl border border-hi-gray-10 overflow-hidden">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('Chat', { buddyId: match.user_id, tripId: match.id })}
                      className="p-4"
                    >
                      <View className="flex-row">
                        <View className="relative">
                          <Image
                            source={{ uri: avatar }}
                            className="w-[88px] h-[88px] rounded-[20px] bg-hi-gray-10 border border-hi-gray-10"
                          />
                          <View className="absolute -bottom-1.5 -right-1.5 w-[38px] h-[38px] rounded-full items-center justify-center border-2 border-white bg-hi-green">
                            <Text className="text-white text-[10px] font-black">{compatibility}%</Text>
                          </View>
                        </View>

                        <View className="flex-1 ml-4 justify-center">
                          <View className="flex-row items-center justify-between mb-1.5">
                            <View className="flex-row items-center flex-1 pr-2">
                              <Text className="text-lg font-black text-hi-dark mr-1 tracking-tight" numberOfLines={1}>
                                {displayName}
                              </Text>
                              <Ionicons name="checkmark-circle" size={16} color="#30AF5B" />
                            </View>
                            <View className="bg-hi-bg px-2.5 py-1 rounded-full border border-hi-gray-10">
                              <Text className="text-[10px] font-black text-hi-gray-50 uppercase tracking-widest">
                                {match.vibe || 'Vibe'}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center mb-2 mt-0.5">
                            <FontAwesome6 name="location-dot" size={12} color="#30AF5B" />
                            <Text className="text-sm font-medium text-hi-gray-30 ml-1.5 flex-1" numberOfLines={1}>
                              {match.destination || 'Flexible'}
                            </Text>
                          </View>

                          <View className="flex-row items-center justify-between mt-1.5">
                            <View className="bg-hi-bg px-3 py-1.5 rounded-full border border-hi-gray-10 flex-shrink mr-2">
                              <Text className="text-xs font-bold text-hi-dark" numberOfLines={1}>
                                {formatDateRange(match.start_date, match.end_date)}
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => navigation.navigate('Chat', { buddyId: match.user_id, tripId: match.id })}
                              className="bg-hi-dark px-5 py-2.5 rounded-full"
                            >
                              <Text className="text-white font-black text-xs">Say Hi</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => setActiveFilters(filters)}
      />
    </SafeAreaView>
  );
}