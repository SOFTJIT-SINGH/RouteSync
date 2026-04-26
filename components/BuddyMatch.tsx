import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';

export default function BuddyMatch({ navigation }: { navigation: any }) {
  const [match, setMatch] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuddyMatch();
  }, []);

  const fetchBuddyMatch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let profileQuery = supabase.from('profiles').select('*');
      if (user) {
        profileQuery = profileQuery.neq('id', user.id);
      }
      
      // Fetch 10 candidates to choose from
      const { data: profiles, error: profileError } = await profileQuery.limit(10);

      if (profiles && profiles.length > 0) {
        // Pick one at random from the candidates
        const randomIndex = Math.floor(Math.random() * profiles.length);
        const selectedProfile = profiles[randomIndex];
        setMatch(selectedProfile);

        const { data: tripData } = await supabase
          .from('trips')
          .select('destination, start_date')
          .eq('user_id', selectedProfile.id)
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
      <View className="p-10 items-center justify-center">
        <ActivityIndicator size="small" color="#30AF5B" />
        <Text className="text-hi-gray-30 mt-3 font-semibold text-sm">Finding your perfect match...</Text>
      </View>
    );
  }

  // Fallback
  if (!match) {
    return (
      <View className="p-8 items-center justify-center">
        <Ionicons name="search" size={32} color="#A2A2A2" />
        <Text className="text-hi-gray-30 font-bold text-center mt-3">No new buddies in your area right now.</Text>
      </View>
    );
  }

  const displayName = match.full_name?.trim() || match.first_name?.trim() || 'Traveler';
  const avatarUrl = match.avatar_url || null;
  const displayDestination = trip?.destination || 'Anywhere';
  
  const displayDate = trip?.start_date 
    ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    : 'Dates Flexible';

  return (
    <View className="p-5">
      {/* 1. Profile Header Row */}
      <View className="flex-row items-center">
        <View className="relative">
          <Avatar uri={avatarUrl} name={displayName} size={64} borderWidth={2} borderColor="#EEEEEE" />
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-hi-green rounded-full border-2 border-white" />
        </View>

        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-black text-hi-dark tracking-tight" numberOfLines={1}>
              {displayName}
            </Text>
            
            <View className="bg-hi-green/10 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="flame" size={12} color="#30AF5B" />
              <Text className="text-xs font-black text-hi-green ml-1">94% Match</Text>
            </View>
          </View>
          
          <Text className="text-sm font-medium text-hi-gray-30 mt-1" numberOfLines={1}>
            Heading to <Text className="font-black text-hi-dark">{displayDestination}</Text> • {displayDate}
          </Text>
        </View>
      </View>

      {/* 2. Shared Interests */}
      <View className="flex-row flex-wrap mt-4 gap-2">
        <View className="bg-hi-bg px-3 py-1.5 rounded-full border border-hi-gray-10">
          <Text className="text-xs font-bold text-hi-gray-50">📸 Photography</Text>
        </View>
        <View className="bg-hi-bg px-3 py-1.5 rounded-full border border-hi-gray-10">
          <Text className="text-xs font-bold text-hi-gray-50">🍕 Foodie</Text>
        </View>
        <View className="bg-hi-bg px-3 py-1.5 rounded-full border border-hi-gray-10">
          <Text className="text-xs font-bold text-hi-gray-50">🏕️ Camping</Text>
        </View>
      </View>

      {/* 3. Action Bar */}
      <View className="mt-5 flex-row items-center justify-between bg-hi-bg p-2.5 rounded-full border border-hi-gray-10">
           <View className="flex-row items-center ml-2">
             <Text className="text-xs font-bold text-hi-gray-30">{match.travel_style || match.vibe || 'Explorer'}</Text>
           </View>
         
         <TouchableOpacity 
           activeOpacity={0.8}
            onPress={() => navigation.navigate('UserProfile', { userId: match.id })}
            className="bg-hi-dark px-5 py-3 rounded-full flex-row items-center"
          >
            <Text className="text-white font-black mr-2 text-sm">View Profile</Text>
            <Ionicons name="arrow-forward" size={14} color="white" />
         </TouchableOpacity>
      </View>
    </View>
  );
}