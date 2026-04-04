import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

export default function AddItinerary({ navigation }: { navigation: any }) {

  return (
    <View className="bg-hi-dark rounded-4xl p-6 relative overflow-hidden">
      {/* Subtle pattern overlay — Hilink "Get App" style */}
      <View className="absolute -right-16 -top-16 w-52 h-52 bg-white/5 rounded-full" />
      <View className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />

      <View className="flex-row justify-between items-center z-10">
        <View className="flex-1 pr-4">
          <View className="bg-white/10 self-start px-3 py-1.5 rounded-full mb-3">
            <Text className="text-white text-[10px] font-black uppercase tracking-widest leading-tight">Plan a Trip</Text>
          </View>
          <Text className="text-2xl font-black text-white tracking-tight mb-2 leading-[28px]">
            Got a destination{"\n"}in mind?
          </Text>
          <Text className="text-white/60 text-sm font-medium mb-5 leading-relaxed pr-2">
            Draft your itinerary and find the perfect buddies to tag along.
          </Text> 

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.getParent()?.navigate('CreateTrip')}
            className="bg-hi-green px-6 py-3.5 rounded-full flex-row items-center self-start"
          >
            <FontAwesome6 name="plus" size={14} color="white" />
            <Text className="text-white font-black text-sm ml-2.5">Create Itinerary</Text>
          </TouchableOpacity>
        </View>

        <View className="justify-center items-center mr-2">
           <View className="w-20 h-20 bg-white/10 rounded-full items-center justify-center border border-white/10">
             <FontAwesome6 name="map-location-dot" size={28} color="#30AF5B" />
           </View>
        </View>
      </View>
    </View>
  );
}