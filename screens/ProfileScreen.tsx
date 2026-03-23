import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // FIX: maybeSingle() prevents the PGRST116 error if row is missing
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); 

      if (profileError) throw profileError;
      setProfile(profileData || { full_name: 'Traveler', avatar_url: 'https://i.pravatar.cc/150' });

      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setMyTrips(tripsData || []);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Ready to end your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await supabase.auth.signOut() }
    ]);
  };

  if (loading) return (
    <View className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color="#30AF5B" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. TOP NAV */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        
        {/* 2. PROFILE HEADER CARD */}
        <View className="items-center py-6">
          <View className="relative">
            <Image 
              source={{ uri: profile?.avatar_url }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-xl shadow-gray-400"
            />
            <TouchableOpacity className="absolute bottom-1 right-1 bg-[#30AF5B] p-2 rounded-full border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-extrabold text-gray-900 mt-4">{profile?.full_name}</Text>
          <Text className="text-gray-500 font-medium">@{profile?.first_name?.toLowerCase() || 'traveler'}</Text>
        </View>

        {/* 3. BENTO INFO SECTION */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-gray-50 p-4 rounded-3xl w-[48%] items-center border border-gray-100">
            <MaterialCommunityIcons name="gender-male-female" size={24} color="#30AF5B" />
            <Text className="text-gray-400 text-xs font-bold uppercase mt-2">Gender</Text>
            <Text className="text-gray-900 font-bold">{profile?.gender || '—'}</Text>
          </View>
          <View className="bg-gray-50 p-4 rounded-3xl w-[48%] items-center border border-gray-100">
            <Ionicons name="calendar" size={24} color="#30AF5B" />
            <Text className="text-gray-400 text-xs font-bold uppercase mt-2">Birthday</Text>
            <Text className="text-gray-900 font-bold">{profile?.dob || '—'}</Text>
          </View>
        </View>

        {/* 4. BIO SECTION */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-900">About Me</Text>
            <TouchableOpacity><Text className="text-[#30AF5B] font-bold">Edit</Text></TouchableOpacity>
          </View>
          <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
            <Text className="text-gray-600 leading-relaxed">
              {profile?.bio || "Tell the community about your travel vibe! Are you a backpacker or a luxury seeker?"}
            </Text>
          </View>
        </View>

        {/* 5. MY TRIPS SECTION */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Planned Journeys</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddTrip')}>
              <Ionicons name="add-circle" size={32} color="#30AF5B" />
            </TouchableOpacity>
          </View>

          {myTrips.length === 0 ? (
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddTrip')}
              className="border-2 border-dashed border-gray-200 rounded-3xl p-8 items-center"
            >
              <Ionicons name="map-outline" size={32} color="#D1D5DB" />
              <Text className="text-gray-400 font-bold mt-2">Plan your first trip</Text>
            </TouchableOpacity>
          ) : (
            myTrips.map((trip) => (
              <View key={trip.id} className="bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm flex-row items-center">
                <View className="bg-green-50 p-3 rounded-2xl">
                  <MaterialCommunityIcons name="map-marker-path" size={24} color="#30AF5B" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-base font-bold text-gray-900">{trip.destination}</Text>
                  <Text className="text-xs text-gray-500">{trip.start_date} • ₹{trip.budget_min}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}