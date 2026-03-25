import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [profile, setProfile] = useState<any>(null);
  const navigation = useNavigation<any>(); 

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
  const displayName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Soft';
  const avatarUrl = profile?.avatar_url || 'https://i.pravatar.cc/150';

  return (
    // 💎 PREMIUM GLASSMORPHISM WRAPPER
    // bg-white/70 + backdrop-blur-2xl gives a rich, frosted depth.
    // border-white + shadow-emerald-900/10 creates the 3D "glass edge" lifting off the page.
    <View className="flex-row justify-between items-center px-3 py-3 bg-white/70 backdrop-blur-2xl border border-white rounded-[32px] shadow-lg shadow-emerald-900/10">
      
      {/* Profile & Greeting */}
      <View className="flex-row items-center gap-3">
        
        {/* Avatar with overlapping "Online" dot to match the rest of the app */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Profile')} className="relative">
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-12 h-12 rounded-full border-2 border-white bg-gray-200" 
          />
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#30AF5B] rounded-full border-2 border-white" />
        </TouchableOpacity>
        
        <View className="justify-center">
          <Text className="text-[#30AF5B] text-[10px] font-black uppercase tracking-widest mb-0.5">
            Welcome Back
          </Text>
          <Text className="text-xl font-black text-gray-900 tracking-tight leading-none">
            {displayName}
          </Text>
        </View>
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center gap-2">
        
        {/* Search Icon - Softly embedded into the glass */}
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-white/50 border border-white/60">
          <Ionicons name="search" size={20} color="#1F2937" />
        </TouchableOpacity>

        {/* Notification Bell - High contrast solid white pill to create layered depth */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          className="w-11 h-11 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm shadow-gray-200/50 relative"
        >
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          {/* Active Red Indicator so it catches the user's eye immediately */}
          <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />
        </TouchableOpacity>
        
      </View>

    </View>
  );
}