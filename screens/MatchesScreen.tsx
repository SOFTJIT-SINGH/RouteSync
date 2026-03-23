import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function MatchesScreen({ navigation }: any) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchAllMatches();
  }, []);

  const fetchAllMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch all profiles EXCEPT the logged-in user
      let query = supabase.from('profiles').select('*');
      if (user) {
        query = query.neq('id', user.id);
      }
      
      const { data: profiles, error } = await query;
      if (error) throw error;

      if (profiles) {
        // 2. For each profile, fetch their latest trip to show on the card
        const profilesWithTrips = await Promise.all(
          profiles.map(async (profile) => {
            const { data: tripData } = await supabase
              .from('trips')
              .select('destination, start_date')
              .eq('user_id', profile.id)
              .order('start_date', { ascending: true })
              .limit(1)
              .maybeSingle();

            return {
              ...profile,
              trip: tripData || null
            };
          })
        );
        setMatches(profilesWithTrips);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatchCard = ({ item, index }: { item: any, index: number }) => {
    // Dynamic formatting with safe fallbacks
    const displayName = item.full_name || item.first_name || 'Traveler';
    const avatarUrl = item.avatar_url || `https://i.pravatar.cc/150?u=${item.id}`;
    const displayDestination = item.trip?.destination || 'Exploring Options';
    const displayDate = item.trip?.start_date 
      ? new Date(item.trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      : 'Dates Flexible';
    
    // Simulate a match percentage based on index for visual flair
    const matchScore = 98 - (index * 3);

    return (
      <View className="bg-white rounded-[32px] p-5 mb-5 border border-gray-100 shadow-sm shadow-gray-200">
        
        {/* Profile Header Row */}
        <View className="flex-row items-center">
          <View className="relative">
            <Image 
              source={{ uri: avatarUrl }} 
              className="w-16 h-16 rounded-full bg-gray-200"
            />
            {/* Online Indicator */}
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-gray-900 tracking-tight" numberOfLines={1}>
                {displayName}
              </Text>
              
              <View className="bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex-row items-center">
                <Ionicons name="flame" size={12} color="#30AF5B" />
                <Text className="text-xs font-extrabold text-[#30AF5B] ml-1">{matchScore}%</Text>
              </View>
            </View>
            
            <Text className="text-sm font-medium text-gray-500 mt-0.5" numberOfLines={1}>
              Heading to <Text className="text-gray-900 font-bold">{displayDestination}</Text>
            </Text>
            <Text className="text-xs font-medium text-gray-400 mt-0.5">
              {displayDate}
            </Text>
          </View>
        </View>

        {/* Action Bar */}
        <View className="mt-5 flex-row items-center justify-between bg-gray-50 p-1.5 rounded-[20px] border border-gray-100">
           <View className="flex-row items-center ml-3">
             <View className="flex-row -space-x-2 mr-2">
                <Image source={{ uri: `https://i.pravatar.cc/100?img=${index + 10}` }} className="w-7 h-7 rounded-full border-2 border-white" />
                <Image source={{ uri: `https://i.pravatar.cc/100?img=${index + 20}` }} className="w-7 h-7 rounded-full border-2 border-white" />
             </View>
             <Text className="text-xs font-bold text-gray-500">Mutuals</Text>
           </View>
           
           <TouchableOpacity 
             activeOpacity={0.8}
             onPress={() => navigation.navigate('Chat')}
             className="bg-[#30AF5B] px-6 py-2.5 rounded-[16px] shadow-sm shadow-green-200 flex-row items-center"
           >
             <Text className="text-white font-bold mr-2 text-sm">Message</Text>
             <Ionicons name="send" size={14} color="white" />
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Header */}
      <View className="px-6 py-2 flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-gray-900 tracking-tight">Travel Buddies</Text>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm">
          <Feather name="search" size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="px-6 mt-6 mb-2 flex-row space-x-3">
        {['All', 'High Match', 'Same City'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full border ${
              activeTab === tab 
                ? 'bg-gray-900 border-gray-900' 
                : 'bg-white border-gray-200'
            }`}
          >
            <Text className={`font-bold text-sm ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Matches List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#30AF5B" />
          <Text className="text-gray-400 mt-4 font-bold">Scanning for travel buddies...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="people-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">No buddies found</Text>
          <Text className="text-gray-500 text-center">It&apos;s a little quiet right now. Check back later for new travelers!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        />
      )}

    </SafeAreaView>
  );
}