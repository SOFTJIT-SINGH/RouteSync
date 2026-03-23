import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// Notice the 'as BuddyMatchType' alias here!
import { getPotentialBuddies, sendSyncRequest, BuddyMatch as BuddyMatchType } from '../lib/services/tripService';

const BuddyMatch = () => {
  // Using the new alias here
  const [matches, setMatches] = useState<BuddyMatchType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    const realMatches = await getPotentialBuddies();
    setMatches(realMatches);
    setLoading(false);
  };

  const handleConnect = async (match: BuddyMatchType) => {
    const result = await sendSyncRequest(match.user.id, match.route.id);
    
    if (result.success) {
      Alert.alert(
        "Sync Request Sent!", 
        `We've notified ${match.user.full_name} that you want to connect.`,
        [{ text: "OK", onPress: () => navigation.navigate('Chat') }]
      );
    } else {
      Alert.alert("Error", "Could not send request at this time.");
    }
  };

  return (
    <View className="mt-10 mb-10">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-gray-900">Top Syncs For You</Text>
        <TouchableOpacity onPress={fetchMatches} className="p-1">
          <Ionicons name="refresh-circle" size={32} color="#30AF5B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#30AF5B" className="my-8" />
      ) : matches.length === 0 ? (
        <View className="bg-white p-6 rounded-3xl shadow-sm items-center justify-center">
          <Text className="text-gray-500 font-medium">No matches found yet.</Text>
        </View>
      ) : (
        matches.map((match) => (
          <View key={match.route.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center">
            <Image 
              source={{ uri: match.user.avatar_url || 'https://i.pravatar.cc/150' }} 
              className="w-16 h-16 rounded-full border-2 border-[#30AF5B]" 
            />

            <View className="flex-1 ml-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">{match.user.full_name}</Text>
                <View className="bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <Text className="text-[#30AF5B] font-bold text-xs">{match.matchPercentage}% Match</Text>
                </View>
              </View>

              <Text className="text-sm text-gray-500 mt-1 font-medium">Heading to {match.route.destination}</Text>
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
    </View>
  );
};

export default BuddyMatch;