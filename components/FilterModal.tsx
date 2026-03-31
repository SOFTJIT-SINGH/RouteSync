import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const [selectedVibe, setSelectedVibe] = useState('Any');
  const [selectedBudget, setSelectedBudget] = useState('Medium');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const vibes = ['Any', 'Adventure', 'Chill', 'Party', 'Nature', 'Roadtrip'];
  const budgets = ['Budget', 'Medium', 'Luxury', 'Any'];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[32px] p-6 h-[75%] shadow-2xl">
          
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-black text-[#1F2937]">Filters</Text>
            <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            
            {/* Travel Vibe (Hilink Styled Pills) */}
            <Text className="text-[#1F2937] font-extrabold text-base mb-4">Travel Vibe</Text>
            <View className="flex-row flex-wrap gap-3 mb-8">
              {vibes.map(vibe => (
                <TouchableOpacity 
                  key={vibe} 
                  onPress={() => setSelectedVibe(vibe)}
                  className={`px-5 py-2.5 rounded-full border ${
                    selectedVibe === vibe ? 'bg-[#30AF5B] border-[#30AF5B]' : 'bg-[#FAFAFA] border-gray-200'
                  }`}
                >
                  <Text className={`font-bold ${selectedVibe === vibe ? 'text-white' : 'text-[#1F2937]'}`}>
                    {vibe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Smart Budget Buttons (Replaces broken slider) */}
            <Text className="text-[#1F2937] font-extrabold text-base mb-4">Budget Level</Text>
            <View className="flex-row gap-3 mb-6">
              {budgets.map(budget => (
                <TouchableOpacity 
                  key={budget} 
                  onPress={() => setSelectedBudget(budget)}
                  className={`flex-1 items-center py-3.5 rounded-2xl border ${
                    selectedBudget === budget ? 'bg-gray-900 border-gray-900' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`font-bold ${selectedBudget === budget ? 'text-white' : 'text-gray-600'}`}>
                    {budget}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Exact Input Fields (Optional override) */}
            <Text className="text-[#1F2937] font-extrabold text-base mb-4 mt-2">Or Enter Exact Range (₹)</Text>
            <View className="flex-row items-center justify-between mb-8 space-x-4">
              <View className="flex-1">
                <View className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 flex-row items-center">
                  <Text className="text-gray-500 font-bold mr-1">₹</Text>
                  <TextInput 
                    value={minBudget}
                    onChangeText={setMinBudget}
                    placeholder="Min"
                    keyboardType="numeric"
                    className="flex-1 font-bold text-[#1F2937] text-base"
                  />
                </View>
              </View>

              <View className="w-4 h-0.5 bg-gray-300" /> {/* Dash between inputs */}

              <View className="flex-1">
                <View className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 flex-row items-center">
                  <Text className="text-gray-500 font-bold mr-1">₹</Text>
                  <TextInput 
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    placeholder="Max"
                    keyboardType="numeric"
                    className="flex-1 font-bold text-[#1F2937] text-base"
                  />
                </View>
              </View>
            </View>

          </ScrollView>

          {/* Apply Button */}
          <View className="pt-4 border-t border-gray-100">
            <TouchableOpacity 
              onPress={onClose}
              className="bg-[#30AF5B] py-4 rounded-[20px] items-center shadow-lg shadow-green-900/20"
            >
              <Text className="text-white font-black text-lg tracking-wide">Apply Filters</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}