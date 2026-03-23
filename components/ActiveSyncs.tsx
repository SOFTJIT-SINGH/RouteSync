import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// Using the mock data we injected into your Supabase earlier
const mockSyncs = [
  {
    id: '1',
    destination: 'Manali, HP',
    start_point: 'Chandigarh',
    date: 'Oct 15 - Oct 22',
    buddies: 2,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    destination: 'Spiti Valley',
    start_point: 'Shimla',
    date: 'Jun 10 - Jun 20',
    buddies: 4,
    image: 'https://images.unsplash.com/photo-1542601098-3adb3baeb1ec?q=80&w=600&auto=format&fit=crop'
  }
];

export default function ActiveSyncs() {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      // This is the magic line. It aligns the first card with your screen's px-6 padding, 
      // but allows smooth edge-to-edge scrolling.
      contentContainerStyle={{ paddingHorizontal: 24 }} 
    >
      {mockSyncs.map((sync, index) => (
        <TouchableOpacity 
          key={sync.id}
          activeOpacity={0.95}
          // The right margin separates the cards, but we don't add it to the very last card
          className={`bg-white w-64 rounded-[24px] overflow-hidden border border-gray-100 shadow-sm shadow-gray-200 ${index !== mockSyncs.length - 1 ? 'mr-4' : ''}`}
        >
          {/* Top Image Section */}
          <View className="relative">
            <Image 
              source={{ uri: sync.image }} 
              className="w-full h-36 bg-gray-100"
              resizeMode="cover"
            />
            {/* Floating Badge */}
            <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1.5 rounded-lg flex-row items-center shadow-sm">
              <Ionicons name="people" size={14} color="#30AF5B" />
              <Text className="text-xs font-bold text-gray-800 ml-1.5">{sync.buddies} Joined</Text>
            </View>
          </View>

          {/* Bottom Info Section */}
          <View className="p-4">
            <Text className="text-lg font-extrabold text-gray-900 mb-1.5 tracking-tight" numberOfLines={1}>
              {sync.destination}
            </Text>
            
            <View className="flex-row items-center mb-3">
              <Feather name="map-pin" size={14} color="#9CA3AF" />
              <Text className="text-sm font-medium text-gray-500 ml-1.5" numberOfLines={1}>
                From {sync.start_point}
              </Text>
            </View>

            {/* Date Pill */}
            <View className="flex-row items-center bg-gray-50 self-start px-3 py-1.5 rounded-lg border border-gray-100">
              <Feather name="calendar" size={12} color="#30AF5B" />
              <Text className="text-xs font-bold text-gray-700 ml-2">{sync.date}</Text>
            </View>
          </View>

        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}