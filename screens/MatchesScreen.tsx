import React, { useState, useCallback } from 'react';
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
  
  // Dynamic State
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
            username,
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

  // THE "SEE ALL" FUNCTION: Clears search and resets to All Matches
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

  // Filter matches based on search query
  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true;
    const dest = match.destination?.toLowerCase() || '';
    const name = match.profiles?.full_name?.toLowerCase() || match.profiles?.first_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return dest.includes(query) || name.includes(query);
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      <View className="px-5 pt-2 pb-2 z-50">
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
        
        <View className="px-5 pt-4 pb-4">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-3xl font-black text-gray-900 tracking-tight">Find Buddies</Text>
            {/* SEE ALL BUTTON */}
            <TouchableOpacity onPress={handleSeeAll} className="mb-1.5">
              <Text className="text-[#30AF5B] font-bold text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center space-x-3">
            <View className="flex-1 bg-white flex-row items-center px-4 py-3.5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
              <Ionicons name="search" size={20} color="#9CA3AF"/>
              <TextInput 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search destinations or names..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base font-medium text-gray-900"
              />
            </View>
            
            <TouchableOpacity 
              onPress={() => setFilterVisible(true)}
              className="bg-[#30AF5B] w-14 h-14 rounded-2xl items-center justify-center shadow-md shadow-green-900/20"
            >
              <Feather name="sliders" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-6"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full mr-3 border transition-all ${
                activeTab === tab 
                  ? 'bg-gray-900 border-gray-900' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`font-bold ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="px-5 space-y-4">
          {loading ? (
            <ActivityIndicator size="large" color="#30AF5B" className="mt-10" />
          ) : filteredMatches.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="sad-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-bold text-gray-900">No trips found</Text>
              <Text className="text-gray-500 text-center mt-2 px-6">
                Try adjusting your search or click &quot;See All&quot; to reset.
              </Text>
            </View>
          ) : (
            filteredMatches.map((match) => {
              const userProfile = match.profiles || {};
              const displayName = userProfile.full_name || userProfile.first_name || userProfile.username || 'Traveler';
              const avatar = userProfile.avatar_url || 'https://i.pravatar.cc/150';
              const matchScore = Math.floor(Math.random() * (99 - 75 + 1)) + 75;

              return (
                <TouchableOpacity 
                  key={match.id}
                  activeOpacity={0.9}
                  className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm shadow-gray-100/50 flex-row"
                >
                  <View className="relative">
                    <Image 
                      source={{ uri: avatar }} 
                      className="w-24 h-24 rounded-[20px] bg-gray-200 border border-gray-100"
                    />
                    <View className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                      <View className="bg-[#30AF5B] w-8 h-8 rounded-full items-center justify-center">
                        <Text className="text-white text-[10px] font-black">{matchScore}%</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-1 ml-4 justify-center">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center flex-1 pr-2">
                        <Text className="text-lg font-black text-gray-900 mr-1" numberOfLines={1}>
                          {displayName}
                        </Text>
                        <Ionicons name="checkmark-circle" size={16} color="#30AF5B" />
                      </View>
                      <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                          {match.vibe || 'Vibe'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-2 mt-0.5">
                      <FontAwesome6 name="location-dot" size={12} color="#9CA3AF" />
                      <Text className="text-sm font-semibold text-gray-500 ml-1.5 flex-1" numberOfLines={1}>
                        {match.destination || 'Flexible'}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-1">
                      <View className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-shrink mr-2">
                        <Text className="text-xs font-bold text-gray-600" numberOfLines={1}>
                          {formatDateRange(match.start_date, match.end_date)}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('Chat', { buddyId: match.user_id, tripId: match.id })}
                        className="bg-gray-900 px-4 py-2 rounded-xl"
                      >
                        <Text className="text-white font-bold text-xs">Say Hi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>

      <FilterModal 
        visible={filterVisible} 
        onClose={() => setFilterVisible(false)} 
      />
    </SafeAreaView>
  );
}