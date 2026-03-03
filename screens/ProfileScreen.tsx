import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6, MaterialIcons, Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  const stats = [
    { label: 'Syncs', value: '24' },
    { label: 'Routes', value: '12' },
    { label: 'Rating', value: '4.9' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-rs-bg">
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. Header & Cover */}
        <View className="bg-rs-green h-40 w-full rounded-b-[50px] relative">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="absolute top-4 left-5 p-2 bg-white/20 rounded-full"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. Profile Card */}
        <View className="px-5 -mt-20">
          <View className="bg-white p-8 rounded-5xl shadow-xl shadow-black/5 items-center">
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=softjit' }} 
              className="w-24 h-24 rounded-full border-4 border-white -mt-16 shadow-lg"
            />
            
            <View className="flex-row items-center mt-4">
              <Text className="text-2xl font-bold text-rs-dark">Softjit Singh</Text>
              <MaterialIcons name="verified" size={20} color="#30AF5B" style={{ marginLeft: 6 }} />
            </View>
            <Text className="text-rs-gray font-medium">MCA Traveler • Amritsar</Text>

            {/* Stats Row */}
            <View className="flex-row justify-between w-full mt-8 border-t border-rs-bg pt-6">
              {stats.map((stat, i) => (
                <View key={i} className="items-center flex-1">
                  <Text className="text-xl font-bold text-rs-dark">{stat.value}</Text>
                  <Text className="text-rs-gray text-[10px] uppercase font-bold tracking-widest">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 3. Past Syncs (Module 7: Reputation) */}
        <View className="px-5 mt-10 mb-20">
          <Text className="text-xl font-bold text-rs-dark mb-4 ml-2">Recent Journeys</Text>
          
          {[1, 2].map((item) => (
            <View key={item} className="bg-white p-5 rounded-3xl mb-4 flex-row items-center shadow-sm">
              <View className="bg-rs-bg p-3 rounded-2xl">
                <FontAwesome6 name="mountain-sun" size={20} color="#30AF5B" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-rs-dark font-bold">Kasol Expedition</Text>
                <Text className="text-rs-gray text-xs">Feb 2026 • 3 Buddies Synced</Text>
              </View>
              <TouchableOpacity className="bg-rs-bg p-2 rounded-full">
                <MaterialIcons name="star" size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;