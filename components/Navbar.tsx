import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(data);
      }
    };
    fetchUser();
  }, []);

  // Safe fallbacks while loading
  const displayName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Jaggu';
  const avatarUrl = profile?.avatar_url || 'https://i.pravatar.cc/150';

  return (
    <View className="flex-row justify-between items-center bg-[#FAFAFA]">
      
      {/* Profile & Greeting */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity activeOpacity={0.8}>
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-12 h-12 rounded-full border border-gray-200 bg-gray-100" 
          />
        </TouchableOpacity>
        
        <View>
          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
            Welcome Back
          </Text>
          <Text className="text-xl font-black text-gray-900 tracking-tight">
            {displayName}
          </Text>
        </View>
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center gap-2">
        {/* Search Icon */}
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
          <Ionicons name="search" size={22} color="#4B5563" />
        </TouchableOpacity>

        {/* Notification Bell with Active Indicator */}
        <TouchableOpacity className="bg-white w-12 h-12 rounded-full items-center justify-center border border-gray-100 shadow-sm shadow-gray-200 relative">
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#30AF5B] rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

    </View>
  );
}