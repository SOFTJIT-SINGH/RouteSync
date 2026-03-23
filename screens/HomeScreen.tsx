import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';
import FilterModal from '../components/FilterModal';

export default function HomeScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-rs-bg">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <Navbar />
        
        <View className="my-8">
          <Text className="text-4xl font-bold leading-tight text-rs-dark">
            Route<Text className="text-rs-green">Sync</Text>
          </Text>
          <Text className="mt-2 text-lg text-rs-gray">
            Find the perfect companion for your next adventure.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-white p-3 rounded-2xl border border-rs-bg shadow-sm self-end"
        >
          <Ionicons name="options-outline" size={24} color="#30AF5B" />
        </TouchableOpacity>

        <HeroButtons />
        <ActiveSyncs />
        <AddItinerary />

        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <BuddyMatch />
        </TouchableOpacity>
        
      </ScrollView>
      <FilterModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}