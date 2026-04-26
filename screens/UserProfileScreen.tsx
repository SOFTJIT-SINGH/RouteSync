import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, ScrollView, 
  ActivityIndicator, StatusBar, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

// Fallback posts removed for production-ready feel

export default function UserProfileScreen({ route, navigation }: any) {
  const { userId, profile: paramProfile } = route.params || {};
  
  const [profile, setProfile] = useState<any>(paramProfile || null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(!paramProfile);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Fetch Trips count
      const { count: tripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch Followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Fetch Following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count: isFollowingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        setIsFollowing(!!isFollowingCount && isFollowingCount > 0);
      }
        
      if (profileData) {
        setProfile({
          name: profileData.full_name?.trim() || profileData.first_name?.trim() || 'Traveler',
          avatar: profileData.avatar_url || null,
          bio: profileData.bio || 'Exploring the world, one journey at a time. Wanderlust and city dust. ✈️🌍',
          followers: followersCount || 0,
          following: followingCount || 0,
          trips: tripsCount || 0,
          isVerified: profileData.verification_status || false
        });
      }

      // Fetch Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsData && postsData.length > 0) {
        setPosts(postsData.map(p => ({ id: p.id, image: p.image_url })));
      } else {
        setPosts([]); // Clear mock posts if no real posts exist
      }
    } catch (e) {
      console.log('Error fetching user data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Join RouteSync', 'Log in to follow other travelers!');
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        if (error) throw error;
        setIsFollowing(false);
        setProfile((prev: any) => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: userId });
        
        if (error) throw error;

        // Add notification for the followed user
        await supabase.from('notifications').insert({
          user_id: userId,
          actor_id: user.id,
          type: 'follow',
          content: 'started following you'
        });

        setIsFollowing(true);
        setProfile((prev: any) => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleMessage = () => {
    // Navigate straight back to Chat if existing, or create new
    navigation.navigate('Chat', { buddyId: userId });
  };

  const handleReport = () => {
    setShowOptions(false);
    const REASONS = ['Fake Profile', 'Harassment', 'Spam', 'Inappropriate Content', 'Other'];
    Alert.alert('Report User', 'Why are you reporting this account?', [
      ...REASONS.map(reason => ({
        text: reason,
        onPress: async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('reports').insert({
              reporter_id: user.id,
              reported_user_id: userId,
              reason,
            });
            Alert.alert('Reported', 'Thank you for keeping our community safe. We will review this account.');
          } catch (e: any) { Alert.alert('Error', e.message); }
        }
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleBlock = () => {
    setShowOptions(false);
    Alert.alert('Block User', 'Are you sure you want to block this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => {
        Alert.alert('Blocked', 'This user has been blocked. You will no longer see their posts or messages.');
        navigation.goBack();
      }}
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#30AF5B" />
      </View>
    );
  }

  const p = profile || {
    name: 'Unknown User', username: 'unknown', avatar: null, bio: '', followers: 0, following: 0, trips: 0
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900 tracking-tight">Traveler Profile</Text>
        <TouchableOpacity onPress={() => setShowOptions(true)} className="w-10 h-10 items-center justify-center">
          <Ionicons name="ellipsis-horizontal" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Info */}
        <View className="items-center px-6 pt-4">
          <View className="relative">
            <Avatar uri={p.avatar} name={p.name} size={96} borderWidth={4} borderColor="#F9FAFB" />
            <View className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
          </View>
          
          <View className="flex-row items-center mt-4">
            <Text className="text-2xl font-black text-gray-900 tracking-tight">{p.name}</Text>
            {p.isVerified && (
              <View className="ml-1.5 bg-hi-green rounded-full p-0.5">
                <Ionicons name="checkmark" size={10} color="white" />
              </View>
            )}
          </View>
          <Text className="text-sm font-medium text-gray-500 mt-1">{p.bio}</Text>
        </View>

        {/* Stats / Traveler Analytics */}
        <View className="px-6 mt-8">
           <Text className="text-lg font-black text-gray-900 mb-4 tracking-tight">Traveler Analytics</Text>
           <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-50 p-4 rounded-3xl border border-gray-100 items-center">
                 <View className="w-8 h-8 bg-hi-green/10 rounded-full items-center justify-center mb-2">
                    <Feather name="check-circle" size={14} color="#30AF5B" />
                 </View>
                 <Text className="text-lg font-black text-gray-900">{p.trips}</Text>
                 <Text className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">Trips</Text>
              </View>

              <View className="flex-1 bg-gray-50 p-4 rounded-3xl border border-gray-100 items-center">
                 <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mb-2">
                    <Feather name="shield" size={14} color="#3B82F6" />
                 </View>
                 <Text className="text-lg font-black text-gray-900">
                    {Math.min(100, 20 + (p.avatar ? 20 : 0) + (p.bio ? 20 : 0) + (p.trips * 10))}%
                 </Text>
                 <Text className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">Trust</Text>
              </View>

              <View className="flex-1 bg-gray-50 p-4 rounded-3xl border border-gray-100 items-center">
                 <View className="w-8 h-8 bg-hi-orange/10 rounded-full items-center justify-center mb-2">
                    <Feather name="users" size={14} color="#F97316" />
                 </View>
                 <Text className="text-lg font-black text-gray-900">{p.followers}</Text>
                 <Text className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">Fans</Text>
              </View>
           </View>
        </View>

        {/* Achievements */}
        <View className="px-6 mt-10">
           <Text className="text-lg font-black text-gray-900 mb-4 tracking-tight">Achievements</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
              {([
                posts.length > 0 && { icon: '🏆', label: 'Early Bird' },
                posts.length >= 5 && { icon: '📸', label: 'Storyteller' },
                p.trips > 0 && { icon: '🏔️', label: 'Explorer' },
                p.followers > 0 && { icon: '🔥', label: 'Rising Star' },
                p.bio?.length > 20 && { icon: '📜', label: 'Author' },
                !!p.avatar && { icon: '🤳', label: 'Identified' },
                p.trips >= 3 && { icon: '🗺️', label: 'Trailblazer' },
                p.isVerified && { icon: '🛡️', label: 'Verified' }
              ].filter(Boolean) as any[]).map((badge, i) => (
                <View key={i} className="items-center">
                  <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm shadow-gray-100 border border-gray-100 mb-2">
                     <Text className="text-xl">{badge.icon}</Text>
                  </View>
                  <Text className="text-[9px] font-bold text-gray-400">{badge.label}</Text>
                </View>
              ))}
              {posts.length === 0 && p.trips === 0 && (
                <Text className="text-gray-400 text-xs italic py-4">No badges earned yet.</Text>
              )}
           </ScrollView>
        </View>

        {/* Posts Grid */}
        <View className="mt-10">
          <View className="px-6 flex-row items-center space-x-2 mb-4">
            <Ionicons name="grid" size={20} color="#1F2937" />
            <Text className="text-lg font-bold text-gray-900 tracking-tight">Recent Posts</Text>
          </View>

          <View className="flex-row flex-wrap w-full">
            {posts.map((post, index) => (
              <TouchableOpacity 
                key={post.id} 
                onPress={() => navigation.navigate('PostDetail', { postId: post.id, initialPost: post })}
                className="w-1/3 aspect-square p-[1px]"
                activeOpacity={0.8}
              >
                <Image source={{ uri: post.image }} className="w-full h-full bg-gray-200" />
              </TouchableOpacity>
            ))}
            {posts.length === 0 && (
              <View className="w-full items-center py-10">
                <Feather name="camera-off" size={32} color="#D1D5DB" />
                <Text className="text-gray-400 font-bold mt-3">No posts yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Options Modal (Block/Report) */}
      <Modal visible={showOptions} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/40">
          <TouchableOpacity className="flex-1" onPress={() => setShowOptions(false)} />
          <View className="bg-white rounded-t-[30px] p-6 pb-10">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />
            
            <TouchableOpacity onPress={handleReport} className="flex-row items-center py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
                <Feather name="flag" size={20} color="#F97316" />
              </View>
              <Text className="text-base font-bold text-gray-900 ml-4">Report User</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBlock} className="flex-row items-center py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
                <Feather name="slash" size={20} color="#EF4444" />
              </View>
              <Text className="text-base font-bold text-red-500 ml-4">Block User</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowOptions(false)} className="flex-row items-center py-4">
              <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                <Feather name="x" size={20} color="#4B5563" />
              </View>
              <Text className="text-base font-bold text-gray-500 ml-4">Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
