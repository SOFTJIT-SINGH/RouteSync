import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HeroButtons = () => {
  const navigation = useNavigation<any>();

  const hero = [
    {
      name: 'Find Buddy',
      icon: <FontAwesome6 name="user-group" size={20} color="#30AF5B" />,
      route: 'FindBuddy', 
    },
    {
      name: 'Sync Route',
      icon: <MaterialCommunityIcons name="map-marker-path" size={24} color="#30AF5B" />,
      route: 'SyncRoute', 
    },
    {
      name: 'Shared Gear',
      icon: <MaterialIcons name="handshake" size={24} color="#30AF5B" />,
      route: 'Marketplace', // Not built yet!
    },
    {
      name: 'Messages',
      icon: <MaterialIcons name="chat-bubble-outline" size={24} color="#30AF5B" />,
      route: 'Chat',
    },
  ];

  const handlePress = (route?: string) => {
    if (route === 'Marketplace') {
      Alert.alert("Coming Soon", "The Shared Gear marketplace is currently in development!");
      return;
    }
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <View className='flex-row justify-between mt-4'>
      {hero.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          activeOpacity={0.8}
          onPress={() => handlePress(item.route)}
          className='bg-white p-4 w-[23%] rounded-3xl items-center justify-center shadow-sm'
          style={{ shadowColor: '#30AF5B', shadowOpacity: 0.05, shadowRadius: 10 }}
        >
          <View className="bg-[#F0F9F0] p-3 rounded-full mb-2">
            {item.icon}
          </View>
          <Text className='font-bold text-[10px] text-[#292C27] text-center'>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HeroButtons;