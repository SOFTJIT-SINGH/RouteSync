import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import Navbar from '../components/Navbar';

// High-Quality Mock Data for the Feed
const FEED_POSTS = [
  {
    id: '1',
    user: {
      name: 'Aisha Sharma',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    },
    location: 'Spiti Valley, Himachal',
    image:
      'https://images.unsplash.com/photo-1605649487212-4dcb3b654abf?q=80&w=1000&auto=format&fit=crop',
    caption:
      'Finally made it to the middle of nowhere. The roads were rough, but the view from Key Monastery is worth every bump. 🏔️✨',
    likes: 342,
    comments: 28,
    time: '2 hours ago',
    isLiked: true,
  },
  {
    id: '2',
    user: {
      name: 'Rohan Gupta',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    },
    location: 'Varkala Cliff, Kerala',
    image:
      'https://images.unsplash.com/photo-1593693397690-362cb9666c89?q=80&w=1000&auto=format&fit=crop',
    caption:
      'Chasing sunsets and surfing waves. If anyone is around south cliff tonight, let’s grab seafood! 🌊🏄‍♂️',
    likes: 128,
    comments: 15,
    time: '5 hours ago',
    isLiked: false,
  },
];

export default function SocialScreen() {
  const [posts, setPosts] = useState(FEED_POSTS);

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const renderPost = ({ item }: { item: any }) => (
    <View className="mb-8 px-5">
      {/* 1. Post Header (User & Location) */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={{ uri: item.user.avatar }}
            className="h-10 w-10 rounded-full bg-gray-200"
          />
          <View className="ml-3">
            <Text className="text-base font-bold leading-tight text-gray-900">
              {item.user.name}
            </Text>
            <View className="mt-0.5 flex-row items-center">
              <FontAwesome6 name="location-dot" size={10} color="#30AF5B" />
              <Text className="ml-1 text-xs font-semibold text-gray-500">{item.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity className="h-8 w-8 items-center justify-center">
          <Feather name="more-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* 2. The Image with Glassmorphism Overlay */}
      <View className="relative h-[350px] w-full overflow-hidden rounded-[32px] bg-gray-100 shadow-sm shadow-gray-200">
        <Image source={{ uri: item.image }} className="h-full w-full" resizeMode="cover" />

        {/* Floating "Travel Buddy Needed" Tag (Example of premium UI detail) */}
        {item.id === '1' && (
          <View className="absolute right-4 top-4 flex-row items-center rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
            <View className="mr-2 h-2 w-2 rounded-full bg-[#30AF5B]" />
            <Text className="text-xs font-bold tracking-wide text-white">Looking for buddies</Text>
          </View>
        )}
      </View>

      {/* 3. Interaction Bar */}
      <View className="mt-4 flex-row items-center justify-between px-1">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => toggleLike(item.id)} className="flex-row items-center">
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={26}
              color={item.isLiked ? '#EF4444' : '#1F2937'}
            />
            <Text
              className={`ml-1.5 font-bold ${item.isLiked ? 'text-[#EF4444]' : 'text-gray-700'}`}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="ml-4 flex-row items-center">
            <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
            <Text className="ml-1.5 font-bold text-gray-700">{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="ml-4 flex-row items-center">
            <Feather name="send" size={22} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Feather name="bookmark" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* 4. Caption */}
      <View className="mt-3 px-1">
        <Text className="text-sm font-medium leading-relaxed text-gray-800">
          <Text className="mr-2 font-bold text-gray-900">{item.user.name} </Text>
          {item.caption}
        </Text>
        <Text className="mt-1.5 text-xs font-semibold text-gray-400">{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View className="z-50 px-5 pb-2 pt-2">
        <Navbar />
      </View>

      {/* Header */}
      
      <View className="flex-row items-center justify-between px-6 pb-4">
        <Text className="text-2xl font-black tracking-tight text-gray-900 px-5 mt-3">Community Feed</Text>
      </View>

      {/* <View className="px-5 py-3 flex-row justify-between items-center bg-[#FAFAFA] z-10">
        <Text className="text-2xl font-black text-gray-900 tracking-tight">Community</Text>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm shadow-gray-100">
          <Feather name="plus" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View> */}

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}
