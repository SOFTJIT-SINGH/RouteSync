import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';

export default function Navbar() {
  const [profile, setProfile] = useState<any>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    let channel: any;

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Initial fetch
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(data);

        // Real-time listener for this specific user's profile
        channel = supabase.channel(`public:profiles:id=eq.${user.id}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, (payload) => {
            setProfile(payload.new);
          })
          .subscribe();
      }
    };
    
    fetchUser();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const displayName = profile?.first_name?.trim() || profile?.full_name?.trim() || 'Explorer';

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white rounded-full shadow-md shadow-gray-200/50 border border-hi-gray-10 mt-2">
      
      <View className="flex-row items-center gap-3">
        {/* Hamburger Menu */}
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          className="w-10 h-10 rounded-full items-center justify-center bg-hi-bg border border-hi-gray-10"
        >
          <Feather name="menu" size={20} color="#292C27" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Profile')} className="relative">
          <Avatar uri={profile?.avatar_url} name={displayName} size={40} />
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-hi-green rounded-full border-2 border-white" />
        </TouchableOpacity>
        
        <View className="justify-center"> 
          <View className="flex-row items-center ml-1">
            <Text className="text-lg font-black text-hi-dark tracking-tight leading-none">
              {displayName}
            </Text>
            {(profile?.is_verified || profile?.email?.includes('hacknapp.com') || profile?.email?.includes('sskaid.com')) && (
              <View className="ml-1 bg-hi-green rounded-full p-0.5">
                <Ionicons name="checkmark" size={8} color="white" />
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
          onPress={() => navigation.navigate('UserSearch')}
          className="w-10 h-10 rounded-full items-center justify-center bg-hi-bg border border-hi-gray-10"
        >
          <Ionicons name="search" size={20} color="#292C27" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          className="w-10 h-10 bg-hi-bg rounded-full items-center justify-center border border-hi-gray-10 relative"
        >
          <Ionicons name="notifications-outline" size={20} color="#292C27" />
          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-hi-orange rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

    </View>
  );
}