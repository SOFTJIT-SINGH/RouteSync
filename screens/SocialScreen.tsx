import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StatusBar,
  Share, Modal, TextInput, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';

// No more mock data — production app shows real content only

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function SocialScreen() {
  const navigation = useNavigation<any>();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [buddies, setBuddies] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchBuddies();
  }, []);

  const fetchBuddies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10);
      setBuddies(data || []);
    } catch (e) {}
  };

  const sendPostToBuddy = async (buddyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedPost) return;

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: buddyId,
        content: `shared_post:${selectedPost.id}`,
        room_id: user.id < buddyId ? `${user.id}_${buddyId}` : `${buddyId}_${user.id}`,
      });

      if (error) throw error;
      setShareModalVisible(false);
      Alert.alert('Sent!', 'Your travel story has been shared.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Comments Modal State
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Create Post Modal State
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(id, full_name, first_name, username, avatar_url, verification_status)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Check which posts the user liked and saved
        let likedPostIds: Set<string> = new Set();
        let savedPostIds: Set<string> = new Set();
        if (user) {
          const [{ data: likes }, { data: saves }] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id),
            supabase.from('post_bookmarks').select('post_id').eq('user_id', user.id)
          ]);
          
          if (likes) likedPostIds = new Set(likes.map((l: any) => l.post_id));
          if (saves) savedPostIds = new Set(saves.map((s: any) => s.post_id));
        }

        const formatted = data.map(dbPost => ({
          id: dbPost.id,
          user: {
            id: dbPost.profiles?.id || dbPost.user_id,
            name: dbPost.profiles?.full_name?.trim() || dbPost.profiles?.first_name?.trim() || 'User',
            avatar: dbPost.profiles?.avatar_url || null,
            isVerified: dbPost.profiles?.verification_status || false,
          },
          location: dbPost.location || 'Unknown',
          image: dbPost.image_url,
          caption: dbPost.caption,
          likes: dbPost.likes || 0,
          comments: dbPost.comments_count || 0,
          time: getTimeAgo(dbPost.created_at),
          isLiked: likedPostIds.has(dbPost.id),
          isSaved: savedPostIds.has(dbPost.id),
          isOwner: dbPost.user_id === user?.id,
        }));
        setPosts(formatted);
      } else {
        setPosts([]);
      }
    } catch (e) {
      console.log('Feed fetch error:', e);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let channel: any;

    fetchPosts();

    // Real-time listener for new posts + likes/comments updates
    channel = supabase.channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts(); // Re-fetch to get profile info
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(current => current.map(p =>
          p.id === payload.new.id ? { ...p, likes: payload.new.likes, comments: payload.new.comments_count } : p
        ));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(current => current.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // --- POST CREATION ---

  const pickImage = async () => {
    Alert.alert('Add Photo', 'Capture or select a travel memory', [
      { text: 'Take Photo', onPress: () => openImagePicker(true) },
      { text: 'Choose from Gallery', onPress: () => openImagePicker(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openImagePicker = async (isCamera: boolean) => {
    try {
      const { status } = isCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', `We need ${isCamera ? 'camera' : 'gallery'} access to share photos.`);
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = isCamera 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.[0]?.uri) {
        setNewImageUri(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const uploadImageToStorage = async (uri: string, userId: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/post_${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Reusing the avatars bucket or create a 'posts' bucket
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (e) {
      console.error('Image upload failed:', e);
      return null;
    }
  };

  const handleCreatePost = async () => {
    if (!newCaption.trim() && !newImageUri) {
      Alert.alert('Missing Content', 'Please add a caption or image to your post.');
      return;
    }
    if (!userId) {
      Alert.alert('Not Logged In', 'Please log in to create a post.');
      return;
    }

    setPublishing(true);
    try {
      let imageUrl: string | null = null;

      if (newImageUri) {
        imageUrl = await uploadImageToStorage(newImageUri, userId);
        if (!imageUrl) {
          // If upload fails, use the local URI as a fallback for display
          imageUrl = newImageUri;
        }
      }

      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        caption: newCaption.trim(),
        image_url: imageUrl,
        location: newLocation.trim() || null,
        likes: 0,
        comments_count: 0,
      });

      if (error) {
        console.error('Database Error:', error);
        throw new Error(error.message);
      }

      setShowCreatePost(false);
      setNewCaption('');
      setNewLocation('');
      setNewImageUri(null);
      fetchPosts();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create post');
    } finally {
      setPublishing(false);
    }
  };

  // --- INTERACTIONS ---

  const handleLike = async (postId: string) => {
    if (!userId) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const wasLiked = post.isLiked;
    const newLikes = wasLiked ? post.likes - 1 : post.likes + 1;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isLiked: !wasLiked, likes: newLikes } : p
    ));

    try {
      if (wasLiked) {
        const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
        if (error) throw error;
        
        // Add notification for the post owner
        if (post.user.id !== userId) {
          await supabase.from('notifications').insert({
            user_id: post.user.id,
            actor_id: userId,
            type: 'like',
            post_id: postId,
            content: 'liked your post'
          });
        }
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Update the like count on the post
      const { error: postError } = await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
      if (postError) throw postError;
    } catch (e: any) {
      console.error('Like error:', e.message);
      // Revert on error
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, isLiked: wasLiked, likes: post.likes } : p
      ));
    }
  };

  const handleBookmark = async (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // UI update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing, error: checkError } = await supabase
        .from('post_bookmarks')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error } = await supabase.from('post_bookmarks').delete().eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    } catch (e: any) {
      console.error('Bookmark error:', e.message);
    }
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

  const handleDeletePost = (postId: string) => {

    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await supabase.from('posts').delete().eq('id', postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      },
    ]);
  };

  // --- COMMENTS ---

  const openComments = async (post: any) => {
    setActivePostId(post.id);
    setLoadingComments(true);
    setPostComments([]);


    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name, first_name, username, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setPostComments(data.map((c: any) => ({
          id: c.id,
          name: c.profiles?.first_name || c.profiles?.full_name || 'User',
          avatar: c.profiles?.avatar_url,
          text: c.content,
          time: getTimeAgo(c.created_at),
        })));
      }
    } catch (e) {
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activePostId || !userId) return;

    const text = commentText.trim();
    setCommentText('');

    // Optimistic add
    const tempComment = {
      id: 'temp_' + Date.now(),
      name: 'You',
      text,
      time: 'Just now',
    };
    setPostComments(prev => [...prev, tempComment]);
    setPosts(prev => prev.map(p =>
      p.id === activePostId ? { ...p, comments: p.comments + 1 } : p
    ));



    try {
      const { error } = await supabase.from('comments').insert({
        post_id: activePostId,
        user_id: userId,
        content: text,
      });
      if (error) throw error;

      // Add notification for the post owner
      const postOwnerId = posts.find(p => p.id === activePostId)?.user.id;
      if (postOwnerId && postOwnerId !== userId) {
        await supabase.from('notifications').insert({
          user_id: postOwnerId,
          actor_id: userId,
          type: 'comment',
          post_id: activePostId,
          content: `commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
        });
      }

      // Update comment count on the post
      const post = posts.find(p => p.id === activePostId);
      if (post) {
        const { error: postError } = await supabase.from('posts').update({ comments_count: post.comments + 1 }).eq('id', activePostId);
        if (postError) throw postError;
      }
    } catch (e: any) {
      console.error('Comment error:', e.message);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    }
  };

  // --- RENDERING ---

  const renderPost = ({ item }: { item: any }) => (
    <View className="mb-10 px-5">
      {/* 1. Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center active:opacity-75"
          onPress={() => navigation.navigate('UserProfile', { userId: item.user.id, profile: item.user })}
        >
          <Avatar uri={item.user.avatar} name={item.user.name} size={44} />
          <View className="ml-3">
            <View className="flex-row items-center">
              <Text className="text-[15px] font-bold text-gray-900">{item.user.name}</Text>
              {item.user.isVerified && (
                <View className="ml-1 bg-hi-green rounded-full p-0.5">
                  <Ionicons name="checkmark" size={8} color="white" />
                </View>
              )}
            </View>
            <View className="mt-0.5 flex-row items-center">
              <FontAwesome6 name="location-dot" size={10} color="#30AF5B" />
              <Text className="ml-1 text-xs font-semibold text-gray-500">{item.location}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center"
          onPress={() => item.isOwner ? handleDeletePost(item.id) : null}
        >
          <Feather name={item.isOwner ? "trash-2" : "more-horizontal"} size={item.isOwner ? 16 : 20} color={item.isOwner ? "#EF4444" : "#A2A2A2"} />
        </TouchableOpacity>
      </View>

      {/* 2. Image */}
      {item.image && (
        <View
          className="relative h-[380px] w-full overflow-hidden rounded-[30px] bg-gray-100 border border-gray-100"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}
        >
          <Image source={{ uri: item.image }} className="h-full w-full" resizeMode="cover" />
        </View>
      )}

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

          <TouchableOpacity 
            onPress={() => {
               setSelectedPost(item);
               setShareModalVisible(true);
            }} 
            className="flex-row items-center ml-5 active:scale-95"
          >
            <Feather name="send" size={24} color="#1F2937" style={{ marginTop: -2 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleBookmark(item.id)} className="active:scale-95">
          {item.isSaved ? (
            <Ionicons name="bookmark" size={26} color="#30AF5B" />
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#30AF5B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="z-50 px-5 pb-2 pt-2 bg-[#F9FAFB]">
        <Navbar />
      </View>

      <View className="flex-row items-center justify-between px-6 pb-3 pt-1 z-50">
        <Text className="text-2xl font-black tracking-tight text-gray-900">Community</Text>
        <TouchableOpacity
          onPress={() => setShowCreatePost(true)}
          className="bg-hi-green px-4 py-2.5 rounded-full flex-row items-center shadow-sm shadow-green-900/20 z-50"
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white font-bold text-sm ml-1.5">Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40, ...(posts.length === 0 && { flex: 1 }) }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-5 border border-gray-200">
              <Ionicons name="camera-outline" size={36} color="#A2A2A2" />
            </View>
            <Text className="text-xl font-black text-gray-900 text-center">No stories yet</Text>
            <Text className="text-gray-400 font-medium text-center mt-2 leading-relaxed">
              Be the first to share your travel story with the community!
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreatePost(true)}
              className="bg-hi-green px-6 py-3 rounded-full mt-6 shadow-sm shadow-green-900/20"
            >
              <Text className="text-white font-bold text-sm">Share Your First Post</Text>
            </TouchableOpacity>
          </View>
        }
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

            {loadingComments ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="small" color="#30AF5B" />
              </View>
            ) : (
              <FlatList
                data={postComments}
                keyExtractor={item => item.id}
                className="flex-1 px-5 pt-2"
                renderItem={({ item }) => (
                  <View className="flex-row mb-4">
                    <View className="w-8 h-8 rounded-full bg-gray-200 mt-1 overflow-hidden">
                      {item.avatar && <Image source={{ uri: item.avatar }} className="w-full h-full" />}
                    </View>
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
                ListEmptyComponent={
                  <View className="items-center py-10">
                    <Text className="text-gray-400 font-bold">No comments yet</Text>
                    <Text className="text-gray-300 text-sm mt-1">Be the first to comment!</Text>
                  </View>
                }
              />
            )}

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

      {/* CREATE POST MODAL */}
      <Modal visible={showCreatePost} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="absolute inset-0 bg-black/40"
            activeOpacity={1}
            onPress={() => {
              if (!publishing) {
                setShowCreatePost(false);
                setNewCaption('');
                setNewLocation('');
                setNewImageUri(null);
              }
            }}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="bg-white rounded-t-3xl shadow-lg overflow-hidden"
            style={{ elevation: 20, maxHeight: '85%' }}
          >
            <View className="items-center py-3">
              <View className="h-1.5 w-12 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-100">
              <TouchableOpacity onPress={() => { setShowCreatePost(false); setNewCaption(''); setNewLocation(''); setNewImageUri(null); }}>
                <Text className="text-base font-bold text-gray-400">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-black text-gray-900">New Post</Text>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={publishing || (!newCaption.trim() && !newImageUri)}
              >
                {publishing ? (
                  <ActivityIndicator size="small" color="#30AF5B" />
                ) : (
                  <Text className={`text-base font-bold ${(newCaption.trim() || newImageUri) ? 'text-[#30AF5B]' : 'text-gray-300'}`}>
                    Share
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-4 pb-8">
              {/* Image Picker */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-52 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center overflow-hidden mb-4"
              >
                {newImageUri ? (
                  <Image source={{ uri: newImageUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center">
                    <Feather name="image" size={32} color="#A2A2A2" />
                    <Text className="text-gray-400 font-bold mt-2">Tap to add a photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Caption */}
              <TextInput
                value={newCaption}
                onChangeText={setNewCaption}
                placeholder="What's on your mind, traveler?"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="bg-gray-50 p-4 rounded-2xl text-base font-medium text-gray-900 min-h-[80px] mb-4 border border-gray-100"
              />

              {/* Location */}
              <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                <FontAwesome6 name="location-dot" size={16} color="#30AF5B" />
                <TextInput
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="Add location (e.g., Spiti Valley)"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base font-medium text-gray-900"
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Share to Buddy Modal */}
      <Modal visible={shareModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity className="flex-1" onPress={() => setShareModalVisible(false)} />
          <View className="bg-white rounded-t-[40px] p-6 pb-12">
             <View className="w-12 h-1.5 bg-hi-gray-10 rounded-full self-center mb-6" />
             <Text className="text-xl font-black text-hi-dark mb-6 text-center italic">Send to Buddy</Text>
             
             <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row" style={{ gap: 16 }}>
                   {buddies.map((buddy) => (
                      <TouchableOpacity 
                        key={buddy.id} 
                        onPress={() => sendPostToBuddy(buddy.id)}
                        className="items-center"
                      >
                         <Avatar uri={buddy.avatar_url} name={buddy.first_name || buddy.full_name} size={64} borderWidth={2} borderColor="#FAFAFA" />
                      </TouchableOpacity>
                   ))}
                </View>
             </ScrollView>

             <TouchableOpacity 
               onPress={() => {
                 setShareModalVisible(false);
                 handleShare(selectedPost);
               }}
               className="bg-hi-bg p-5 rounded-2xl flex-row items-center justify-between border border-hi-gray-10"
             >
                <View className="flex-row items-center">
                   <Ionicons name="share-outline" size={20} color="#292C27" />
                   <Text className="text-sm font-bold text-hi-dark ml-3">External Share</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#A2A2A2" />
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
