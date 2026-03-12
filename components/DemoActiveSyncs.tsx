import { View, Text, ScrollView, ImageBackground, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const DemoActiveSyncs = () => {
  // Mock data for your MCA project
  const routes = [
    { id: 1, name: 'Manali Trek', location: 'Himachal, India', buddies: 12, img: 'https://mountainsojourns.com/wp-content/uploads/02_BeasKundTrek-Manali.jpg' },
    { id: 2, name: 'Leh Ladhak', location: 'Leh, India', buddies: 8, img: 'https://zoyotrip.in/wp-content/uploads/2025/04/WhatsApp-Image-2025-04-24-at-1.09.20-PM-1-1024x1024.jpeg.webp' },
    { id: 3, name: 'Goa Coastal', location: 'Goa, India', buddies: 8, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop' },
  ];

  return (
    <View className="mt-10">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-rs-dark">Recent Syncs</Text>
        <Text className="text-sm font-bold text-rs-green">View All</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        // --- SNAPPING PROPS ADDED HERE ---
        snapToInterval={340} // 320px (card width) + 20px (mr-5)
        snapToAlignment="start"
        decelerationRate="normal"
        // disableIntervalMomentum={true} // Prevents swiping past multiple cards at once
        // ---------------------------------
      >
        {routes.map((route) => (
          <View key={route.id} className="mr-5 h-[450px] w-[320px] overflow-hidden rounded-[32px] shadow-xl shadow-black/20">
            <ImageBackground source={{ uri: route.img }} className="flex-1 justify-between p-6">
              
              {/* Top Info Tag */}
              <View className="self-start flex-row items-center rounded-full border border-white/30 bg-white/20 p-3">
                <View className="mr-3 rounded-full bg-rs-green p-2">
                  <FontAwesome6 name="map-location-dot" size={14} color="white" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-white">{route.name}</Text>
                  <Text className="text-[10px] text-white/80">{route.location}</Text>
                </View>
              </View>

              {/* Bottom Avatar Stack (The "Sync" Group) */}
              <View className="flex-row items-center">
                <View className="flex-row -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Image 
                      key={i}
                      source={{ uri: `https://i.pravatar.cc/100?u=${route.id}${i}` }}
                      className="h-10 w-10 rounded-full border-2 border-white"
                    />
                  ))}
                </View>
                <Text className="ml-3 text-sm font-bold text-white">
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

export default DemoActiveSyncs;