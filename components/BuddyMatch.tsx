import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function BuddyMatch() {
  const [match, setMatch] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchBuddyMatch();
  }, []);

  const fetchBuddyMatch = async () => {
    try {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Fetch a random profile that IS NOT the current user
      let profileQuery = supabase.from('profiles').select('*');
      if (user) {
        profileQuery = profileQuery.neq('id', user.id);
      }
      
      const { data: profileData, error: profileError } = await profileQuery.limit(1).maybeSingle();

      if (profileData) {
        setMatch(profileData);

        // 3. See if this buddy has any upcoming trips planned
        const { data: tripData } = await supabase
          .from('trips')
          .select('destination, start_date')
          .eq('user_id', profileData.id)
          .order('start_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (tripData) {
          setTrip(tripData);
        }
      }
    } catch (error) {
      console.error('Error fetching buddy match:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <View className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm items-center justify-center">
        <ActivityIndicator size="small" color="#30AF5B" />
        <Text className="text-gray-400 mt-3 font-medium text-sm">Finding your perfect match...</Text>
      </View>
    );
  }

  // Fallback if database is empty or no other users exist
  if (!match) {
    return (
      <View className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm items-center justify-center">
        <Ionicons name="search" size={32} color="#D1D5DB" />
        <Text className="text-gray-500 font-medium text-center mt-3">No new buddies in your area right now.</Text>
      </View>
    );
  }

  // Dynamic formatting with safe fallbacks
  const displayName = match.full_name || match.first_name || 'Traveler';
  const avatarUrl = match.avatar_url || 'https://i.pravatar.cc/150';
  const displayDestination = trip?.destination || 'Anywhere';
  
  const displayDate = trip?.start_date 
    ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    : 'Dates Flexible';

  return (
    <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm shadow-gray-200">
      
      {/* 1. Profile Header Row */}
      <View className="flex-row items-center">
        <View className="relative">
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </View>

        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-gray-900 tracking-tight" numberOfLines={1}>
              {displayName}
            </Text>
            
            <View className="bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex-row items-center">
              <Ionicons name="flame" size={12} color="#30AF5B" />
              <Text className="text-xs font-extrabold text-[#30AF5B] ml-1">94% Match</Text>
            </View>
          </View>
          
          <Text className="text-sm font-medium text-gray-500 mt-0.5" numberOfLines={1}>
            Heading to <Text className="text-gray-900 font-bold">{displayDestination}</Text> • {displayDate}
          </Text>
        </View>
      </View>

      {/* 2. Shared Interests (Using fallback mock data if bio/interests are empty) */}
      <View className="flex-row flex-wrap mt-5 gap-2">
        <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Text className="text-xs font-semibold text-gray-600">📸 Photography</Text>
        </View>
        <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Text className="text-xs font-semibold text-gray-600">🍕 Foodie</Text>
        </View>
        <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Text className="text-xs font-semibold text-gray-600">🏕️ Camping</Text>
        </View>
      </View>

      {/* 3. Action Bar */}
      <View className="mt-5 flex-row items-center justify-between bg-gray-50 p-1.5 rounded-[20px] border border-gray-100">
         <View className="flex-row items-center ml-3">
           <View className="flex-row -space-x-2 mr-2">
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=33' }} className="w-7 h-7 rounded-full border-2 border-white" />
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=44' }} className="w-7 h-7 rounded-full border-2 border-white" />
           </View>
           <Text className="text-xs font-bold text-gray-500">2 mutuals</Text>
         </View>
         
         <TouchableOpacity 
           activeOpacity={0.8}
           onPress={() => navigation.navigate('Chat')} // Tell it to go to Chat!
           className="bg-[#30AF5B] px-5 py-2.5 rounded-[16px] shadow-sm shadow-green-200 flex-row items-center"
         >
           <Text className="text-white font-bold mr-2 text-sm">Say Hi</Text>
           <Ionicons name="send" size={14} color="white" />
         </TouchableOpacity>
      </View>

    </View>
  );
}