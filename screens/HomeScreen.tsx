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
       
       {/*2. Main Title - Fixed Size */}
        <View className="px-6 pt-2 pb-6">
          <Text className="text-[40px] font-black text-gray-700 tracking-tighter leading-tight">
            Route<Text className="text-[#30AF5B]">Sync</Text>.
          </Text>
          <Text className="text-base text-gray-500 mt-1 font-medium leading-relaxed pr-8">
            Find the perfect companion for your next adventure.
          </Text>
        </View>

        {/* 3. Hero Actions */}
        <View className="px-6 mb-10">
          <HeroButtons />
        </View>

        {/* 4. Active Syncs */}
        <View className="mb-2">
          {/* 4. Active Syncs */}
        <View className="mb-10">
          <View className="px-6 flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 tracking-tight">Active Syncs</Text>
            
            {/* WIRE THIS UP TO GO TO MATCHES OR A SPECIFIC SYNCS PAGE */}
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text className="text-[#30AF5B] font-semibold text-sm">See all</Text>
            </TouchableOpacity>
            
          </View>
          <ActiveSyncs />
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
        {/* 6. Buddy Matches */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-900 tracking-tight">Find Matches</Text>
              <Text className="text-sm text-gray-500 mt-0.5 font-medium">Travelers heading your way</Text>
            </View>
            
            {/* Filter Button */}
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="bg-white w-10 h-10 rounded-xl border border-gray-200 shadow-sm items-center justify-center"
            >
              <Feather name="sliders" size={18} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          {/* The Match Card */}
          <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate('Chat')}>
            <BuddyMatch />
          </TouchableOpacity>

          {/* NEW: See All Matches Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            className="mt-4 py-3.5 bg-green-50 rounded-[16px] border border-green-100 items-center flex-row justify-center"
            onPress={() => navigation.navigate('Matches')}
          >
            <Text className="text-[#30AF5B] font-bold text-sm mr-1.5">See all matches</Text>
            <Feather name="arrow-right" size={16} color="#30AF5B" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <FilterModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}