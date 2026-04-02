import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

const CARD_WIDTH = 300;
const CARD_MARGIN = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

const ActiveSyncs = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          destination: 'Leh Ladakh',
          start_date: 'Oct 12, 2026',
          budget_min: '15,000',
          img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
          users: { full_name: 'Aarav S.', avatar_url: 'https://i.pravatar.cc/150?u=aarav' },
          peopleJoined: '48',
        },
        {
          id: '2',
          destination: 'Kasol Valley',
          start_date: 'Nov 05, 2026',
          budget_min: '8,000',
          img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop',
          users: { full_name: 'Neha R.', avatar_url: 'https://i.pravatar.cc/150?u=neha' },
          peopleJoined: '24',
        },
        {
          id: '3',
          destination: 'Goa Coast',
          start_date: 'Dec 20, 2026',
          budget_min: '20,000',
          img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
          users: { full_name: 'Kabir D.', avatar_url: 'https://i.pravatar.cc/150?u=kabir' },
          peopleJoined: '62',
        }
      ];
      setRoutes(mockData);
      setLoading(false);
    }, 800);
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    if (index !== activeIndex) {
      setActiveIndex(index);
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
          routes.map((route, index) => (
            <View 
              key={route.id} 
              style={{ width: CARD_WIDTH, marginRight: index === routes.length - 1 ? 4 : CARD_MARGIN }}
              className="h-[420px] rounded-4xl overflow-hidden shadow-lg shadow-gray-300/40"
            >
              <ImageBackground 
                source={{ uri: route.img }} 
                className="flex-1 justify-between bg-hi-dark relative"
                imageStyle={{ borderRadius: 32 }}
              >
                {/* Dark gradient overlay for legibility */}
                <View className="absolute inset-0 bg-black/20 rounded-4xl" />

                {/* ── Top: Destination Badge ── */}
                <View className="self-start m-5 z-10">
                  <View className="flex-row items-center bg-hi-dark/70 px-4 py-2.5 rounded-full">
                    <View className="bg-hi-green p-2 rounded-full mr-3">
                      <FontAwesome6 name="map-location-dot" size={12} color="white" />
                    </View>
                    <View>
                      <Text className="text-white font-black text-sm tracking-tight">{route.destination}</Text>
                      <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{route.start_date}</Text>
                    </View>
                  </View>
                </View>

                {/* ── Bottom: User Info Panel ── */}
                <View className="bg-hi-dark/80 p-5 rounded-b-4xl z-10">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Image 
                        source={{ uri: route.users.avatar_url }}
                        className="w-11 h-11 rounded-full border-2 border-white/60"
                      />
                      <View className="ml-3">
                        <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Hosted By</Text>
                        <Text className="text-white font-black text-sm">
                          {route.users.full_name}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <View className="bg-hi-green px-4 py-2 rounded-full">
                        <Text className="text-white font-black text-xs">₹{route.budget_min}</Text>
                      </View>
                    </View>
                  </View>

                  {/* People joined */}
                  <View className="flex-row items-center mt-3 pt-3 border-t border-white/10">
                    <View className="flex-row -space-x-2">
                      <Image source={{ uri: 'https://i.pravatar.cc/100?img=33' }} className="w-6 h-6 rounded-full border-[1.5px] border-hi-dark" />
                      <Image source={{ uri: 'https://i.pravatar.cc/100?img=44' }} className="w-6 h-6 rounded-full border-[1.5px] border-hi-dark" />
                      <Image source={{ uri: 'https://i.pravatar.cc/100?img=55' }} className="w-6 h-6 rounded-full border-[1.5px] border-hi-dark" />
                    </View>
                    <Text className="text-white/60 text-xs font-bold ml-2">{route.peopleJoined}+ Joined</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          ))
        ) : (
          <View style={{ width: CARD_WIDTH }} className="h-[100px] items-center justify-center bg-white rounded-3xl border border-hi-gray-10">
             <Text className="text-hi-gray-30 font-bold text-base">No active syncs right now.</Text>
          </View>
        )}
      </ScrollView>

      {/* Pagination Dots */}
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