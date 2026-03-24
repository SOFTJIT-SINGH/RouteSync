import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function FilterModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const [selectedVibe, setSelectedVibe] = useState('Any');
  const [minBudget, setMinBudget] = useState('5000');
  const [maxBudget, setMaxBudget] = useState('25000');

  const vibes = ['Any', 'Adventure', 'Chill', 'Party', 'Nature', 'Roadtrip'];

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
                  className={`px-5 py-2.5 rounded-full border ${selectedVibe === vibe ? 'bg-[#30AF5B] border-[#30AF5B]' : 'bg-[#FAFAFA] border-gray-200'}`}
                >
                  <Text className={`font-bold ${selectedVibe === vibe ? 'text-white' : 'text-[#1F2937]'}`}>{vibe}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Budget Range Slider & Inputs */}
            <Text className="text-[#1F2937] font-extrabold text-base mb-4">Budget Range (₹)</Text>
            
            {/* Visual Custom Range Bar */}
            <View className="mb-6 px-2">
              <View className="h-2 bg-gray-100 rounded-full w-full relative">
                {/* Active Green Track */}
                <View className="absolute h-2 bg-[#30AF5B] rounded-full left-[20%] right-[30%]" />
                {/* Thumb Handles */}
                <View className="absolute w-6 h-6 bg-white border-2 border-[#30AF5B] rounded-full -top-2 left-[18%] shadow-sm" />
                <View className="absolute w-6 h-6 bg-white border-2 border-[#30AF5B] rounded-full -top-2 right-[28%] shadow-sm" />
              </View>
              <View className="flex-row justify-between mt-3">
                <Text className="text-xs font-bold text-gray-400">₹0</Text>
                <Text className="text-xs font-bold text-gray-400">₹50k+</Text>
              </View>
            </View>

            {/* Exact Input Fields */}
            <View className="flex-row items-center justify-between mb-8 space-x-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-400 mb-2 ml-1">MIN</Text>
                <View className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 flex-row items-center">
                  <Text className="text-gray-500 font-bold mr-1">₹</Text>
                  <TextInput 
                    value={minBudget}
                    onChangeText={setMinBudget}
                    keyboardType="numeric"
                    className="flex-1 font-bold text-[#1F2937] text-base"
                  />
                </View>
              </View>

              <View className="w-4 h-0.5 bg-gray-300 mt-6" /> {/* Dash between inputs */}

              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-400 mb-2 ml-1">MAX</Text>
                <View className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 flex-row items-center">
                  <Text className="text-gray-500 font-bold mr-1">₹</Text>
                  <TextInput 
                    value={maxBudget}
                    onChangeText={setMaxBudget}
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
              <Text className="text-white font-black text-lg tracking-wide">Show 12 Matches</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}