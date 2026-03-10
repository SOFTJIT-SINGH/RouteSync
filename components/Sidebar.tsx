import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

const Sidebar = (props: any) => {
  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView {...props}>
        {/* 1. Profile Header */}
        <View className="p-6 bg-rs-bg mb-4 rounded-br-[50px]">
          <Image 
            // source={{ uri: 'https://i.pravatar.cc/150?u=softjit' }} 
            source={require('../assets/soft.jpg')} 
            className="w-16 h-16 rounded-2xl border-2 border-rs-green"
          />
          <Text className="text-rs-dark font-bold text-xl mt-3">Softjit Singh</Text>
          <Text className="text-rs-gray text-xs">Verified Traveler • 4.9 ★</Text>
        </View>

        {/* 2. Original Drawer Items (The links) */}
        <View className="flex-1 px-2">
           <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* 3. Bottom Logout Button */}
      <View className="p-5 border-t border-rs-bg mb-5">
        <TouchableOpacity className="flex-row items-center p-3 bg-red-50 rounded-2xl">
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="ml-3 text-red-500 font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Sidebar;