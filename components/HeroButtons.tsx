import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HeroButtons() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Discover');

  const tabs = [
    { id: 'Discover', icon: 'compass', type: 'Ionicons', route: 'Home' },
    { id: 'Buddies', icon: 'people', type: 'Ionicons', route: 'Matches' },
    { id: 'My Trips', icon: 'map', type: 'Feather', route: 'Profile' },
    { id: 'Community', icon: 'chatbubbles', type: 'Ionicons', route: 'Community' }, // Fixed Route!
  ];

  const handlePress = (tab: any) => {
    setActiveTab(tab.id);
    if (tab.route !== 'Home') {
      navigation.navigate(tab.route);
    }
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 24 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.type === 'Ionicons' ? Ionicons : Feather;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => handlePress(tab)}
              className={`mr-3 flex-row items-center rounded-full border px-5 py-3.5 ${
                isActive
                  ? 'border-emerald-700 bg-emerald-600 shadow-md shadow-green-900/20'
                  : 'border-gray-200 bg-white/70'
              }`}>
              {/* The Icon MUST be rendered here */}
              <IconComponent
                name={tab.icon as any}
                size={18}
                color={isActive ? 'white' : '#1F2937'}
              />
              <Text className={`ml-2 font-bold ${isActive ? 'text-white' : 'text-[#1F2937]'}`}>
                {tab.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
