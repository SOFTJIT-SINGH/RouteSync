// screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Components
import Navbar from '../components/Navbar';
import HeroButtons from '../components/HeroButtons';
import ActiveSyncs from '../components/ActiveSyncs';
import BuddyMatch from '../components/BuddyMatch';
import AddItinerary from '../components/AddItinerary';
import FilterModal from '../components/FilterModal';
import DemoActiveSyncs from '../components/DemoActiveSyncs';
import DemoBuddyMatch from '../components/DemoBuddyMatch';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeDashboard'>;

const HomeScreen = ({ navigation }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Refresh State
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Incrementing this key forces child components to remount and re-fetch data
    setRefreshKey((prevKey) => prevKey + 1);
    
    // Simulate a slight delay so the UI spinner has time to show smoothly
    setTimeout(() => {
      setRefreshing(false);
    }, 300); 
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-rs-bg">
      <ScrollView 
        className="px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#30AF5B" 
            colors={['#30AF5B']} 
          />
        }
      >
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
          className="self-end rounded-2xl border border-rs-bg bg-white p-3 shadow-sm"
        >
          <Ionicons name="options-outline" size={24} color="#30AF5B" />
        </TouchableOpacity>

        <HeroButtons />
        
        {/* Real Data Components - Passing refreshKey to force remount on pull */}
        <DemoActiveSyncs />
        <ActiveSyncs key={`active-syncs-${refreshKey}`} />
        <AddItinerary />

        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <DemoBuddyMatch />
          <BuddyMatch key={`buddy-match-${refreshKey}`} />
        </TouchableOpacity>
        
        <View className="relative mb-20 mt-10 overflow-hidden rounded-[32px] bg-rs-green p-8">
          <Text className="text-2xl font-bold text-white">Feeling Lost?</Text>
          <Text className="mt-2 text-sm leading-6 text-white/80">
            Our RouteSync engine matches you with travelers who know the way.
          </Text>
        </View>
      </ScrollView>
      
      <FilterModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

export default HomeScreen;