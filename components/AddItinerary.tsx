import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 1. Import this!

export default function AddItinerary() {
  const navigation = useNavigation<any>(); // 2. Initialize it

  return (
    <View className="bg-emerald-800 rounded-[32px] p-6 relative overflow-hidden shadow-xl shadow-gray-900/20">
      {/* ... (Keep your existing background glow views) ... */}
      <View className="absolute -right-12 -top-12 bg-white/5 w-40 h-40 rounded-full blur-3xl" />
      <View className="absolute -right-4 -bottom-10 bg-[#30AF5B]/20 w-32 h-32 rounded-full blur-2xl" />

      <View className="flex-row justify-between items-center z-10">
        <View className="flex-1 pr-4">
          <View className="bg-white/10 self-start px-3 py-1.5 rounded-xl mb-3 border border-white/10 backdrop-blur-sm">
            <Text className="text-white text-[10px] font-black uppercase tracking-widest">Plan a Trip</Text>
          </View>
          <Text className="text-2xl font-black text-white tracking-tight mb-2 leading-[30px]">
            Got a destination{"\n"}in mind?
          </Text>
          <Text className="text-gray-400 text-sm font-medium mb-6 leading-relaxed pr-2">
            Draft your itinerary and find the perfect buddies to tag along.
          </Text> 

          <TouchableOpacity 
            activeOpacity={0.85}
            className="bg-[#30AF5B] py-3.5 px-5 rounded-[16px] flex-row items-center self-start shadow-sm shadow-green-900/50"
            onPress={() => navigation.navigate('CreateTrip')} // 3. Wire it up!
          >
            <FontAwesome6 name="plus" size={14} color="white" />
            <Text className="text-white font-bold text-sm ml-2">Create Itinerary</Text>
          </TouchableOpacity>
        </View>

        <View className="justify-center items-center mr-2">
           <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center border border-white/10 backdrop-blur-md relative">
             <FontAwesome6 name="map-location-dot" size={32} color="#30AF5B" />
             <View className="absolute -bottom-2 -right-2 bg-gray-800 p-2 rounded-full border-2 border-gray-900">
               <Ionicons name="compass" size={18} color="white" />
             </View>
           </View>
        </View>
      </View>
    </View>
  );
}