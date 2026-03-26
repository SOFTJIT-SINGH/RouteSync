import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 
import { DrawerActions } from '@react-navigation/native'; // <-- NEW IMPORT
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

  const displayName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Jaggu';
  const avatarUrl = profile?.avatar_url || 'https://i.pravatar.cc/150';

  return (
    <View className="flex-row justify-between items-center px-3 py-3 bg-white/70 backdrop-blur-2xl border border-white rounded-[32px] shadow-lg shadow-emerald-900/10">
      
      <View className="flex-row items-center gap-3">
        {/* NEW HAMBURGER MENU BUTTON TO OPEN SIDEBAR */}
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          className="w-10 h-10 rounded-full items-center justify-center bg-white/50 border border-white/60 ml-1"
        >
          <Feather name="menu" size={20} color="#1F2937" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Profile')} className="relative">
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" 
          />
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#30AF5B] rounded-full border-2 border-white" />
        </TouchableOpacity>
        
        {/* You can optionally remove the text here if the navbar feels too crowded now, but I left it in */}
        <View className="justify-center hidden sm:flex"> 
          <Text className="text-xl font-black text-gray-900 tracking-tight leading-none ml-1">
            {displayName}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-white/50 border border-white/60">
          <Ionicons name="search" size={20} color="#1F2937" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm shadow-gray-200/50 relative"
        >
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

    </View>
  );
}