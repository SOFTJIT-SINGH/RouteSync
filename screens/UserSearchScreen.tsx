import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

export default function UserSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    const timer = setTimeout(() => {
      searchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // 1. Search Users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,first_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(15);

      if (userError) throw userError;

      // 2. Search Posts (Making it "Global")
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*, profiles(full_name, username, avatar_url)')
        .ilike('caption', `%${query}%`)
        .limit(10);

      const combinedResults = [
        ...(userData || []).map(u => ({ ...u, type: 'user' })),
        ...(postData || []).map(p => ({ ...p, type: 'post' }))
      ];

      setUsers(combinedResults);
    } catch (e: any) {
      console.error('Search error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'user') {
      const avatar = item.avatar_url;
      const displayName = item.full_name || item.first_name || item.username || 'Traveler';

      return (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('UserProfile', { userId: item.id, profile: item });
          }}
          className="flex-row items-center p-4 border-b border-gray-50 bg-white"
        >
          <Avatar uri={avatar} name={displayName} size={48} />
          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-gray-900">{displayName}</Text>
            <Text className="text-sm font-medium text-gray-500">@{item.username || 'user'}</Text>
          </View>
          <View className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">User</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Post Result
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Community');
        }}
        className="flex-row items-center p-4 border-b border-gray-50 bg-white"
      >
        <View className="w-12 h-12 rounded-xl bg-hi-green/10 items-center justify-center">
          <Feather name="image" size={20} color="#30AF5B" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{item.caption || 'Trip Post'}</Text>
          <Text className="text-sm font-medium text-gray-500">Post by @{item.profiles?.username || 'user'}</Text>
        </View>
        <View className="bg-hi-green/5 px-3 py-1 rounded-full border border-hi-green/10">
          <Text className="text-[10px] font-black text-hi-green uppercase tracking-tighter">Post</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1 ml-3 flex-row items-center bg-gray-100 px-4 py-2.5 rounded-2xl border border-gray-100">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search RouteSync..."
            placeholderTextColor="#9CA3AF"
            autoFocus
            className="flex-1 ml-2 text-base font-medium text-gray-900"
          />
          {query.length > 0 && (
             <TouchableOpacity onPress={() => setQuery('')}>
               <Feather name="x-circle" size={18} color="#9CA3AF" />
             </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View className="pt-20 items-center">
          <ActivityIndicator size="small" color="#30AF5B" />
          <Text className="mt-4 text-gray-400 font-bold">Scanning the road...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.id || `res-${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={users.length > 0 ? (
            <View className="px-5 py-3 bg-gray-50/50">
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Results</Text>
            </View>
          ) : null}
          ListEmptyComponent={
            query.length > 0 ? (
              <View className="items-center justify-center pt-20 px-10">
                <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
                  <Feather name="search" size={32} color="#D1D5DB" />
                </View>
                <Text className="text-gray-900 font-black text-xl text-center">No matches found</Text>
                <Text className="text-gray-500 font-medium text-center mt-2 leading-5">We couldn't find any users or posts matching "{query}".</Text>
              </View>
            ) : (
              <View className="items-center justify-center pt-20 px-10">
                <View className="w-20 h-20 bg-hi-green/10 rounded-full items-center justify-center mb-6">
                  <Feather name="globe" size={32} color="#30AF5B" />
                </View>
                <Text className="text-gray-900 font-black text-xl text-center">Global Search</Text>
                <Text className="text-gray-500 font-medium text-center mt-2 leading-5">Search across RouteSync for fellow travelers, destinations, and shared trips.</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
