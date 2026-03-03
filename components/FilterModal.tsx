import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const categories = ['Solo', 'Group', 'Adventure', 'Luxury', 'Budget'];
  const [activeCat, setActiveCat] = useState('Solo');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[50px] p-8 pt-5 h-[70%] shadow-2xl">
          
          {/* Handlebar */}
          <View className="w-12 h-1.5 bg-rs-bg rounded-full self-center mb-6" />

          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-bold text-rs-dark">Filter Syncs</Text>
            <TouchableOpacity onPress={onClose} className="bg-rs-bg p-2 rounded-full">
              <Ionicons name="close" size={20} color="#30AF5B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View className="mb-8">
              <Text className="text-rs-dark font-bold text-lg mb-4">Travel Style</Text>
              <View className="flex-row flex-wrap gap-3">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCat(cat)}
                    className={`px-6 py-3 rounded-2xl border ${
                      activeCat === cat ? 'bg-rs-green border-rs-green' : 'bg-white border-rs-bg'
                    }`}
                  >
                    <Text className={`font-bold text-sm ${activeCat === cat ? 'text-white' : 'text-rs-gray'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget Range (Visual Placeholder for Slider) */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-rs-dark font-bold text-lg">Max Budget</Text>
                <Text className="text-rs-green font-bold">₹15,000</Text>
              </View>
              <View className="h-2 w-full bg-rs-bg rounded-full relative">
                <View className="absolute h-full w-[60%] bg-rs-green rounded-full" />
                <View className="absolute h-6 w-6 bg-white border-4 border-rs-green rounded-full -top-2 left-[58%] shadow-sm" />
              </View>
            </View>

            {/* Matching Precision */}
            <View className="mb-10">
              <Text className="text-rs-dark font-bold text-lg mb-4">Compatibility Score</Text>
              <View className="flex-row items-center bg-rs-bg p-4 rounded-3xl">
                <MaterialIcons name="bolt" size={24} color="#30AF5B" />
                <Text className="ml-3 text-rs-gray font-medium flex-1">Show only 80%+ matches</Text>
                <View className="w-10 h-6 bg-rs-green rounded-full items-end p-1">
                   <View className="bg-white w-4 h-4 rounded-full" />
                </View>
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity 
              onPress={onClose}
              className="bg-rs-green py-5 rounded-3xl shadow-lg shadow-green-900/20"
            >
              <Text className="text-white text-center font-bold text-lg">Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;