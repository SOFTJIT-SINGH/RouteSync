import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  TextInput, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
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

  const tabs = ['All Matches', 'Same Dates', 'High Score', 'Route Buddies'];

  const [myTrips, setMyTrips] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchDynamicMatches();
    }, [])
  );

  const fetchDynamicMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's own trips for comparison
      const { data: myData } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id);
      setMyTrips(myData || []);

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
        .eq('visibility', 'public')
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

  // Real compatibility algorithm based on dates, route, vibe, and budget
  const getCompatibility = useMemo(() => {
    const cache: Record<string, number> = {};
    return (match: any) => {
      if (cache[match.id]) return cache[match.id];
      if (myTrips.length === 0) {
        // Fallback: stable hash if user has no trips
        let hash = 0;
        for (let i = 0; i < match.id.length; i++) { hash = ((hash << 5) - hash) + match.id.charCodeAt(i); hash |= 0; }
        cache[match.id] = 60 + (Math.abs(hash) % 35);
        return cache[match.id];
      }

      let bestScore = 0;
      for (const myTrip of myTrips) {
        let score = 0;
        // Date overlap (0-30 pts)
        const ms = new Date(myTrip.start_date).getTime();
        const me = new Date(myTrip.end_date).getTime();
        const ts = new Date(match.start_date).getTime();
        const te = new Date(match.end_date).getTime();
        const overlap = Math.min(me, te) - Math.max(ms, ts);
        const maxDur = Math.max(me - ms, te - ts);
        if (overlap > 0 && maxDur > 0) score += Math.round((overlap / maxDur) * 30);

        // Route match (0-30 pts)
        const myStops = [myTrip.source, ...(myTrip.stops || []), myTrip.destination].map((s: string) => s?.toLowerCase().trim());
        const theirStops = [match.source, ...(match.stops || []), match.destination].map((s: string) => s?.toLowerCase().trim());
        const commonStops = myStops.filter((s: string) => s && theirStops.includes(s));
        score += Math.min(commonStops.length * 10, 30);

        // Vibe match (0-15 pts)
        if (myTrip.vibe && match.vibe && myTrip.vibe.toLowerCase() === match.vibe.toLowerCase()) score += 15;

        // Budget proximity (0-15 pts)
        if (myTrip.budget && match.budget) {
          const diff = Math.abs(myTrip.budget - match.budget);
          const avg = (myTrip.budget + match.budget) / 2;
          if (avg > 0) score += Math.round(Math.max(0, 15 - (diff / avg) * 15));
        }

        // Barter fit (0-10 pts)
        const myOffering = (myTrip.offering || []).map((s: string) => s.toLowerCase());
        const theirSeeking = (match.seeking || []).map((s: string) => s.toLowerCase());
        const barterFit = myOffering.filter((s: string) => theirSeeking.includes(s));
        score += Math.min(barterFit.length * 5, 10);

        bestScore = Math.max(bestScore, score);
      }
      cache[match.id] = Math.min(bestScore, 100);
      return cache[match.id];
    };
  }, [matches, myTrips]);

  // Check if match dates overlap with any of user's trips
  const hasDateOverlap = (match: any) => {
    return myTrips.some(t => {
      const overlap = Math.min(new Date(t.end_date).getTime(), new Date(match.end_date).getTime()) - Math.max(new Date(t.start_date).getTime(), new Date(match.start_date).getTime());
      return overlap > 0;
    });
  };

  // Check if match shares any route points
  const hasRouteOverlap = (match: any) => {
    const theirStops = [match.source, ...(match.stops || []), match.destination].map((s: string) => s?.toLowerCase().trim());
    return myTrips.some(t => {
      const myStops = [t.source, ...(t.stops || []), t.destination].map((s: string) => s?.toLowerCase().trim());
      return myStops.some((s: string) => s && theirStops.includes(s));
    });
  };

  const filteredMatches = matches.filter(match => {
    // Text search
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
    // Budget range
    if (activeFilters.minBudget) {
      const min = parseFloat(activeFilters.minBudget);
      if (!isNaN(min) && (match.budget == null || match.budget < min)) return false;
    }
    if (activeFilters.maxBudget) {
      const max = parseFloat(activeFilters.maxBudget);
      if (!isNaN(max) && (match.budget == null || match.budget > max)) return false;
    }
    // Tab filters
    if (activeTab === 'Same Dates') return hasDateOverlap(match);
    if (activeTab === 'High Score') return getCompatibility(match) >= 60;
    if (activeTab === 'Route Buddies') return hasRouteOverlap(match);
    return true;
  }).sort((a, b) => activeTab === 'High Score' ? getCompatibility(b) - getCompatibility(a) : 0);

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
              const displayName = userProfile.first_name || userProfile.full_name || 'Traveler';
              const avatar = userProfile.avatar_url;
              const compatibility = getCompatibility(match);
              const scoreColor = compatibility >= 70 ? '#30AF5B' : compatibility >= 40 ? '#FF814C' : '#A2A2A2';
              const modeLabel = match.trip_mode === 'duo' ? 'Duo' : match.trip_mode === 'group' ? 'Group' : match.trip_mode === 'join_on_way' ? 'Join' : 'Solo';

              return (
                <View key={match.id} className="shadow-sm shadow-gray-200">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('TripDetail', { tripId: match.id })}
                    className="bg-white rounded-3xl border border-hi-gray-10 overflow-hidden p-4"
                  >
                    <View className="flex-row">
                      <View className="relative">
                        <Avatar uri={avatar} name={displayName} size={88} rounded="2xl" />
                        <View className="absolute -bottom-1.5 -right-1.5 w-[38px] h-[38px] rounded-full items-center justify-center border-2 border-white" style={{ backgroundColor: scoreColor }}>
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
                          <View className="flex-row items-center" style={{ gap: 4 }}>
                            <View className="bg-hi-bg px-2.5 py-1 rounded-full border border-hi-gray-10">
                              <Text className="text-[10px] font-black text-hi-gray-50 uppercase tracking-widest">
                                {modeLabel}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="flex-row items-center mb-2 mt-0.5">
                          <FontAwesome6 name="location-dot" size={12} color="#30AF5B" />
                          <Text className="text-sm font-medium text-hi-gray-30 ml-1.5 flex-1" numberOfLines={1}>
                            {match.source ? `${match.source} → ${match.destination}` : match.destination || 'Flexible'}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-1.5">
                          <View className="bg-hi-bg px-3 py-1.5 rounded-full border border-hi-gray-10 flex-shrink mr-2">
                            <Text className="text-xs font-bold text-hi-dark" numberOfLines={1}>
                              {formatDateRange(match.start_date, match.end_date)}
                            </Text>
                          </View>

                          <View className="bg-hi-green px-5 py-2.5 rounded-full">
                            <Text className="text-white font-black text-xs">View Trip</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Barter tags preview */}
                    {(match.seeking?.length > 0) && (
                      <View className="flex-row flex-wrap mt-3 pt-3 border-t border-hi-gray-10" style={{ gap: 4 }}>
                        <Text className="text-[10px] font-black text-hi-gray-20 uppercase mr-1 self-center">Needs:</Text>
                        {match.seeking.slice(0, 3).map((tag: string, i: number) => (
                          <View key={i} className="bg-[#FF814C]/8 px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-bold text-[#FF814C]">{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
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