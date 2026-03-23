import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
// Notice we are using the alias here too, just like in BuddyMatch!
import { getPotentialBuddies, sendSyncRequest, BuddyMatch as BuddyMatchType } from '../lib/services/tripService';

export default function FindBuddyScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [buddies, setBuddies] = useState<BuddyMatchType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuddies = async (query?: string) => {
    setLoading(true);
    const data = await getPotentialBuddies({ destination: query });
    setBuddies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBuddies();
  }, []);

  const handleConnect = async (match: BuddyMatchType) => {
    const result = await sendSyncRequest(match.user.id, match.route.id);
    if (result.success) {
      Alert.alert(
        "Request Sent!", 
        `We've notified ${match.user.full_name} that you want to connect.`
      );
    } else {
      Alert.alert("Error", "Could not send request at this time.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Find a Buddy</Text>
        <View className="w-8" />
      </View>

      <View className="px-5 py-4">
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-800"
            placeholder="Where are you heading?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchBuddies(searchQuery)}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#30AF5B" className="mt-10" />
        ) : buddies.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">No buddies found for this destination.</Text>
        ) : (
          buddies.map((match) => (
            <View key={match.route.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center">
              <Image 
                source={{ uri: match.user.avatar_url || 'https://i.pravatar.cc/150' }} 
                className="w-16 h-16 rounded-full border-2 border-[#30AF5B]" 
              />
              
              <View className="flex-1 ml-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900">{match.user.full_name}</Text>
                  <View className="bg-green-50 px-2 py-1 rounded-md border border-green-200">
                    <Text className="text-[#30AF5B] text-xs font-bold">{match.matchPercentage}%</Text>
                  </View>
                </View>
                
                <Text className="text-sm font-semibold text-gray-800 mt-1">
                  📍 {match.route.destination}
                </Text>
                
                <Text className="text-xs text-gray-500 mt-1">
                  {match.route.start_date} to {match.route.end_date}
                </Text>
              </View>

              <TouchableOpacity 
                className="ml-3 bg-[#30AF5B] p-3.5 rounded-2xl shadow-sm"
                onPress={() => handleConnect(match)}
              >
                <FontAwesome6 name="bolt-lightning" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}