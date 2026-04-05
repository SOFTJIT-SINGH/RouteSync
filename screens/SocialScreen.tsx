import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StatusBar, 
  Share, Modal, TextInput, KeyboardAvoidingView, Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

// Robust Mock Data in case the 'posts' table doesn't exist yet
const INITIAL_FEED = [
  {
    id: '1',
    user: { name: 'Aisha Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
    location: 'Spiti Valley, Himachal',
    image: 'https://images.unsplash.com/photo-1605649487212-4dcb3b654abf?q=80&w=1000&auto=format&fit=crop',
    caption: 'Finally made it to the middle of nowhere. The roads were rough, but the view from Key Monastery is worth every bump. 🏔️✨',
    likes: 342,
    comments: 28,
    time: '2 hours ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    user: { name: 'Rohan Gupta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
    location: 'Varkala Cliff, Kerala',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666c89?q=80&w=1000&auto=format&fit=crop',
    caption: 'Chasing sunsets and surfing waves. If anyone is around south cliff tonight, let\'s grab seafood! 🌊🏄‍♂️',
    likes: 128,
    comments: 15,
    time: '5 hours ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '3',
    user: { name: 'Maya Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop',
    caption: 'Lost in the colors of the Pink City. The architecture here tells a million stories. 🕌💖',
    likes: 890,
    comments: 42,
    time: '8 hours ago',
    isLiked: true,
    isSaved: true,
  }
];

export default function SocialScreen() {
  const [posts, setPosts] = useState<any[]>(INITIAL_FEED);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Comments Modal State
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<any[]>([]);

  useEffect(() => {
    let channel: any;

    const initCommunity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Attempt to fetch real posts from DB
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles(full_name, first_name, username, avatar_url)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map(dbPost => ({
            id: dbPost.id,
            user: {
              name: dbPost.profiles?.full_name || dbPost.profiles?.username || 'Traveler',
              avatar: dbPost.profiles?.avatar_url || 'https://i.pravatar.cc/150'
            },
            location: dbPost.location || 'Unknown',
            image: dbPost.image_url,
            caption: dbPost.caption,
            likes: dbPost.likes || 0,
            comments: dbPost.comments_count || 0,
            time: 'Just now', // Ideally compute from created_at
            isLiked: false,
            isSaved: false
          }));
          setPosts(formatted);
        }
      } catch (e) {
        console.log('Using robust mock feed since posts table might be missing.');
      }

      // Real-time listener for Likes & Comments count
      channel = supabase.channel('public:posts')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
           setPosts(current => current.map(p => 
             p.id === payload.new.id ? { ...p, likes: payload.new.likes, comments: payload.new.comments_count } : p
           ));
        })
        .subscribe();
    };

    initCommunity();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // --- INTERACTION LOGIC ---

  const handleLike = async (postId: string) => {
    let newLikes = 0;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        newLikes = p.isLiked ? p.likes - 1 : p.likes + 1;
        return { ...p, isLiked: !p.isLiked, likes: newLikes };
      }
      return p;
    }));

    // If using DB, update it
    try {
      await supabase.rpc('increment_likes', { post_id: postId, amount: newLikes });
    } catch {}
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p));
  };

  const handleShare = async (post: any) => {
    try {
      await Share.share({
        message: `Check out ${post.user.name}'s amazing trip to ${post.location} on RouteSync!\n\n"${post.caption}"`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const openComments = (post: any) => {
    setActivePostId(post.id);
    // Load mock comments or fetch from DB
    setPostComments([
      { id: 'c1', name: 'Kabir', text: 'Stunning place! Did you use a drone?', time: '1h' },
      { id: 'c2', name: 'Sneha', text: 'Adding this to my bucket list 🔥', time: '20m' },
    ]);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      name: 'You',
      text: commentText,
      time: 'Just now'
    };
    setPostComments(prev => [...prev, newComment]);
    
    // Increment comment count locally
    setPosts(posts.map(p => p.id === activePostId ? { ...p, comments: p.comments + 1 } : p));
    setCommentText('');
  };

  // --- RENDERING ---

  const renderPost = ({ item }: { item: any }) => (
    <View className="mb-10 px-5">
      {/* 1. Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image source={{ uri: item.user.avatar }} className="h-11 w-11 rounded-full bg-gray-200 border border-gray-100" />
          <View className="ml-3">
            <Text className="text-[15px] font-bold text-gray-900">{item.user.name}</Text>
            <View className="mt-0.5 flex-row items-center">
              <FontAwesome6 name="location-dot" size={10} color="#30AF5B" />
              <Text className="ml-1 text-xs font-semibold text-gray-500">{item.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity className="h-8 w-8 items-center justify-center">
          <Feather name="more-horizontal" size={20} color="#A2A2A2" />
        </TouchableOpacity>
      </View>

      {/* 2. Image (Using safe inline styles for shadows) */}
      <View 
        className="relative h-[380px] w-full overflow-hidden rounded-[30px] bg-gray-100 border border-gray-100"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
      >
        <Image source={{ uri: item.image }} className="h-full w-full" resizeMode="cover" />

        {/* Floating Tag */}
        {item.id === '1' && (
          <View className="absolute right-4 top-4 flex-row items-center rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10">
            <View className="mr-2 h-2 w-2 rounded-full bg-[#30AF5B] shadow-sm shadow-green-400" />
            <Text className="text-[11px] font-bold tracking-widest uppercase text-white">Looking for buddies</Text>
          </View>
        )}
      </View>

      {/* 3. Actions */}
      <View className="mt-4 flex-row items-center justify-between px-1">
        <View className="flex-row items-center space-x-5">
          <TouchableOpacity onPress={() => handleLike(item.id)} className="flex-row items-center active:scale-95 transition-transform">
            {item.isLiked ? (
              <Ionicons name="heart" size={28} color="#EF4444" />
            ) : (
              <Ionicons name="heart-outline" size={28} color="#1F2937" />
            )}
            <Text className={`ml-1.5 text-sm font-bold ${item.isLiked ? 'text-red-500' : 'text-gray-900'}`}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openComments(item)} className="flex-row items-center ml-5 active:scale-95">
            <Ionicons name="chatbubble-outline" size={26} color="#1F2937" />
            <Text className="ml-1.5 text-sm font-bold text-gray-900">{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleShare(item)} className="flex-row items-center ml-5 active:scale-95">
            <Feather name="send" size={24} color="#1F2937" style={{ marginTop: -2 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleBookmark(item.id)} className="active:scale-95">
          {item.isSaved ? (
             <Ionicons name="bookmark" size={26} color="#1F2937" />
          ) : (
             <Feather name="bookmark" size={26} color="#1F2937" />
          )}
        </TouchableOpacity>
      </View>

      {/* 4. Caption */}
      <View className="mt-3 px-1">
        <Text className="text-sm font-medium leading-[22px] text-gray-700">
          <Text className="mr-2 font-bold text-gray-900">{item.user.name} </Text>
          {item.caption}
        </Text>
        <Text className="mt-2 text-[11px] font-bold tracking-wide text-gray-400 uppercase">{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="z-50 px-5 pb-2 pt-2 bg-[#F9FAFB]">
        <Navbar />
      </View>

      <View className="flex-row items-center justify-between px-6 pb-2">
        <Text className="text-2xl font-black tracking-tight text-gray-900 mt-2">Community</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      />

      {/* COMMENTS MODAL */}
      <Modal visible={!!activePostId} animationType="slide" transparent={true}>
         <View className="flex-1 justify-end">
           <TouchableOpacity 
             className="absolute inset-0 bg-black/40" 
             activeOpacity={1} 
             onPress={() => setActivePostId(null)} 
           />
           
           <KeyboardAvoidingView 
             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
             className="bg-white rounded-t-3xl h-[65%] shadow-lg overflow-hidden"
             style={{ elevation: 20 }}
           >
             <View className="items-center py-3">
               <View className="h-1.5 w-12 bg-gray-300 rounded-full" />
               <Text className="mt-3 text-base font-black text-gray-900">Comments</Text>
             </View>
             
             <FlatList
               data={postComments}
               keyExtractor={item => item.id}
               className="flex-1 px-5 pt-2"
               renderItem={({item}) => (
                 <View className="flex-row mb-4">
                   <View className="w-8 h-8 rounded-full bg-gray-200 mt-1" />
                   <View className="ml-3 flex-1">
                     <View className="flex-row items-center">
                       <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                       <Text className="text-xs font-semibold text-gray-400 ml-2">{item.time}</Text>
                     </View>
                     <Text className="text-[13px] font-medium text-gray-700 mt-0.5 leading-tight">{item.text}</Text>
                   </View>
                   <TouchableOpacity className="ml-2 mt-1">
                     <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
                   </TouchableOpacity>
                 </View>
               )}
             />

             {/* Comment Input */}
             <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-end pb-8">
               <View className="w-8 h-8 rounded-full bg-gray-200 mb-1 mr-3" />
               <TextInput 
                 value={commentText}
                 onChangeText={setCommentText}
                 placeholder="Add a comment..."
                 placeholderTextColor="#9CA3AF"
                 multiline
                 className="flex-1 bg-gray-100 px-4 py-2.5 rounded-2xl text-[14px] font-medium max-h-[100px] border border-gray-200"
               />
               <TouchableOpacity 
                 disabled={!commentText.trim()}
                 onPress={submitComment}
                 className="ml-3 mb-1"
               >
                 <Text className={`font-bold text-base ${commentText.trim() ? 'text-[#30AF5B]' : 'text-gray-300'}`}>Post</Text>
               </TouchableOpacity>
             </View>
           </KeyboardAvoidingView>
         </View>
      </Modal>
    </SafeAreaView>
  );
}
