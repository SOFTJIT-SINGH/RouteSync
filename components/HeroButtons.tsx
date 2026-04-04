import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function HeroButtons({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState('Discover');

  const tabs = [
    { id: 'Discover', icon: 'compass', type: 'Ionicons', tab: 'Home' },
    { id: 'Buddies', icon: 'people', type: 'Ionicons', tab: 'Matches' },
    { id: 'My Trips', icon: 'map', type: 'Feather', tab: 'Profile' },
    { id: 'Community', icon: 'chatbubbles', type: 'Ionicons', tab: 'Community' },
  ];

  const handlePress = (tab: any) => {
    setActiveTab(tab.id);
    // navigation is HomeScreen's Tab navigator — can navigate directly to sibling tabs
    navigation.navigate(tab.tab);
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, paddingVertical: 4 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.type === 'Ionicons' ? Ionicons : Feather;
          
          return (
            <TouchableOpacity 
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => handlePress(tab)}
              className="mr-3"
            >
              <View
                className={`flex-row items-center px-5 py-3 rounded-full border ${
                  isActive 
                    ? 'border-hi-dark bg-hi-dark shadow-md shadow-gray-400/30' 
                    : 'border-hi-gray-10 bg-white'
                }`}
              >
                <IconComponent 
                  name={tab.icon as any} 
                  size={18} 
                  color={isActive ? '#FFFFFF' : '#7B7B7B'} 
                />
                <Text className={`font-bold ml-2 text-sm ${isActive ? 'text-white' : 'text-hi-gray-30'}`}>
                  {tab.id}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}