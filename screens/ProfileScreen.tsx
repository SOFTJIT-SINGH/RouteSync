import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      setProfile({ ...profileData, email: user.email });

      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (tripError) throw tripError;
      setMyTrips(tripData || []);

      // Fetch Follow Counts
      const [{ count: fers }, { count: fing }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
      ]);

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postError) throw postError;
      setMyPosts(postData || []);

      setProfile({ ...profileData, email: user.email, followersCount: fers || 0, followingCount: fing || 0 });

      // Fetch pending join requests for user's trips
      const tripIds = (tripData || []).map((t: any) => t.id);
      if (tripIds.length > 0) {
        const { data: reqData } = await supabase
          .from('sync_requests')
          .select('*, profiles:sender_id(id, first_name, full_name, avatar_url), trips:target_trip_id(destination)')
          .in('target_trip_id', tripIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        setJoinRequests(reqData || []);
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (req: any) => {
    try {
      await supabase.from('sync_requests').update({ status: 'accepted' }).eq('id', req.id);
      await supabase.from('trip_members').upsert({ trip_id: req.target_trip_id, user_id: req.sender_id });
      await supabase.from('notifications').insert({
        user_id: req.sender_id,
        type: 'sync',
        title: 'Request Accepted! 🎉',
        message: `You've been added to the trip to ${req.trips?.destination}`,
        metadata: { tripId: req.target_trip_id },
      });
      setJoinRequests(prev => prev.filter(r => r.id !== req.id));
      Alert.alert('Accepted!', `${req.profiles?.first_name || req.profiles?.full_name || 'User'} has been added to the trip.`);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleRejectRequest = async (req: any) => {
    try {
      await supabase.from('sync_requests').update({ status: 'rejected' }).eq('id', req.id);
      setJoinRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-hi-bg justify-center items-center">
        <ActivityIndicator size="large" color="#30AF5B" />
      </View>
    );
  }

  const displayName = profile?.full_name?.trim() || profile?.first_name?.trim() || 'Explorer';
  const avatarUrl = profile?.avatar_url || null;
  const bio = profile?.bio || 'No bio yet. Start your journey on RouteSync!';
  const coverUrl = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop';

  return (
    <SafeAreaView className="flex-1 bg-hi-bg">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
        
        <View className="relative">
          <Image 
            source={{ uri: profile?.cover_url || coverUrl }} 
            className="w-full h-56 bg-hi-dark"
            resizeMode="cover"
          />
          <View className="absolute w-full h-full bg-black/20" />
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ top: insets.top + 10, left: 24 }}
            className="absolute w-10 h-10 bg-hi-dark/50 rounded-full items-center justify-center border border-white/20"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={{ top: insets.top + 10, right: 24 }}
            className="absolute w-10 h-10 bg-hi-dark/50 rounded-full items-center justify-center border border-white/20"
          >
            <Feather name="settings" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. Profile Info (Overlapping Card) */}
        <View className="bg-hi-bg rounded-t-4xl -mt-8 px-6 pt-0 pb-6 border-t border-white shadow-sm shadow-gray-200">
          <View className="flex-row justify-between items-end -mt-12 mb-4">
            <View className="relative">
              <Avatar uri={avatarUrl} name={displayName} size={96} borderWidth={4} borderColor="#FAFAFA" />
              <View className="absolute bottom-1 right-1 w-5 h-5 bg-hi-green border-2 border-white rounded-full" />
            </View>

            <View className="flex-row items-center mb-2" style={{ gap: 12 }}>
               <TouchableOpacity 
                 onPress={() => navigation.navigate('LikedPosts')}
                 className="w-10 h-10 bg-hi-bg rounded-full items-center justify-center border border-hi-gray-10 shadow-sm"
               >
                  <Ionicons name="heart" size={20} color="#EF4444" />
               </TouchableOpacity>
               <TouchableOpacity 
                 onPress={() => navigation.navigate('SavedPosts')}
                 className="w-10 h-10 bg-hi-bg rounded-full items-center justify-center border border-hi-gray-10 shadow-sm"
               >
                  <Ionicons name="bookmark" size={20} color="#30AF5B" />
               </TouchableOpacity>
               <TouchableOpacity 
                 onPress={() => navigation.navigate('EditProfile')}
                 className="bg-hi-dark px-5 py-2.5 rounded-full shadow-sm shadow-gray-900/20"
               >
                 <Text className="text-white font-bold text-sm">Edit</Text>
               </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center">
              <Text className="text-2xl font-black text-hi-dark tracking-tight">{displayName}</Text>
              {(profile?.is_verified || profile?.email?.includes('hacknapp.com') || profile?.email?.includes('sskaid.com')) && (
                <View className="ml-1.5 bg-hi-green rounded-full p-0.5">
                  <Ionicons name="checkmark" size={10} color="white" />
                </View>
              )}
            </View>
            <Text className="text-base text-hi-gray-50 mt-3 leading-relaxed font-medium pr-4">
              {bio}
            </Text>
          </View>

          {/* 3. Wanderlust Metrics (New Data Component) */}
          <View className="flex-row items-center justify-between bg-white p-5 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-100 mb-8">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Connections', { userId: profile.id, initialTab: 'Followers' })}
              className="items-center flex-1"
            >
              <Text className="text-xl font-black text-hi-dark">{myPosts.length}</Text>
              <Text className="text-[10px] font-bold text-hi-gray-20 mt-1 uppercase tracking-wider">Posts</Text>
            </TouchableOpacity>
            <View className="w-px h-10 bg-hi-gray-10" />
            <TouchableOpacity 
              onPress={() => navigation.navigate('Connections', { userId: profile.id, initialTab: 'Followers' })}
              className="items-center flex-1"
            >
              <Text className="text-xl font-black text-hi-dark">{profile?.followersCount || 0}</Text>
              <Text className="text-[10px] font-bold text-hi-gray-20 mt-1 uppercase tracking-wider">Followers</Text>
            </TouchableOpacity>
            <View className="w-px h-10 bg-hi-gray-10" />
            <TouchableOpacity 
              onPress={() => navigation.navigate('Connections', { userId: profile.id, initialTab: 'Following' })}
              className="items-center flex-1"
            >
              <Text className="text-xl font-black text-hi-dark">{profile?.followingCount || 0}</Text>
              <Text className="text-[10px] font-bold text-hi-gray-20 mt-1 uppercase tracking-wider">Following</Text>
            </TouchableOpacity>
          </View>

          {/* 3.5 Join Requests (for trip owners) */}
          {joinRequests.length > 0 && (
            <View className="mb-10">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-hi-dark tracking-tight">Join Requests</Text>
                <View className="bg-hi-green px-2.5 py-0.5 rounded-full">
                  <Text className="text-white font-black text-[10px]">{joinRequests.length}</Text>
                </View>
              </View>
              {joinRequests.map((req: any) => (
                <View key={req.id} className="bg-white p-4 rounded-2xl border border-hi-gray-10 mb-3 flex-row items-center">
                  <Avatar uri={req.profiles?.avatar_url} name={req.profiles?.first_name || req.profiles?.full_name || 'Traveler'} size={44} />
                  <View className="ml-3 flex-1">
                    <Text className="font-bold text-hi-dark">{req.profiles?.first_name || req.profiles?.full_name || 'Traveler'}</Text>
                    <Text className="text-xs text-hi-gray-20">wants to join → {req.trips?.destination}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRejectRequest(req)} className="w-9 h-9 bg-red-50 rounded-full items-center justify-center mr-2 border border-red-100">
                    <Feather name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleAcceptRequest(req)} className="w-9 h-9 bg-hi-green rounded-full items-center justify-center">
                    <Feather name="check" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* 3.6 Dynamic Traveler Analytics (Improved UI/UX) */}
          <View className="mb-10">
             <View className="flex-row items-center justify-between mb-5">
               <View>
                 <Text className="text-xl font-black text-hi-dark tracking-tight">Traveler Analytics</Text>
                 <Text className="text-[10px] font-bold text-hi-gray-30 uppercase tracking-widest mt-1">Your Journey Insights</Text>
               </View>
               <TouchableOpacity 
                 onPress={() => navigation.navigate('TrustScore')}
                 className="bg-hi-green/10 px-3 py-1.5 rounded-full border border-hi-green/10 flex-row items-center"
               >
                  <Ionicons name="help-circle-outline" size={14} color="#30AF5B" />
                  <Text className="text-[10px] font-black text-hi-green uppercase tracking-tighter ml-1">Score Guide</Text>
               </TouchableOpacity>
             </View>

             <View className="flex-row gap-3">
                <View className="flex-1 bg-white p-5 rounded-[32px] border border-hi-gray-10 shadow-sm shadow-gray-100 items-center">
                   <View className="w-10 h-10 bg-hi-green/10 rounded-full items-center justify-center mb-3">
                      <Feather name="check-circle" size={18} color="#30AF5B" />
                   </View>
                   <Text className="text-xl font-black text-hi-dark">
                     {myTrips.filter(t => new Date(t.end_date) < new Date()).length}
                   </Text>
                   <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-tighter mt-1">Trips Done</Text>
                </View>

                <View className="flex-1 bg-white p-5 rounded-[32px] border border-hi-gray-10 shadow-sm shadow-gray-100 items-center">
                   <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mb-3">
                      <Feather name="map-pin" size={18} color="#3B82F6" />
                   </View>
                   <Text className="text-xl font-black text-hi-dark">
                     {[...new Set(myTrips.map(t => t.destination).filter(Boolean))].length}
                   </Text>
                   <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-tighter mt-1">Visited</Text>
                </View>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('TrustScore')}
                  className="flex-1 bg-white p-5 rounded-[32px] border border-hi-gray-10 shadow-sm shadow-gray-100 items-center"
                >
                   <View className="w-10 h-10 bg-hi-orange/10 rounded-full items-center justify-center mb-3">
                      <Feather name="shield" size={18} color="#F97316" />
                   </View>
                   <Text className="text-xl font-black text-hi-dark">
                     {Math.min(100, 20 + (profile?.avatar_url ? 20 : 0) + (profile?.bio ? 20 : 0) + (myTrips.length * 10))}%
                   </Text>
                   <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-tighter mt-1">Trust Score</Text>
                </TouchableOpacity>
             </View>
          </View>

          {/* 3.6 Conditional Achievements (DYNAMIC) */}
          <View className="mb-10">
             <View className="flex-row justify-between items-center mb-4">
               <Text className="text-xl font-bold text-hi-dark tracking-tight">Achievements</Text>
               <View className="bg-hi-bg px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-black text-hi-gray-30 uppercase">
                    {[myPosts.length > 0, myTrips.length > 0, (profile?.followersCount || 0) > 0, !!profile?.bio, !!profile?.avatar_url, myPosts.length > 5].filter(Boolean).length} Earned
                  </Text>
               </View>
             </View>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
                {([
                  myPosts.length > 0 && { icon: '🏆', label: 'Early Bird', color: '#FCD34D' },
                  myPosts.length > 5 && { icon: '📸', label: 'Storyteller', color: '#60A5FA' },
                  myTrips.length > 0 && { icon: '🏔️', label: 'Explorer', color: '#A78BFA' },
                  (profile?.followersCount || 0) > 0 && { icon: '🔥', label: 'Rising Star', color: '#F87171' },
                  !!profile?.bio && { icon: '📜', label: 'Author', color: '#34D399' },
                  !!profile?.avatar_url && { icon: '🤳', label: 'Identified', color: '#FB923C' }
                ].filter(Boolean) as any[]).map((badge, i) => (
                  <View key={i} className="items-center">
                    <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm shadow-gray-100 border border-hi-gray-10 mb-2">
                       <Text className="text-2xl">{badge.icon}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-hi-gray-30">{badge.label}</Text>
                  </View>
                ))}
                {myPosts.length === 0 && myTrips.length === 0 && (
                  <Text className="text-hi-gray-20 text-xs italic py-4">Start your first journey to earn badges!</Text>
                )}
             </ScrollView>
          </View>

          {/* 4. My Itineraries Section */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-hi-dark tracking-tight">Active Itineraries</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateTrip')}>
                <Text className="text-hi-green font-bold text-sm">+ New</Text>
              </TouchableOpacity>
            </View>

            {myTrips.length === 0 ? (
              <View className="bg-white p-6 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-100 items-center justify-center">
                <View className="bg-hi-green/10 w-14 h-14 rounded-full items-center justify-center mb-3">
                  <FontAwesome6 name="map" size={20} color="#30AF5B" />
                </View>
                <Text className="text-hi-dark font-bold text-base mb-1">No trips planned yet</Text>
                <Text className="text-hi-gray-30 text-sm text-center">Create an itinerary to start finding travel buddies.</Text>
              </View>
            ) : (
              myTrips.map((trip) => (
                <TouchableOpacity 
                  key={trip.id} 
                  onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
                  className="bg-white p-4 rounded-2xl mb-3 border border-hi-gray-10 shadow-sm shadow-gray-50 flex-row items-center"
                >
                  <View className="bg-hi-bg w-12 h-12 rounded-xl items-center justify-center border border-hi-gray-10 mr-4">
                    <FontAwesome6 name="location-dot" size={18} color="#30AF5B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-hi-dark" numberOfLines={1}>{trip.destination}</Text>
                    <Text className="text-xs text-hi-gray-30 font-medium mt-0.5">
                      {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#EEEEEE" />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* 5. My Stories Section (Replaces Tabs) */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-hi-dark tracking-tighter italic">Travel Stories</Text>
              <View className="h-0.5 flex-1 bg-hi-gray-10 mx-4 mt-1" />
              <TouchableOpacity onPress={() => navigation.navigate('Community')}>
                <Text className="text-hi-green font-bold text-xs uppercase tracking-widest">Feed</Text>
              </TouchableOpacity>
            </View>

            {myPosts.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <View className="bg-hi-bg/50 w-16 h-16 rounded-full items-center justify-center mb-4">
                   <Ionicons name="camera-outline" size={24} color="#A2A2A2" />
                </View>
                <Text className="text-hi-gray-30 font-bold">No stories shared yet</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                {myPosts.map((post) => (
                  <TouchableOpacity 
                    key={post.id} 
                    onPress={() => navigation.navigate('EditPost', { post })}
                    className="w-1/3 aspect-square p-1 rounded-2xl overflow-hidden"
                  >
                    <Image source={{ uri: post.image_url }} className="w-full h-full bg-hi-gray-10 rounded-2xl" />
                    <View className="absolute bottom-2 right-2 bg-black/40 w-6 h-6 rounded-full items-center justify-center border border-white/20">
                      <Feather name="edit-2" size={10} color="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 5. Vibe / Interests */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-hi-dark tracking-tight mb-4">Travel Vibe</Text>
            <View className="flex-row flex-wrap gap-2">
              {(profile?.travel_style
                ? [profile.travel_style, ...(profile?.bio ? ['✈️ Explorer'] : [])]
                : ['📸 Photography', '🏔️ Mountains', '🍕 Foodie', '🏕️ Camping', '🏍️ Road Trips']
              ).map((interest: string, i: number) => (
                <View key={i} className="bg-white px-4 py-2.5 rounded-full border border-hi-gray-10 shadow-sm shadow-gray-50">
                  <Text className="text-sm font-semibold text-hi-gray-50 px-1">{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5.5. Personal Details */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-hi-dark tracking-tight">Personal Details</Text>
              <View className="bg-hi-green/10 px-3 py-1 rounded-full border border-hi-green/10">
                 <Text className="text-[10px] font-black text-hi-green uppercase tracking-tighter">Verified</Text>
              </View>
            </View>
            
            <View className="bg-white p-5 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-100 flex-col gap-6">
              {/* Email (From Auth) */}
              <View className="flex-row items-center">
                <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center mr-4 border border-blue-100">
                  <Feather name="mail" size={16} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-widest mb-0.5">Account Email</Text>
                  <Text className="text-base font-bold text-hi-dark" numberOfLines={1}>
                    {profile?.email || 'authenticated@user.com'}
                  </Text>
                </View>
              </View>

              {profile?.phone_number && (
                <View className="flex-row items-center">
                  <View className="bg-hi-green/10 w-10 h-10 rounded-xl items-center justify-center mr-4 border border-hi-green/20">
                    <Feather name="phone" size={16} color="#30AF5B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-widest mb-0.5">Phone Number</Text>
                    <Text className="text-base font-bold text-hi-dark">{profile.phone_number}</Text>
                  </View>
                </View>
              )}

              {profile?.gender && (
                <View className="flex-row items-center">
                  <View className="bg-purple-50 w-10 h-10 rounded-xl items-center justify-center mr-4 border border-purple-100">
                    <Feather name="user" size={16} color="#A855F7" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-widest mb-0.5">Identity</Text>
                    <Text className="text-base font-bold text-hi-dark">{profile.gender} • {profile.age || 'N/A'} yrs</Text>
                  </View>
                </View>
              )}

              {profile?.dob && (
                <View className="flex-row items-center">
                  <View className="bg-hi-orange/10 w-10 h-10 rounded-xl items-center justify-center mr-4 border border-hi-orange/20">
                    <Feather name="calendar" size={16} color="#FF7E5F" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-widest mb-0.5">Birthday</Text>
                    <Text className="text-base font-bold text-hi-dark">
                      {new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              )}

              {profile?.travel_style && (
                <View className="flex-row items-center">
                  <View className="bg-hi-green/10 w-10 h-10 rounded-xl items-center justify-center mr-4 border border-hi-green/20">
                    <Feather name="briefcase" size={16} color="#30AF5B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-widest mb-0.5">Primary Travel Style</Text>
                    <Text className="text-base font-bold text-hi-dark">{profile.travel_style}</Text>
                  </View>
                </View>
              )}

              {!profile?.phone_number && !profile?.dob && !profile?.gender && !profile?.age && (
                 <Text className="text-sm text-hi-gray-30 text-center py-2 font-medium">Add more details in Edit Profile!</Text>
              )}
            </View>
          </View>

          {/* 6. Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-white py-4 rounded-full flex-row justify-center items-center border border-red-200 mb-10"
          >
            <Feather name="log-out" size={18} color="#EF4444" />
            <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}