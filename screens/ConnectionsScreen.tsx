import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ConnectionsScreen({ route, navigation }: any) {
  const { userId, initialTab = 'Followers' } = route.params || {};
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchConnections();
    }, [activeTab])
  );

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const isFollowingTab = activeTab === 'Following';
      const targetColumn = isFollowingTab ? 'follower_id' : 'following_id';
      const selectColumn = isFollowingTab ? 'following_id, profiles!following_id(*)' : 'follower_id, profiles!follower_id(*)';

      const { data, error } = await supabase
        .from('follows')
        .select(selectColumn)
        .eq(targetColumn, userId);

      if (error) throw error;

      const formatted = data?.map((item: any) => {
        const p = isFollowingTab ? item.profiles : item.profiles;
        return {
          id: p.id,
          name: p.full_name || p.first_name || p.username || 'Traveler',
          username: p.username || `user_${p.id.substring(0,6)}`,
          avatar: p.avatar_url || 'https://i.pravatar.cc/150',
          bio: p.bio || 'RouteSync Explorer'
        };
      }) || [];

      setUsers(formatted);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('UserProfile', { userId: item.id, profile: item })}
      className="flex-row items-center px-6 py-4 border-b border-hi-gray-10 active:bg-gray-50"
    >
      <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full bg-hi-gray-10" />
      <View className="ml-4 flex-1">
        <Text className="text-base font-black text-hi-dark tracking-tight">@{item.username}</Text>
        <Text className="text-xs font-bold text-hi-gray-30">{item.name}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#EEEEEE" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-2 border-b border-hi-gray-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center -ml-2">
           <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-row flex-1 justify-center -ml-8">
           {['Followers', 'Following'].map((tab) => (
             <TouchableOpacity 
               key={tab} 
               onPress={() => setActiveTab(tab)}
               className={`px-6 py-3 border-b-2 ${activeTab === tab ? 'border-hi-green' : 'border-transparent'}`}
             >
                <Text className={`text-sm font-black tracking-widest uppercase ${activeTab === tab ? 'text-hi-dark' : 'text-hi-gray-20'}`}>
                  {tab}
                </Text>
             </TouchableOpacity>
           ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#30AF5B" />
        </View>
      ) : (
        <FlatList 
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="mt-40 items-center justify-center px-10">
               <View className="bg-hi-bg w-16 h-16 rounded-full items-center justify-center mb-6">
                 <Feather name="users" size={24} color="#D1D5DB" />
               </View>
               <Text className="text-lg font-bold text-hi-dark mb-1">No {activeTab.toLowerCase()} yet</Text>
               <Text className="text-sm text-hi-gray-30 text-center">Start connecting with the community to see travelers here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
