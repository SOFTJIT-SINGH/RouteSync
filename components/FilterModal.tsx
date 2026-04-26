import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterModal({ visible, onClose, onApply }: { visible: boolean; onClose: () => void; onApply?: (filters: { vibe: string; budget: string; minBudget: string; maxBudget: string }) => void }) {
  const [selectedVibe, setSelectedVibe] = useState('Any');
  const [selectedBudget, setSelectedBudget] = useState('Medium');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const vibes = ['Any', 'Adventure', 'Chill', 'Party', 'Nature', 'Roadtrip'];
  const budgets = ['Budget', 'Medium', 'Luxury', 'Any'];
  const genders = ['Any', 'Male', 'Female'];
  const modes = ['Any', 'Solo', 'Duo', 'Group', 'Join on way'];

  const [selectedGender, setSelectedGender] = useState('Any');
  const [selectedMode, setSelectedMode] = useState('Any');
  const [minTrust, setMinTrust] = useState('50');

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-[40px] overflow-hidden">
          <View className="p-6 pb-8">
            {/* Handle */}
            <View className="w-10 h-1.5 bg-hi-gray-10 rounded-full self-center mb-6" />

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-hi-dark tracking-tighter">Refine Matches</Text>
              <TouchableOpacity onPress={onClose} className="bg-hi-bg p-2.5 rounded-full border border-hi-gray-10">
                <Ionicons name="close" size={20} color="#292C27" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[75%]">
              {/* Travel Vibe */}
              <Text className="text-hi-dark font-black text-base mb-3">Travel Vibe</Text>
              <View className="flex-row flex-wrap gap-2.5 mb-6">
                {vibes.map(vibe => (
                  <TouchableOpacity
                    key={vibe}
                    onPress={() => setSelectedVibe(vibe)}
                    className={`px-5 py-3 rounded-2xl border ${
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

              {/* Gender Preference */}
              <Text className="text-hi-dark font-black text-base mb-3">Gender Preference</Text>
              <View className="flex-row gap-2.5 mb-6">
                {genders.map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setSelectedGender(g)}
                    className={`flex-1 items-center py-3.5 rounded-2xl border ${
                      selectedGender === g
                        ? 'bg-hi-dark border-hi-dark'
                        : 'bg-white border-hi-gray-10'
                    }`}
                  >
                    <Text className={`font-bold ${selectedGender === g ? 'text-white' : 'text-hi-dark'}`}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Trip Mode */}
              <Text className="text-hi-dark font-black text-base mb-3">Trip Mode</Text>
              <View className="flex-row flex-wrap gap-2.5 mb-6">
                {modes.map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSelectedMode(m)}
                    className={`px-4 py-3 rounded-2xl border ${
                      selectedMode === m
                        ? 'bg-hi-green border-hi-green'
                        : 'bg-white border-hi-gray-10'
                    }`}
                  >
                    <Text className={`font-bold ${selectedMode === m ? 'text-white' : 'text-hi-dark'}`}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Budget Level */}
              <Text className="text-hi-dark font-black text-base mb-3">Budget Level</Text>
              <View className="flex-row gap-2.5 mb-6">
                {budgets.map(budget => (
                  <TouchableOpacity
                    key={budget}
                    onPress={() => setSelectedBudget(budget)}
                    className={`flex-1 items-center py-3.5 rounded-2xl border ${
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

              {/* Min Trust Score */}
              <View className="flex-row justify-between items-center mb-3">
                 <Text className="text-hi-dark font-black text-base">Minimum Trust Score</Text>
                 <Text className="text-hi-green font-black">{minTrust}%</Text>
              </View>
              <View className="flex-row gap-2 mb-8">
                 {['0', '25', '50', '75'].map(score => (
                    <TouchableOpacity
                      key={score}
                      onPress={() => setMinTrust(score)}
                      className={`flex-1 items-center py-3 rounded-xl border ${
                        minTrust === score
                          ? 'bg-hi-dark border-hi-dark'
                          : 'bg-white border-hi-gray-10'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${minTrust === score ? 'text-white' : 'text-hi-dark'}`}>{score}+</Text>
                    </TouchableOpacity>
                 ))}
              </View>

            </ScrollView>

            {/* Apply Button */}
            <View className="pt-2">
              <TouchableOpacity
                onPress={() => {
                  if (onApply) {
                    onApply({ 
                      vibe: selectedVibe, 
                      budget: selectedBudget, 
                      minBudget, 
                      maxBudget,
                      gender: selectedGender,
                      mode: selectedMode,
                      minTrust: parseInt(minTrust, 10)
                    } as any);
                  }
                  onClose();
                }}
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