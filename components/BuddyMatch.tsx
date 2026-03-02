import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

const BuddyMatch = () => {
  const matches = [
    {
      id: 1,
      name: "Arjun Singh",
      score: 95,
      tags: ["Backpacker", "Budget", "Veg"],
      img: "https://i.pravatar.cc/150?u=arjun"
    },
    {
      id: 2,
      name: "Sonia Kaur",
      score: 88,
      tags: ["Luxury", "Photographer"],
      img: "https://i.pravatar.cc/150?u=sonia"
    }
  ];

  return (
    <View className="mt-10 mb-10">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-rs-dark">Top Syncs</Text>
        <Ionicons name="options-outline" size={24} color="#30AF5B" />
      </View>

      {matches.map((buddy) => (
        <View key={buddy.id} className="bg-white p-5 rounded-5xl mb-4 shadow-sm border border-rs-bg flex-row items-center">
          {/* Profile Pic */}
          <Image source={{ uri: buddy.img }} className="w-16 h-16 rounded-full border-2 border-rs-green" />

          {/* Info */}
          <View className="flex-1 ml-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-rs-dark">{buddy.name}</Text>
              {/* Sync Badge */}
              <View className="bg-rs-bg px-3 py-1 rounded-full border border-rs-green/20">
                <Text className="text-rs-green font-bold text-xs">{buddy.score}% Match</Text>
              </View>
            </View>

            {/* Tags */}
            <View className="flex-row flex-wrap mt-2 gap-2">
              {buddy.tags.map((tag, i) => (
                <View key={i} className="bg-slate-100 px-2 py-1 rounded-md">
                  <Text className="text-[10px] text-rs-gray font-medium uppercase tracking-widest">{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sync Button */}
          <TouchableOpacity className="ml-2 bg-rs-green p-3 rounded-2xl shadow-lg shadow-green-900/30">
            <FontAwesome6 name="bolt-lightning" size={16} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default BuddyMatch;