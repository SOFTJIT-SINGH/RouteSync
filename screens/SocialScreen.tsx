import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + 'y';
  interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + 'mo';
  interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + 'd';
  interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + 'h';
  interval = seconds / 60; if (interval > 1) return Math.floor(interval) + 'm';
  return 'Just now';
};

export default function SocialScreen({ navigation }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, image_url, created_at, profiles(id, full_name, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchPosts(); }, []);

  const renderPost = ({ item }: { item: any }) => (
    <View className="bg-white mb-6 border-b border-gray-100 pb-6 px-5">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image source={{ uri: item.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} className="w-11 h-11 rounded-full bg-gray-200" />
          <View className="ml-3">
            <Text className="text-base font-bold text-gray-900">{item.profiles?.full_name || 'Traveler'}</Text>
            <Text className="text-xs text-gray-400 font-medium">{timeAgo(item.created_at)}</Text>
          </View>
        </View>
      </View>
      <Text className="text-gray-800 text-base leading-relaxed mb-3 font-medium">{item.content}</Text>
      {item.image_url && <Image source={{ uri: item.image_url }} className="w-full h-64 rounded-3xl bg-gray-100 mb-4" />}
      <View className="flex-row items-center space-x-6 mt-1">
        <TouchableOpacity onPress={() => setLikedPosts(p => ({ ...p, [item.id]: !p[item.id] }))} className="flex-row items-center">
          <Ionicons name={likedPosts[item.id] ? "heart" : "heart-outline"} size={26} color={likedPosts[item.id] ? "#EF4444" : "#4B5563"} />
          <Text className={`ml-1.5 font-bold ${likedPosts[item.id] ? 'text-red-500' : 'text-gray-600'}`}>{likedPosts[item.id] ? '1' : '0'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-gray-900 tracking-tight">Community Feed</Text>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#30AF5B" /></View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />}
          contentContainerStyle={{ paddingTop: 16 }}
        />
      )}
    </SafeAreaView>
  );
}