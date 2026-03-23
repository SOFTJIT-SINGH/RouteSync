// screens/SyncRouteScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { syncUserRoutes } from '../lib/services/tripService';

export default function SyncRouteScreen({ navigation }: any) {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    if (!start || !destination) return;
    setIsSyncing(true);
    const result = await syncUserRoutes(start, destination);
    setSyncResult(result);
    setIsSyncing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-rs-bg">
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Sync Route</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <Text className="text-gray-600 mb-6 text-base leading-relaxed">
          Map your journey and we'll cross-reference it with our database to find travelers crossing your path.
        </Text>

        <View className="space-y-4 mb-8">
          <View className="bg-white rounded-xl border border-gray-200 p-1 mb-4 shadow-sm">
             <TextInput 
              placeholder="Starting Point (e.g., Amritsar)" 
              className="p-3 text-base"
              value={start}
              onChangeText={setStart}
            />
          </View>
          <View className="bg-white rounded-xl border border-gray-200 p-1 mb-4 shadow-sm">
             <TextInput 
              placeholder="Destination" 
              className="p-3 text-base"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSync}
          disabled={isSyncing || !start || !destination}
          className={`py-4 rounded-xl items-center ${isSyncing || !start || !destination ? 'bg-green-300' : 'bg-[#30AF5B]'}`}
        >
          {isSyncing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Analyze Overlaps</Text>
          )}
        </TouchableOpacity>

        {syncResult && (
          <View className="mt-8 bg-green-50 p-6 rounded-2xl border border-green-200">
            <Ionicons name="checkmark-circle" size={32} color="#15803d" className="mb-2" />
            <Text className="text-lg font-bold text-green-900 mt-2">Routes Synchronized!</Text>
            <Text className="text-green-800 mt-1 mb-4">
              We found {syncResult.syncedWith} travelers crossing your exact path.
            </Text>
            
            <Text className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">
              Shared Waypoints
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {syncResult.sharedWaypoints.map((wp: string, index: number) => (
                <View key={index} className="bg-white px-3 py-1.5 rounded-full border border-green-200 mr-2 mb-2">
                  <Text className="text-green-800 font-semibold">{wp}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('FindBuddy')}
              className="mt-6 bg-green-800 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">View Matched Buddies</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}