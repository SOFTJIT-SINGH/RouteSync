import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome6, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const MyJourneys = ({ navigation }: any) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrips(data || []);
    } catch (e: any) {
      console.warn('MyJourneys fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  if (loading) return <ActivityIndicator color="#30AF5B" className="py-10" />;

  if (trips.length === 0) return null;

  return (
    <View className="mb-10">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-2">
          <FontAwesome6 name="map-location-dot" size={18} color="#30AF5B" />
          <Text className="text-lg font-bold tracking-tight text-hi-dark ml-2">My Journeys</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SavedTrips')}>
          <Text className="text-sm font-bold text-hi-green">Manage →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
        {trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
            className="w-64 bg-white rounded-3xl border border-hi-gray-10 p-5 shadow-sm shadow-gray-100"
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-hi-green/10 p-2 rounded-full">
                <FontAwesome6 name="location-dot" size={12} color="#30AF5B" />
              </View>
              <Text className="ml-3 text-base font-black text-hi-dark" numberOfLines={1}>{trip.destination}</Text>
            </View>
            
            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center">
                 <Feather name="calendar" size={12} color="#A2A2A2" />
                 <Text className="ml-1.5 text-[10px] font-bold text-hi-gray-30">
                    {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </Text>
              </View>
              <View className="bg-hi-bg px-2 py-1 rounded-md">
                 <Text className="text-hi-dark font-bold text-[10px]">{trip.vibe}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MyJourneys;
