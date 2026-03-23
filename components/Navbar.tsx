import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle();
        setProfile(data);
      }
    };
    fetchUser();
  }, []);

  return (
    <View className="flex-row justify-between items-center py-4 bg-transparent mt-2">
      <TouchableOpacity 
        onPress={() => navigation.navigate('Profile')}
        className="flex-row items-center bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100"
      >
        <Image 
          source={{ uri: profile?.avatar_url || 'https://i.pravatar.cc/150' }} 
          className="w-10 h-10 rounded-full border-2 border-[#30AF5B]" 
        />
        <View className="ml-2 pr-2">
          <Text className="text-xs text-gray-500 font-medium">Good Morning,</Text>
          <Text className="text-sm font-bold text-gray-900">
            {profile?.full_name?.split(' ')[0] || 'Traveler'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity className="bg-white p-3 rounded-full shadow-sm border border-gray-100 relative">
        <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;