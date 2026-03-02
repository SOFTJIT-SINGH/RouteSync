import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';

const AddItinerary = () => {
  const [dest, setDest] = useState('');
  const [budget, setBudget] = useState('5000');

  return (
    <View className="mt-10 bg-white p-8 rounded-5xl shadow-xl shadow-black/5 border border-rs-bg">
      <View className="flex-row items-center mb-6">
        <View className="bg-rs-bg p-3 rounded-2xl mr-4">
          <FontAwesome6 name="route" size={20} color="#30AF5B" />
        </View>
        <Text className="text-2xl font-bold text-rs-dark">New Journey</Text>
      </View>

      {/* Destination Input */}
      <View className="mb-6">
        <Text className="text-rs-gray font-bold text-xs uppercase mb-2 ml-1">Destination</Text>
        <View className="flex-row items-center bg-rs-bg rounded-2xl px-4 py-3 border border-rs-green/10">
          <MaterialIcons name="place" size={20} color="#7B7B7B" />
          <TextInput 
            className="flex-1 ml-2 text-rs-dark font-medium" 
            placeholder="Where are you heading?"
            value={dest}
            onChangeText={setDest}
          />
        </View>
      </View>

      {/* Date & Budget Row */}
      <View className="flex-row justify-between mb-8">
        <View className="w-[48%]">
          <Text className="text-rs-gray font-bold text-xs uppercase mb-2 ml-1">Start Date</Text>
          <TouchableOpacity className="bg-rs-bg rounded-2xl p-4 border border-rs-green/10 flex-row items-center">
             <MaterialIcons name="event" size={18} color="#7B7B7B" />
             <Text className="ml-2 text-rs-dark font-medium text-xs">Mar 15, 2026</Text>
          </TouchableOpacity>
        </View>

        <View className="w-[48%]">
          <Text className="text-rs-gray font-bold text-xs uppercase mb-2 ml-1">Budget (₹)</Text>
          <View className="bg-rs-bg rounded-2xl p-4 border border-rs-green/10 flex-row items-center">
             <Text className="text-rs-green font-bold">₹</Text>
             <TextInput 
                className="ml-2 text-rs-dark font-bold text-xs" 
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
             />
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        className="bg-rs-green py-5 rounded-3xl flex-row justify-center items-center shadow-lg shadow-green-900/20"
        onPress={() => alert(`Syncing ${dest} to RouteSync Engine...`)}
      >
        <Text className="text-white font-bold text-lg mr-3">Sync Itinerary</Text>
        <FontAwesome6 name="arrow-right" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AddItinerary;