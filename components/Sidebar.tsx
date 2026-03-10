// components/Sidebar.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase'; // 1. Import your supabase client

const Sidebar = (props: any) => {
  
  // 2. Create the Sign Out function
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // 3. Reset the navigation to the Auth screen
      props.navigation.replace('Main', { screen: 'Auth' });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView {...props}>
        {/* Profile Header */}
        <View className="p-6 bg-rs-bg mb-4 rounded-br-[50px]">
          <Image 
            source={require('../assets/soft.jpg')} 
            className="w-16 h-16 rounded-2xl border-2 border-rs-green"
          />
          <Text className="text-rs-dark font-bold text-xl mt-3">Softjit Singh</Text>
          <Text className="text-rs-gray text-xs">Verified Traveler • 4.9 ★</Text>
        </View>

        <View className="flex-1 px-2">
           <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* 4. Attach the function to the Logout Button */}
      <View className="p-5 border-t border-rs-bg mb-5">
        <TouchableOpacity 
          onPress={handleSignOut}
          className="flex-row items-center p-3 bg-red-50 rounded-2xl"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="ml-3 text-red-500 font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Sidebar;