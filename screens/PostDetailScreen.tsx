import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

// Reusing the Post card logic from SocialScreen but for a single post
export default function PostDetailScreen({ route, navigation }: any) {
  const { postId, initialPost } = route.params || {};
  const [post, setPost] = useState<any>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

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
        // Check if liked/saved
        const [{ data: like }, { data: save }] = await Promise.all([
          supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
          supabase.from('post_bookmarks').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle()
        ]);

        setPost({
          id: data.id,
          user: {
            id: data.profiles?.id,
            name: data.profiles?.first_name || data.profiles?.full_name || data.profiles?.username || 'Traveler',
            avatar: data.profiles?.avatar_url || null,
          },
          image: data.image_url,
          caption: data.caption,
          location: data.location || 'Unknown',
          likes: data.likes || 0,
          comments: data.comments_count || 0,
          isLiked: !!like,
          isSaved: !!save,
          created_at: data.created_at
        });
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userId || !post) return;
    const wasLiked = post.isLiked;
    const newLikes = wasLiked ? post.likes - 1 : post.likes + 1;

    setPost((prev: any) => ({ ...prev, isLiked: !wasLiked, likes: newLikes }));

    try {
      if (wasLiked) {
        await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', userId);
      } else {
        await supabase.from('likes').insert({ post_id: post.id, user_id: userId });
      }
      await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);
    } catch (e: any) {
      console.error('Detail Like error:', e.message);
      setPost((prev: any) => ({ ...prev, isLiked: wasLiked, likes: post.likes }));
    }
  };

  const handleBookmark = async () => {
    if (!userId || !post) return;
    const wasSaved = post.isSaved;
    setPost((prev: any) => ({ ...prev, isSaved: !wasSaved }));

    try {
      if (wasSaved) {
        await supabase.from('post_bookmarks').delete().eq('post_id', post.id).eq('user_id', userId);
      } else {
        await supabase.from('post_bookmarks').insert({ post_id: post.id, user_id: userId });
      }
    } catch (e: any) {
      console.error('Detail Bookmark error:', e.message);
      setPost((prev: any) => ({ ...prev, isSaved: wasSaved }));
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
            <Avatar uri={post.user.avatar} name={post.user.name} size={40} />
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
                <TouchableOpacity onPress={handleLike} className="flex-row items-center">
                   <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={28} color={post.isLiked ? "#EF4444" : "#1F2937"} />
                   <Text className="text-sm font-black text-hi-dark ml-1.5">{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center" onPress={() => navigation.navigate('Community', { openCommentsFor: post.id })}>
                   <Ionicons name="chatbubble-outline" size={26} color="#1F2937" />
                   <Text className="text-sm font-black text-hi-dark ml-1.5">{post.comments}</Text>
                </TouchableOpacity>
                <Feather name="send" size={24} color="#1F2937" />
             </View>
             <TouchableOpacity onPress={handleBookmark}>
                <Ionicons name={post.isSaved ? "bookmark" : "bookmark-outline"} size={26} color={post.isSaved ? "#30AF5B" : "#1F2937"} />
             </TouchableOpacity>
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
