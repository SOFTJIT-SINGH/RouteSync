import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// Your Custom Components
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';
import FilterModal from '../components/FilterModal';

export default function HomeScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* 1. Navbar - Pinned to top */}
      <View className="px-6 py-4">
        <Navbar />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 2. Main Title - Balanced scaling */}
        <View className="px-6 pt-2 pb-8">
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Route<Text className="text-[#30AF5B]">Sync</Text>
          </Text>
          <Text className="text-base text-gray-500 mt-1.5 font-medium leading-relaxed pr-4">
            Find the perfect companion for your next adventure.
          </Text>
        </View>

        {/* 3. Hero Actions */}
        <View className="px-6 mb-10">
          <HeroButtons />
        </View>

        {/* 4. Active Syncs */}
        <View className="mb-10">
          <View className="px-6 flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 tracking-tight">Active Syncs</Text>
            <TouchableOpacity>
              <Text className="text-[#30AF5B] font-semibold text-sm">See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Note: No px-6 wrapper here. ActiveSyncs needs to stretch to the edges 
              so the internal horizontal ScrollView doesn't clip on the sides. */}
          <ActiveSyncs />
        </View>

        {/* 5. Add Itinerary */}
        <View className="px-6 mb-10">
          <AddItinerary />
        </View>

        {/* 6. Buddy Matches */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-900 tracking-tight">Find Matches</Text>
              <Text className="text-sm text-gray-500 mt-0.5 font-medium">Travelers heading your way</Text>
            </View>
            
            {/* Filter Button - Contextually placed and properly sized */}
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="bg-white w-10 h-10 rounded-xl border border-gray-200 shadow-sm items-center justify-center"
            >
              <Feather name="sliders" size={18} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate('Chat')}>
            <BuddyMatch />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <FilterModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}