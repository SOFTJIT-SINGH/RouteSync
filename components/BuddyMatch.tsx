import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BuddyMatch() {
  return (
    <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm shadow-gray-200">
      
      {/* 1. Profile Header Row */}
      <View className="flex-row items-center">
        
        {/* Avatar with Online Dot */}
        <View className="relative">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }} 
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          {/* Green Online Indicator */}
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </View>

        {/* Identity & Match Score */}
        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-gray-900 tracking-tight">Priya Patel</Text>
            
            {/* The "Tinder-style" Match Pill */}
            <View className="bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex-row items-center">
              <Ionicons name="flame" size={12} color="#30AF5B" />
              <Text className="text-xs font-extrabold text-[#30AF5B] ml-1">94% Match</Text>
            </View>
          </View>
          
          <Text className="text-sm font-medium text-gray-500 mt-0.5">
            Heading to <Text className="text-gray-900 font-bold">Goa</Text> • Dec 20
          </Text>
        </View>

      </View>

      {/* 2. Shared Interests (Vibe Check) */}
      {/* Using 'flex-wrap' so pills automatically drop to the next line if they get too long */}
      <View className="flex-row flex-wrap mt-5 gap-2">
        <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Text className="text-xs font-semibold text-gray-600">📸 Photography</Text>
        </View>
        <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Text className="text-xs font-semibold text-gray-600">🍕 Foodie</Text>
        </View>
        <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <Text className="text-xs font-semibold text-gray-600">🌅 Sunsets</Text>
        </View>
      </View>

      {/* 3. Social Proof & Call to Action */}
      <View className="mt-5 flex-row items-center justify-between bg-gray-50 p-1.5 rounded-[20px] border border-gray-100">
         
         {/* Mutual Connections (Overlapping Avatars) */}
         <View className="flex-row items-center ml-3">
           <View className="flex-row -space-x-2 mr-2">
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} className="w-7 h-7 rounded-full border-2 border-white" />
              <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} className="w-7 h-7 rounded-full border-2 border-white" />
           </View>
           <Text className="text-xs font-bold text-gray-500">2 mutuals</Text>
         </View>
         
         {/* Primary Action Button */}
         {/* We use a View here instead of TouchableOpacity because the whole card in HomeScreen is already wrapped in a TouchableOpacity that navigates to Chat! */}
         <View className="bg-[#30AF5B] px-5 py-2.5 rounded-[16px] shadow-sm shadow-green-200 flex-row items-center">
           <Text className="text-white font-bold mr-2 text-sm">Say Hi</Text>
           <Ionicons name="send" size={14} color="white" />
         </View>
         
      </View>
    </View>
  );
}