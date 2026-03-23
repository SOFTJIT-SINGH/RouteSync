import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function AddTripScreen({ navigation }: any) {
  const [destination, setDestination] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveTrip = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      Alert.alert('Missing Info', 'Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add a trip.');
        return;
      }

      const { error } = await supabase.from('trips').insert([
        {
          user_id: user.id,
          destination,
          start_point: startPoint || 'Flexible',
          start_date: startDate,
          end_date: endDate,
          budget_min: parseFloat(budget),
          visibility: 'public'
        }
      ]);

      if (error) throw error;

      Alert.alert(
        'Trip Planned!', 
        'Your route is now live and other travelers can match with you.',
        [{ text: 'Awesome', onPress: () => navigation.goBack() }]
      );

    } catch (error: any) {
      Alert.alert('Error saving trip', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-4 flex-row items-center justify-between bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Plan a Route</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Where to?</Text>
          <Text className="text-gray-500 text-base">Drop your itinerary details below so we can find your perfect travel buddy.</Text>
        </View>

        <View className="space-y-4 mb-8">
          <View className="bg-white rounded-2xl border border-gray-200 px-4 py-1 shadow-sm mb-4">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Destination *</Text>
            <TextInput
              placeholder="e.g., Manali, Himachal Pradesh"
              value={destination}
              onChangeText={setDestination}
              className="h-10 text-base text-gray-900 mb-1"
            />
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 px-4 py-1 shadow-sm mb-4">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Starting Point</Text>
            <TextInput
              placeholder="e.g., Delhi (or leave blank)"
              value={startPoint}
              onChangeText={setStartPoint}
              className="h-10 text-base text-gray-900 mb-1"
            />
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-2xl border border-gray-200 px-4 py-1 shadow-sm w-[48%]">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Start (YYYY-MM-DD) *</Text>
              <TextInput
                placeholder="2026-10-15"
                value={startDate}
                onChangeText={setStartDate}
                className="h-10 text-base text-gray-900 mb-1"
              />
            </View>

            <View className="bg-white rounded-2xl border border-gray-200 px-4 py-1 shadow-sm w-[48%]">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">End (YYYY-MM-DD) *</Text>
              <TextInput
                placeholder="2026-10-22"
                value={endDate}
                onChangeText={setEndDate}
                className="h-10 text-base text-gray-900 mb-1"
              />
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 px-4 py-1 shadow-sm mb-8">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Estimated Budget (₹) *</Text>
            <TextInput
              placeholder="e.g., 15000"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              className="h-10 text-base text-gray-900 mb-1"
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSaveTrip}
          disabled={loading}
          className={`py-4 rounded-2xl items-center shadow-sm mb-10 ${loading ? 'bg-green-300' : 'bg-[#30AF5B]'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Publish Route</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}