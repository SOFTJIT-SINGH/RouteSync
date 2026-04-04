import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
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

const ActiveSyncs = () => {
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
          id, destination, source, start_date, end_date, budget, vibe,
          profiles:user_id (full_name, first_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (user) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setRoutes(data);
      } else {
        // Fallback mock data only if database is empty
        setRoutes([
          {
            id: 'mock-1',
            destination: 'Leh Ladakh',
            start_date: '2026-10-12',
            budget: 15000,
            profiles: { full_name: 'Aarav S.', avatar_url: 'https://i.pravatar.cc/150?u=aarav' },
          },
          {
            id: 'mock-2',
            destination: 'Kasol Valley',
            start_date: '2026-11-05',
            budget: 8000,
            profiles: { full_name: 'Neha R.', avatar_url: 'https://i.pravatar.cc/150?u=neha' },
          },
        ]);
      }
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
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color="#30AF5B" />
        <Text className="text-hi-gray-30 mt-4 font-semibold">Finding active journeys...</Text>
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
        {routes.length > 0 ? (
          routes.map((route, index) => {
            const userProfile = route.profiles || {};
            const displayName = userProfile.full_name || userProfile.first_name || 'Traveler';
            const avatarUrl = userProfile.avatar_url || 'https://i.pravatar.cc/150';
            const cardImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

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
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: avatarUrl }}
                          className="w-11 h-11 rounded-full border-2 border-white/60"
                        />
                        <View className="ml-3">
                          <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Hosted By</Text>
                          <Text className="text-white font-black text-sm">{displayName}</Text>
                        </View>
                      </View>
                      {route.budget && (
                        <View className="bg-hi-green px-4 py-2 rounded-full">
                          <Text className="text-white font-black text-xs">₹{route.budget.toLocaleString()}</Text>
                        </View>
                      )}
                    </View>

                    {route.vibe && (
                      <View className="flex-row items-center mt-3 pt-3 border-t border-white/10">
                        <View className="bg-white/10 px-3 py-1 rounded-full">
                          <Text className="text-white/70 text-xs font-bold">{route.vibe}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </ImageBackground>
              </View>
            );
          })
        ) : (
          <View style={{ width: CARD_WIDTH }} className="h-[100px] items-center justify-center bg-white rounded-3xl border border-hi-gray-10">
            <Text className="text-hi-gray-30 font-bold text-base">No active syncs right now.</Text>
          </View>
        )}
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