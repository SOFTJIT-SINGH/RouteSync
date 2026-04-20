import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome6, Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const CARD_WIDTH = 300;
const CARD_MARGIN = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
];

const ActiveSyncs = ({ navigation }: any) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('trips')
        .select(`
          id, destination, source, start_date, end_date, budget, vibe, image_url,
          profiles:user_id (id, full_name, first_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (user) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      console.warn('ActiveSyncs fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color="#30AF5B" />
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-8 items-center border border-hi-gray-10 shadow-sm">
        <View className="bg-hi-bg p-4 rounded-full mb-4">
          <Ionicons name="search" size={32} color="#A2A2A2" />
        </View>
        <Text className="text-hi-dark font-black text-lg">No journeys found yet</Text>
        <Text className="text-hi-gray-30 text-center mt-2 font-medium">Be the first to publish an itinerary and find your tribe!</Text>
      </View>
    );
  }

  return (
    <View className="mb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {routes.map((route, index) => {
          const userProfile = route.profiles || {};
          const displayName = userProfile.first_name || userProfile.full_name || 'Traveler';
          const avatarUrl = userProfile.avatar_url || 'https://i.pravatar.cc/150';
          const cardImage = route.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

          return (
            <View
              key={route.id}
              style={{ width: CARD_WIDTH, marginRight: index === routes.length - 1 ? 4 : CARD_MARGIN }}
              className="h-[420px] rounded-4xl overflow-hidden shadow-lg shadow-gray-300/40"
            >
              <ImageBackground
                source={{ uri: cardImage }}
                className="flex-1 justify-between bg-hi-dark relative"
                imageStyle={{ borderRadius: 32 }}
              >
                <View className="absolute inset-0 bg-black/20 rounded-4xl" />

                <View className="self-start m-5 z-10">
                  <View className="flex-row items-center bg-hi-dark/70 px-4 py-2.5 rounded-full">
                    <View className="bg-hi-green p-2 rounded-full mr-3">
                      <FontAwesome6 name="map-location-dot" size={12} color="white" />
                    </View>
                    <View>
                      <Text className="text-white font-black text-sm tracking-tight">{route.destination}</Text>
                      <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{formatDate(route.start_date)}</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-hi-dark/80 p-5 rounded-b-4xl z-10">
                  <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('UserProfile', { userId: userProfile.id })}
                      className="flex-row items-center"
                    >
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-11 h-11 rounded-full border-2 border-white/60"
                      />
                      <View className="ml-3">
                        <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Hosted By</Text>
                        <Text className="text-white font-black text-sm">{displayName}</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {route.budget && (
                      <View className="bg-hi-green/20 px-3 py-1.5 rounded-full border border-hi-green/30">
                        <Text className="text-hi-green font-black text-xs">₹{route.budget.toLocaleString()}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('TripDetail', { tripId: route.id })}
                    activeOpacity={0.8}
                    className="bg-hi-green py-4 rounded-full items-center justify-center flex-row shadow-lg shadow-green-900/40"
                  >
                    <Text className="text-white font-black text-sm tracking-wide mr-2">Check Itinerary</Text>
                    <Feather name="arrow-right" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          );
        })}
      </ScrollView>

      {routes.length > 1 && (
        <View className="flex-row justify-center items-center mt-5 space-x-2">
          {routes.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                activeIndex === index
                  ? 'bg-hi-green w-7'
                  : 'bg-hi-gray-10 w-2'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ActiveSyncs;