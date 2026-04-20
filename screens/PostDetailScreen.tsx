import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Reusing the Post card logic from SocialScreen but for a single post
export default function PostDetailScreen({ route, navigation }: any) {
  const { postId, initialPost } = route.params || {};
  const [post, setPost] = useState<any>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);

  useFocusEffect(
    useCallback(() => {
      fetchPost();
    }, [postId])
  );

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (data) {
        setPost({
          id: data.id,
          user: {
            id: data.profiles?.id,
            name: data.profiles?.full_name || data.profiles?.username || 'Traveler',
            avatar: data.profiles?.avatar_url || 'https://i.pravatar.cc/150',
          },
          image: data.image_url,
          caption: data.caption,
          location: data.location || 'Unknown',
          likes: data.likes || 0,
          comments: data.comments_count || 0,
          created_at: data.created_at
        });
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !post) {
     return (
       <View className="flex-1 bg-white items-center justify-center">
         <ActivityIndicator size="large" color="#30AF5B" />
       </View>
     );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-hi-gray-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center -ml-2">
           <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-hi-dark tracking-tight ml-2">Travel Memory</Text>
      </View>

      <ScrollView className="flex-1">
         {/* User Header */}
         <View className="flex-row items-center px-6 py-4">
            <Image source={{ uri: post.user.avatar }} className="w-10 h-10 rounded-full" />
            <View className="ml-3">
               <Text className="text-base font-bold text-hi-dark">{post.user.name}</Text>
               <View className="flex-row items-center">
                  <FontAwesome6 name="location-dot" size={10} color="#30AF5B" />
                  <Text className="text-xs text-hi-gray-30 ml-1 font-bold">{post.location}</Text>
               </View>
            </View>
         </View>

         {/* Hero Image */}
         <Image source={{ uri: post.image }} className="w-full aspect-square bg-hi-gray-10" />

         {/* Interaction Bar */}
         <View className="flex-row items-center justify-between px-6 py-4">
            <View className="flex-row items-center" style={{ gap: 20 }}>
               <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="heart-outline" size={28} color="#1F2937" />
                  <Text className="text-sm font-black text-hi-dark ml-1.5">{post.likes}</Text>
               </TouchableOpacity>
               <TouchableOpacity className="flex-row items-center">
                  <Ionicons name="chatbubble-outline" size={26} color="#1F2937" />
                  <Text className="text-sm font-black text-hi-dark ml-1.5">{post.comments}</Text>
               </TouchableOpacity>
               <Feather name="send" size={24} color="#1F2937" />
            </View>
            <Feather name="bookmark" size={26} color="#1F2937" />
         </View>

         {/* Caption Area */}
         <View className="px-6 pb-20">
            <Text className="text-[15px] font-medium leading-6 text-hi-dark">
               <Text className="font-black">@{post.user.name.toLowerCase().replace(/\s/g, '')} </Text>
               {post.caption}
            </Text>
            <Text className="text-[10px] font-black text-hi-gray-20 uppercase mt-4 tracking-widest">
               Captured on {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
}
