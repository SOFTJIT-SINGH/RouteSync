import { View, Text, ScrollView, ImageBackground, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const ActiveSyncs = () => {
  // Mock data for your MCA project
  const routes = [
    { id: 1, name: 'Manali Trek', location: 'Himachal, India', buddies: 12, img: 'https://mountainsojourns.com/wp-content/uploads/02_BeasKundTrek-Manali.jpg' },
    { id: 2, name: 'Goa Coastal', location: 'Goa, India', buddies: 8, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop' },
  ];

  return (
    <View className="mt-10">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-rs-dark">Active Syncs</Text>
        <Text className="text-rs-green font-bold text-sm">View All</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {routes.map((route) => (
          <View key={route.id} className="mr-5 w-[320px] h-[450px] rounded-5xl overflow-hidden shadow-xl shadow-black/20">
            <ImageBackground source={{ uri: route.img }} className="flex-1 p-6 justify-between">
              
              {/* Top Info Tag */}
              <View className="flex-row items-center bg-white/20 self-start p-3 rounded-full border border-white/30">
                <View className="bg-rs-green p-2 rounded-full mr-3">
                  <FontAwesome6 name="map-location-dot" size={14} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-xs">{route.name}</Text>
                  <Text className="text-white/80 text-[10px]">{route.location}</Text>
                </View>
              </View>

              {/* Bottom Avatar Stack (The "Sync" Group) */}
              <View className="flex-row items-center">
                <View className="flex-row -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Image 
                      key={i}
                      source={{ uri: `https://i.pravatar.cc/100?u=${route.id}${i}` }}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </View>
                <Text className="ml-3 text-white font-bold text-sm">
                  {route.buddies}+ Synced
                </Text>
              </View>

            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ActiveSyncs;