import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const ActiveSyncs = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    
    // Simulating a database fetch with rich mock data
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
    }, 800); // 800ms delay to show the loading state nicely
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
    <View className="mt-10">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-gray-900">Active Syncs</Text>
        <Text className="text-[#30AF5B] font-bold text-sm">View All</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="flex-row"
        snapToInterval={340} 
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {routes.length > 0 ? (
          routes.map((route) => (
            <View 
              key={route.id} 
              className="mr-5 w-[320px] h-[450px] rounded-[32px] overflow-hidden shadow-sm"
            >
              <ImageBackground 
                source={{ uri: route.img }} 
                className="flex-1 p-6 justify-between bg-gray-900"
                imageStyle={{ opacity: 0.8 }} // Darkens the image slightly so text is readable
              >
                <View className="flex-row items-center bg-white/20 self-start p-3 rounded-full border border-white/30 backdrop-blur-sm">
                  <View className="bg-[#30AF5B] p-2 rounded-full mr-3">
                    <FontAwesome6 name="map-location-dot" size={14} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-xs">{route.destination}</Text>
                    <Text className="text-white/90 text-[10px]">Starts: {route.start_date}</Text>
                  </View>
                </View>

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
          <View className="w-[320px] h-[100px] items-center justify-center bg-gray-100 rounded-[32px]">
             <Text className="text-gray-500 italic text-base">No active syncs right now.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ActiveSyncs;