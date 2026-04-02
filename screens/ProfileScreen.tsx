import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

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
      setProfile(profileData);

      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (tripError) throw tripError;
      setMyTrips(tripData || []);

    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
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

  const displayName = profile?.full_name || profile?.first_name || 'Soft';
  const username = profile?.username || displayName.toLowerCase().replace(/\s/g, '') + '_travels';
  const avatarUrl = profile?.avatar_url || 'https://i.pravatar.cc/150';
  const bio = profile?.bio || 'Exploring the world, one city at a time. Always down for an adventure!';

  return (
    <SafeAreaView className="flex-1 bg-hi-bg">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
        
        <View className="relative">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop' }} 
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
            onPress={() => console.log('Settings')}
            style={{ top: insets.top + 10, right: 24 }}
            className="absolute w-10 h-10 bg-hi-dark/50 rounded-full items-center justify-center border border-white/20"
          >
            <Feather name="settings" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. Profile Info (Overlapping Card) */}
        <View className="bg-hi-bg rounded-t-4xl -mt-8 px-6 pt-0 pb-6 border-t border-white shadow-sm shadow-gray-200">
          <View className="flex-row justify-between items-end -mt-12 mb-4">
            <Image 
              source={{ uri: avatarUrl }} 
              className="w-24 h-24 rounded-full border-4 border-hi-bg bg-hi-gray-10"
            />
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditProfile')}
              className="bg-hi-dark px-5 py-2.5 rounded-full mb-2 shadow-sm shadow-gray-900/20"
            >
              <Text className="text-white font-bold text-sm">Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-2xl font-black text-hi-dark tracking-tight">{displayName}</Text>
            <Text className="text-sm font-bold text-hi-green mt-0.5">@{username}</Text>
            <Text className="text-base text-hi-gray-50 mt-3 leading-relaxed font-medium pr-4">
              {bio}
            </Text>
          </View>

          {/* 3. Stats Dashboard */}
          <View className="flex-row items-center justify-between bg-white p-5 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-100 mb-8">
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-hi-dark">{myTrips.length}</Text>
              <Text className="text-xs font-bold text-hi-gray-20 mt-1 uppercase tracking-wider">Trips</Text>
            </View>
            <View className="w-px h-10 bg-hi-gray-10" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-hi-dark">12</Text>
              <Text className="text-xs font-bold text-hi-gray-20 mt-1 uppercase tracking-wider">Countries</Text>
            </View>
            <View className="w-px h-10 bg-hi-gray-10" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-hi-dark">84</Text>
              <Text className="text-xs font-bold text-hi-gray-20 mt-1 uppercase tracking-wider">Buddies</Text>
            </View>
          </View>

          {/* 4. My Itineraries Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-hi-dark tracking-tight">My Itineraries</Text>
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
                <View key={trip.id} className="bg-white p-4 rounded-2xl mb-3 border border-hi-gray-10 shadow-sm shadow-gray-50 flex-row items-center">
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
                </View>
              ))
            )}
          </View>

          {/* 5. Vibe / Interests */}
          <View className="mb-10">
            <Text className="text-xl font-bold text-hi-dark tracking-tight mb-4">Travel Vibe</Text>
            <View className="flex-row flex-wrap gap-2">
              {['📸 Photography', '🏔️ Mountains', '🍕 Foodie', '🏕️ Camping', '🏍️ Road Trips'].map((interest, i) => (
                <View key={i} className="bg-white px-4 py-2.5 rounded-full border border-hi-gray-10 shadow-sm shadow-gray-50">
                  <Text className="text-sm font-semibold text-hi-gray-50 px-1">{interest}</Text>
                </View>
              ))}
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