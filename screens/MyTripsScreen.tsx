import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function MyTripsScreen({ navigation }: any) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      console.error('Error fetching my trips:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyTrips();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyTrips();
  };

  const deleteTrip = (id: string) => {
    supabase.from('trips').delete().eq('id', id).then(() => fetchMyTrips());
  };

  const renderTrip = ({ item }: { item: any }) => (
    <View className="mb-4 mx-5 bg-white rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-200 overflow-hidden">
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
               <View className="bg-hi-green p-1.5 rounded-full mr-2">
                 <FontAwesome6 name="location-dot" size={10} color="white" />
               </View>
               <Text className="text-xl font-black text-hi-dark tracking-tight">{item.destination}</Text>
            </View>
            <Text className="text-hi-gray-30 text-xs font-bold uppercase tracking-widest ml-7">
               {new Date(item.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => deleteTrip(item.id)}
            className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
          >
             <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mt-2 pt-4 border-t border-hi-gray-10">
          <View className="flex-row items-center mr-6">
            <Ionicons name="wallet-outline" size={14} color="#30AF5B" />
            <Text className="ml-1.5 text-xs font-bold text-hi-dark">₹{item.budget?.toLocaleString() || 'Flexible'}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="sparkles-outline" size={14} color="#30AF5B" />
            <Text className="ml-1.5 text-xs font-bold text-hi-dark">{item.vibe || 'Chill'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Chat', { tripId: item.id })}
            className="ml-auto bg-hi-dark px-4 py-2 rounded-full"
          >
            <Text className="text-white text-[10px] font-black uppercase">Open Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <View className="px-5 pt-2 pb-3">
        <Navbar />
      </View>

      <View className="mx-5 mt-4 mb-6">
        <Text className="text-3xl font-black text-hi-dark tracking-tighter">My Journeys</Text>
        <Text className="text-hi-gray-30 mt-1 font-medium">Your published itineraries and plans.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#30AF5B" className="mt-10" />
      ) : trips.length === 0 ? (
        <View className="items-center justify-center mt-20 px-10">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-sm border border-hi-gray-10">
            <Feather name="map" size={32} color="#A2A2A2" />
          </View>
          <Text className="text-xl font-black text-hi-dark text-center">No trips planned yet.</Text>
          <Text className="text-hi-gray-30 text-center mt-2 font-medium">Ready for a new adventure? Create your first trip from the dashboard.</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            className="mt-8 bg-hi-green px-8 py-4 rounded-full"
          >
            <Text className="text-white font-black">Go Back Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTrip}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />
          }
        />
      )}
    </SafeAreaView>
  );
}
