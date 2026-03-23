import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function HeroButtons() {
  // Set 'Discover' as the default active tab
  const [activeTab, setActiveTab] = useState('Discover');

  // Array of tabs to map over cleanly
  const tabs = [
    { id: 'Discover', icon: 'compass', type: 'Ionicons' },
    { id: 'Buddies', icon: 'people', type: 'Ionicons' },
    { id: 'My Trips', icon: 'map', type: 'Feather' },
    { id: 'Community', icon: 'chatbubbles', type: 'Ionicons' },
  ];

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.type === 'Ionicons' ? Ionicons : Feather;
          
          return (
            <TouchableOpacity 
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.id)} // This makes it interactive!
              className={`flex-row items-center px-5 py-3.5 rounded-[16px] mr-3 border transition-colors ${
                isActive 
                  ? 'bg-gray-900 border-gray-900 shadow-md shadow-gray-900/20' 
                  : 'bg-white border-gray-100 shadow-sm shadow-gray-100'
              }`}
            >
              <IconComponent 
                name={tab.icon as any} 
                size={18} 
                color={isActive ? 'white' : '#1F2937'} 
              />
              <Text className={`font-bold ml-2 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {tab.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}