import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const BuddyMatch = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateMatches();
  }, []);

  const calculateMatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get the Current User's latest trip to compare against
      const { data: myTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 2. Fetch other travelers' trips
      const { data: others, error } = await supabase
        .from('trips')
        .select(`
          *,
          users (id, full_name, avatar_url, interests)
        `)
        .neq('user_id', user.id) // Don't match with yourself
        .eq('visibility', 'public');

      if (error) throw error;

      // 3. Simple Matching Algorithm
      const scoredMatches = others.map((trip: any) => {
        let score = 0;

        if (myTrip) {
          // Destination Match (40 pts)
          if (trip.destination.toLowerCase() === myTrip.destination.toLowerCase()) score += 40;

          // Budget Match (30 pts) - Within 20% range
          const budgetDiff = Math.abs(trip.budget_min - myTrip.budget_min);
          if (budgetDiff < (myTrip.budget_min * 0.2)) score += 30;

          // Interest Overlap (30 pts)
          const commonInterests = trip.users.interests?.filter((i: string) => 
            myTrip.users?.interests?.includes(i)
          );
          if (commonInterests?.length > 0) score += 30;
        } else {
          score = Math.floor(Math.random() * 20) + 70; // Fallback score if user hasn't made a trip
        }

        return { ...trip, syncScore: score };
      }).sort((a, b) => b.syncScore - a.syncScore);

      setMatches(scoredMatches);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="small" color="#30AF5B" className="mt-10" />;

  return (
    <View className="mt-10 mb-10">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-rs-dark">Top Syncs</Text>
        <TouchableOpacity onPress={calculateMatches}>
          <Ionicons name="refresh-circle" size={28} color="#30AF5B" />
        </TouchableOpacity>
      </View>

      {matches.map((match) => (
        <View key={match.id} className="bg-white p-5 rounded-5xl mb-4 shadow-sm border border-rs-bg flex-row items-center">
          <Image 
            source={{ uri: match.users?.avatar_url || 'https://i.pravatar.cc/150' }} 
            className="w-16 h-16 rounded-full border-2 border-rs-green" 
          />

          <View className="flex-1 ml-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-rs-dark">{match.users?.full_name || 'Traveler'}</Text>
              <View className="bg-rs-bg px-3 py-1 rounded-full border border-rs-green/20">
                <Text className="text-rs-green font-bold text-xs">{match.syncScore}% Match</Text>
              </View>
            </View>

            <Text className="text-xs text-rs-gray mt-1">Heading to {match.destination}</Text>
          </View>

          <TouchableOpacity 
            className="ml-2 bg-rs-green p-3 rounded-2xl shadow-lg shadow-green-900/30"
            onPress={() => Alert.alert("Sync Request", `Send a match request to ${match.users?.full_name}?`)}
          >
            <FontAwesome6 name="bolt-lightning" size={16} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default BuddyMatch;