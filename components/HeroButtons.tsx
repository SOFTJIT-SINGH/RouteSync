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
    { id: 'Community', icon: 'chatbubbles', type: 'Ionicons', route: 'SocialScreen' }, 
  ];

  const handlePress = (tab: any) => {
    setActiveTab(tab.id);
    if (tab.route !== 'Home') {
      navigation.navigate(tab.route);
    }
  };

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
              onPress={() => handlePress(tab)}
              // BUG FIX: Removed NativeWind 'shadow-*' classes from className. 
              // NativeWind crashes and throws a fake Navigation error if shadows change on click!
              className={`flex-row items-center px-5 py-3.5 rounded-[16px] mr-3 border transition-colors ${
                isActive 
                  ? 'bg-[#30AF5B] border-[#30AF5B]' 
                  : 'bg-white border-gray-100'
              }`}
              // We use standard React Native shadows instead to bypass the bug safely
              style={isActive 
                ? { shadowColor: '#064e3b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }
                : { shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }
              }
            >
              <IconComponent name={tab.icon as any} size={18} color={isActive ? 'white' : '#1F2937'} />
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