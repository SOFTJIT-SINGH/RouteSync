import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selectedVibe, setSelectedVibe] = useState('Any');
  const [selectedBudget, setSelectedBudget] = useState('Medium');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const vibes = ['Any', 'Adventure', 'Chill', 'Party', 'Nature', 'Roadtrip'];
  const budgets = ['Budget', 'Medium', 'Luxury', 'Any'];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-4xl overflow-hidden">
          <View className="p-6 pb-8">
            {/* Handle */}
            <View className="w-10 h-1 bg-hi-gray-10 rounded-full self-center mb-5" />

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-hi-dark">Filters</Text>
              <TouchableOpacity onPress={onClose} className="bg-hi-bg p-2.5 rounded-full border border-hi-gray-10">
                <Ionicons name="close" size={20} color="#292C27" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[70%]">
              {/* Travel Vibe */}
              <Text className="text-hi-dark font-extrabold text-base mb-3">Travel Vibe</Text>
              <View className="flex-row flex-wrap gap-3 mb-6">
                {vibes.map(vibe => (
                  <TouchableOpacity
                    key={vibe}
                    onPress={() => setSelectedVibe(vibe)}
                    className={`px-5 py-2.5 rounded-full border ${
                      selectedVibe === vibe
                        ? 'bg-hi-green border-hi-green'
                        : 'bg-white border-hi-gray-10'
                    }`}
                  >
                    <Text className={`font-bold ${selectedVibe === vibe ? 'text-white' : 'text-hi-dark'}`}>
                      {vibe}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Budget Level */}
              <Text className="text-hi-dark font-extrabold text-base mb-3">Budget Level</Text>
              <View className="flex-row gap-3 mb-6">
                {budgets.map(budget => (
                  <TouchableOpacity
                    key={budget}
                    onPress={() => setSelectedBudget(budget)}
                    className={`flex-1 items-center py-3.5 rounded-full border ${
                      selectedBudget === budget
                        ? 'bg-hi-dark border-hi-dark'
                        : 'bg-white border-hi-gray-10'
                    }`}
                  >
                    <Text className={`font-bold ${selectedBudget === budget ? 'text-white' : 'text-hi-dark'}`}>
                      {budget}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Exact Range */}
              <Text className="text-hi-dark font-extrabold text-base mb-3 mt-2">Or Enter Exact Range (₹)</Text>
              <View className="flex-row items-center justify-between mb-8 gap-4">
                <View className="flex-1">
                  <View className="bg-hi-bg border border-hi-gray-10 rounded-2xl p-4 flex-row items-center">
                    <Text className="text-hi-gray-30 font-bold mr-1">₹</Text>
                    <TextInput
                      value={minBudget}
                      onChangeText={setMinBudget}
                      placeholder="Min"
                      keyboardType="numeric"
                      placeholderTextColor="#A2A2A2"
                      className="flex-1 font-bold text-hi-dark text-base"
                    />
                  </View>
                </View>
                <View className="w-4 h-0.5 bg-hi-gray-20" />
                <View className="flex-1">
                  <View className="bg-hi-bg border border-hi-gray-10 rounded-2xl p-4 flex-row items-center">
                    <Text className="text-hi-gray-30 font-bold mr-1">₹</Text>
                    <TextInput
                      value={maxBudget}
                      onChangeText={setMaxBudget}
                      placeholder="Max"
                      keyboardType="numeric"
                      placeholderTextColor="#A2A2A2"
                      className="flex-1 font-bold text-hi-dark text-base"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View className="pt-4">
              <TouchableOpacity
                onPress={onClose}
                className="bg-hi-green py-4 rounded-full items-center shadow-lg shadow-green-900/20"
              >
                <Text className="text-white font-black text-lg tracking-wide">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}