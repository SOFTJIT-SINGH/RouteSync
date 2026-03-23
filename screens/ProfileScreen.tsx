import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
      // 1. Get the currently logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Fetch their details from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // 3. Fetch any trips they have created
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;
      setMyTrips(tripsData || []);

    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive',
        onPress: async () => {
          // This tells Supabase to kill the session
          await supabase.auth.signOut();
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#30AF5B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-4 flex-row items-center justify-between bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">My Profile</Text>
        <TouchableOpacity onPress={handleLogout} className="p-2 bg-red-50 rounded-full">
          <MaterialIcons name="logout" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white px-5 py-8 items-center border-b border-gray-100 shadow-sm">
          <Image 
            source={{ uri: profile?.avatar_url || 'https://i.pravatar.cc/150' }}
            className="w-24 h-24 rounded-full border-4 border-[#30AF5B] mb-4"
          />
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {profile?.full_name || 'Traveler'}
          </Text>
          
          <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full mt-2 border border-green-200">
            <Ionicons name="compass" size={16} color="#30AF5B" />
            <Text className="text-[#30AF5B] font-bold text-sm ml-1">
              {profile?.travel_style || 'Explorer'}
            </Text>
          </View>
        </View>

        <View className="px-5 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-2">About Me</Text>
          <Text className="text-gray-600 leading-relaxed text-base">
            {profile?.bio || 'Add a bio to tell other travelers about your travel style, interests, and what you look for in a buddy!'}
          </Text>
          
          <TouchableOpacity className="mt-5 bg-gray-900 py-3.5 rounded-xl items-center shadow-sm">
            <Text className="text-white font-bold text-base">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 pb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">My Routes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddTrip')}>
              <Ionicons name="add-circle" size={32} color="#30AF5B" />
            </TouchableOpacity>
          </View>

          {myTrips.length === 0 ? (
             <View className="bg-white p-6 rounded-2xl border border-gray-200 items-center border-dashed">
               <Text className="text-gray-500 mb-3 text-center text-base">You haven&apos;t planned any trips yet.</Text>
               <TouchableOpacity 
                 className="bg-[#30AF5B] px-5 py-2.5 rounded-xl shadow-sm"
                 onPress={() => navigation.navigate('AddTrip')}
               >
                 <Text className="text-white font-bold">Plan a Trip</Text>
               </TouchableOpacity>
             </View>
          ) : (
            myTrips.map((trip) => (
              <View key={trip.id} className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row justify-between items-center">
                <View>
                  <Text className="font-bold text-gray-900 text-base">{trip.destination}</Text>
                  <Text className="text-gray-500 text-xs mt-1 font-medium">{trip.start_date} to {trip.end_date}</Text>
                </View>
                <View className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <Text className="text-[#30AF5B] font-bold text-xs">₹{trip.budget_min}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}