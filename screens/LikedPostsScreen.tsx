import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function LikedPostsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLikedPosts();
    }, [])
  );

  const fetchLikedPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('likes')
        .select('post_id, posts(*, profiles(*))')
        .eq('user_id', user.id);

      if (error) throw error;
      setPosts(data?.map((item: any) => item.posts).filter(Boolean) || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-hi-gray-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-hi-bg rounded-full mr-4">
           <Ionicons name="chevron-back" size={24} color="#292C27" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-hi-dark tracking-tight">Liked Moments</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#30AF5B" className="mt-20" />
        ) : posts.length === 0 ? (
          <View className="mt-40 items-center justify-center">
             <View className="bg-white w-20 h-20 rounded-full items-center justify-center shadow-lg shadow-gray-200 mb-6">
                <Ionicons name="heart" size={32} color="#EF4444" />
             </View>
             <Text className="text-lg font-bold text-hi-dark mb-2">No likes yet</Text>
             <Text className="text-sm text-hi-gray-30 text-center px-10">Like travel stories you enjoy to see them here.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {posts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                onPress={() => navigation.navigate('PostDetail', { postId: post.id, initialPost: post })}
                className="w-1/3 aspect-square p-1 rounded-2xl overflow-hidden"
              >
                <Image source={{ uri: post.image_url }} className="w-full h-full bg-hi-gray-10 rounded-2xl" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
