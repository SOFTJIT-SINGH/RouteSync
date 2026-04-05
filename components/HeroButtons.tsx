import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { navigate } from '../navigation/navigationRef'; // The most robust, context-independent navigation

export default function HeroButtons() {
  const [activeTab, setActiveTab] = useState('Discover');

  // Defined types explicitly with routes
  const tabs = [
    { id: 'Discover', icon: 'compass', type: 'Ionicons', route: 'Home' },
    { id: 'Buddies', icon: 'people', type: 'Ionicons', route: 'Matches' },
    { id: 'My Trips', icon: 'map', type: 'Feather', route: 'Profile' },
    { id: 'Community', icon: 'chatbubbles', type: 'Ionicons', route: 'Community' },
  ] as const;

  const handlePress = (tab: typeof tabs[number]) => {
    try {
      setActiveTab(tab.id);
      
      // We use the global ref to navigate, bypassing ANY context problems.
      if (tab.route !== 'Home') {
        navigate(tab.route);
      }
    } catch (e) {
      console.warn("Caught fatal navigation error:", e);
    }
  };

  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingRight: 24, paddingVertical: 4 }}
      >
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
              {/* NativeWind crashes and throws a fake Navigation error if shadows change on click! */}
              {/* We avoid dynamic shadow-* classes and use pure inline styles for shadows instead. */}
              <View
                className={`flex-row items-center px-5 py-3 rounded-full border ${
                  isActive 
                    ? 'border-hi-dark bg-hi-dark' 
                    : 'border-hi-gray-10 bg-white'
                }`}
                style={isActive ? {
                  shadowColor: '#9ca3af',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 5
                } : undefined}
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