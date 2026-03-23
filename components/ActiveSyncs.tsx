import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, ActivityIndicator, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

// Using 320 for width + 8 for margin right = 328
const CARD_WIDTH = 320;
const CARD_MARGIN = 8;
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
          users: { full_name: 'Aarav S.', avatar_url: 'https://i.pravatar.cc/150?u=aarav' }
        },
        {
          id: '2',
          destination: 'Kasol Valley',
          start_date: 'Nov 05, 2026',
          budget_min: '8,000',
          img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop',
          users: { full_name: 'Neha R.', avatar_url: 'https://i.pravatar.cc/150?u=neha' }
        },
        {
          id: '3',
          destination: 'Goa Coast',
          start_date: 'Dec 20, 2026',
          budget_min: '20,000',
          img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
          users: { full_name: 'Kabir D.', avatar_url: 'https://i.pravatar.cc/150?u=kabir' }
        }
      ];
      setRoutes(mockData);
      setLoading(false);
    }, 800);
  };

  // Calculate which card is currently centered
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    // Round to nearest index
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (loading) {
    return (
      <View className="mt-10 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#30AF5B" />
        <Text className="text-gray-500 mt-4 font-semibold">Finding active journeys...</Text>
      </View>
    );
  }

  return (
    <View className="mx-5 mb-2">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="flex-row"
        snapToInterval={SNAP_INTERVAL} 
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16} // Fires often enough for smooth calculation
      >
        {routes.length > 0 ? (
          routes.map((route, index) => (
            <View 
              key={route.id} 
              // Removed Tailwind margins/widths here to enforce exact spacing via inline styles
              style={{ width: CARD_WIDTH, marginRight: index === routes.length - 1 ? 0 : CARD_MARGIN }}
              className="h-[450px] rounded-[32px] overflow-hidden shadow-sm"
            >
              <ImageBackground 
                source={{ uri: route.img }} 
                className="flex-1 p-6 justify-between bg-gray-900"
                imageStyle={{ opacity: 0.8 }}
              >
                {/* Top Badge */}
                <View className="flex-row items-center bg-white/20 self-start p-3 rounded-full border border-white/30 backdrop-blur-sm">
                  <View className="bg-[#30AF5B] p-2 rounded-full mr-3">
                    <FontAwesome6 name="map-location-dot" size={14} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-xs">{route.destination}</Text>
                    <Text className="text-white/90 text-[10px]">Starts: {route.start_date}</Text>
                  </View>
                </View>

                {/* Bottom Bar */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Image 
                      source={{ uri: route.users.avatar_url }}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <Text className="ml-3 text-white font-bold text-sm shadow-sm">
                      By {route.users.full_name}
                    </Text>
                  </View>
                  <View className="bg-white px-3 py-1.5 rounded-xl shadow-sm">
                    <Text className="text-[#30AF5B] font-bold text-xs">₹{route.budget_min}</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          ))
        ) : (
          <View style={{ width: CARD_WIDTH }} className="h-[100px] items-center justify-center bg-gray-100 rounded-[32px]">
             <Text className="text-gray-500 italic text-base">No active syncs right now.</Text>
          </View>
        )}
      </ScrollView>

      {/* Pagination Dots */}
      {routes.length > 1 && (
        <View className="flex-row justify-center items-center mt-5 space-x-1.5">
          {routes.map((_, index) => (
            <View 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                activeIndex === index 
                  ? 'bg-[#30AF5B] w-6' // Active dot is a wider pill
                  : 'bg-gray-300 w-2'  // Inactive dot is a small circle
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ActiveSyncs;