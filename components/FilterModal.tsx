import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
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
      <View className="flex-1 justify-end bg-black/50">
        <BlurView intensity={40} tint="dark" className="rounded-t-[32px] overflow-hidden">
          <View className="bg-white/80 p-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-rs-dark">Filters</Text>
              <TouchableOpacity onPress={onClose} className="bg-white/60 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[70%]">
              {/* Travel Vibe */}
              <Text className="text-rs-dark font-extrabold text-base mb-3">Travel Vibe</Text>
              <View className="flex-row flex-wrap gap-3 mb-6">
                {vibes.map(vibe => (
                  <TouchableOpacity
                    key={vibe}
                    onPress={() => setSelectedVibe(vibe)}
                    className={`px-5 py-2.5 rounded-full border ${
                      selectedVibe === vibe
                        ? 'bg-rs-green border-rs-green'
                        : 'bg-white/40 border-white/60 backdrop-blur-sm'
                    }`}
                  >
                    <Text className={`font-bold ${selectedVibe === vibe ? 'text-white' : 'text-rs-dark'}`}>
                      {vibe}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Budget Level */}
              <Text className="text-rs-dark font-extrabold text-base mb-3">Budget Level</Text>
              <View className="flex-row gap-3 mb-6">
                {budgets.map(budget => (
                  <TouchableOpacity
                    key={budget}
                    onPress={() => setSelectedBudget(budget)}
                    className={`flex-1 items-center py-3.5 rounded-2xl border ${
                      selectedBudget === budget
                        ? 'bg-rs-dark border-rs-dark'
                        : 'bg-white/40 border-white/60 backdrop-blur-sm'
                    }`}
                  >
                    <Text className={`font-bold ${selectedBudget === budget ? 'text-white' : 'text-rs-dark'}`}>
                      {budget}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Exact Range */}
              <Text className="text-rs-dark font-extrabold text-base mb-3 mt-2">Or Enter Exact Range (₹)</Text>
              <View className="flex-row items-center justify-between mb-8 gap-4">
                <View className="flex-1">
                  <View className="bg-white/40 border border-white/60 rounded-2xl p-4 flex-row items-center">
                    <Text className="text-rs-gray font-bold mr-1">₹</Text>
                    <TextInput
                      value={minBudget}
                      onChangeText={setMinBudget}
                      placeholder="Min"
                      keyboardType="numeric"
                      placeholderTextColor="#7B7B7B"
                      className="flex-1 font-bold text-rs-dark text-base"
                    />
                  </View>
                </View>
                <View className="w-4 h-0.5 bg-gray-400" />
                <View className="flex-1">
                  <View className="bg-white/40 border border-white/60 rounded-2xl p-4 flex-row items-center">
                    <Text className="text-rs-gray font-bold mr-1">₹</Text>
                    <TextInput
                      value={maxBudget}
                      onChangeText={setMaxBudget}
                      placeholder="Max"
                      keyboardType="numeric"
                      placeholderTextColor="#7B7B7B"
                      className="flex-1 font-bold text-rs-dark text-base"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View className="pt-4">
              <TouchableOpacity
                onPress={onClose}
                className="bg-rs-green py-4 rounded-2xl items-center shadow-lg shadow-green-900/20"
              >
                <Text className="text-white font-black text-lg tracking-wide">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}