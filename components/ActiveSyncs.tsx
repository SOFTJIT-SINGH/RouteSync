import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase'; // Ensure this path is correct

const ActiveSyncs = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      // Fetching from 'trips' table (Source/Destination/Dates/Budget)
      // We also join with 'users' to get the creator's info if needed
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          users (
            full_name,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      console.error('Error fetching trips:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="mt-10 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#30AF5B" />
        <Text className="text-rs-gray mt-4">Finding active journeys...</Text>
      </View>
    );
  }

  return (
    <View className="mt-10">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-rs-dark">Active Syncs</Text>
        <Text className="text-rs-green font-bold text-sm">View All</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {routes.length > 0 ? (
          routes.map((route) => (
            <View key={route.id} className="mr-5 w-[320px] h-[450px] rounded-5xl overflow-hidden shadow-xl shadow-black/20">
              <ImageBackground 
                source={{ uri: route.img || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' }} 
                className="flex-1 p-6 justify-between"
              >
                {/* Top Info Tag */}
                <View className="flex-row items-center bg-white/20 self-start p-3 rounded-full border border-white/30">
                  <View className="bg-rs-green p-2 rounded-full mr-3">
                    <FontAwesome6 name="map-location-dot" size={14} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-xs">{route.destination}</Text>
                    <Text className="text-white/80 text-[10px]">Starts: {route.start_date}</Text>
                  </View>
                </View>

                {/* Bottom Info - Creator & Budget */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Image 
                      source={{ uri: route.users?.avatar_url || 'https://i.pravatar.cc/100' }}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <Text className="ml-3 text-white font-bold text-sm">
                      By {route.users?.full_name?.split(' ')[0] || 'Traveler'}
                    </Text>
                  </View>
                  <View className="bg-white/90 px-3 py-1 rounded-lg">
                    <Text className="text-rs-green font-bold text-xs">₹{route.budget_min}</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          ))
        ) : (
          <View className="w-[320px] h-[100px] items-center justify-center bg-rs-bg rounded-3xl">
             <Text className="text-rs-gray italic">No active syncs found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ActiveSyncs;