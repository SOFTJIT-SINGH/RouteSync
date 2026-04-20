import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function TripDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { tripId } = route.params;
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select(`
            *,
            profiles:user_id (id, full_name, first_name, username, avatar_url, bio)
          `)
          .eq('id', tripId)
          .single();

        if (error) throw error;
        setTrip(data);
      } catch (e) {
        console.error('Fetch trip error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId]);

  if (loading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator color="#30AF5B" /></View>;
  if (!trip) return <View className="flex-1 items-center justify-center bg-white"><Text>Trip not found.</Text></View>;

  const host = trip.profiles || {};
  const displayName = host.first_name || host.full_name || 'Traveler';

  return (
    <View className="flex-1 bg-hi-bg">
      <StatusBar barStyle="light-content" translucent />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounceless>
        {/* Hero Section */}
        <View className="relative h-[350px]">
          <Image 
            source={{ uri: trip.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000' }}
            className="w-full h-full bg-hi-dark"
          />
          <View className="absolute inset-0 bg-black/30" />
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ top: insets.top + 10, left: 24 }}
            className="absolute w-12 h-12 bg-black/40 rounded-full items-center justify-center border border-white/20"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="absolute bottom-10 left-6 right-6">
             <View className="bg-hi-green self-start px-4 py-1.5 rounded-full mb-3 shadow-lg shadow-green-900/40">
                <Text className="text-white font-black text-[10px] uppercase tracking-widest">{trip.vibe}</Text>
             </View>
             <Text className="text-4xl font-black text-white tracking-tighter shadow-sm">{trip.destination}</Text>
             <View className="flex-row items-center mt-2">
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text className="text-white/80 font-bold ml-2 text-sm">
                   {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                   {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
             </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="bg-hi-bg rounded-t-[40px] -mt-8 px-6 pt-10 pb-40">
            {/* Host Info */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('UserProfile', { userId: host.id })}
              className="flex-row items-center bg-white p-4 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-100 mb-8"
            >
               <Image source={{ uri: host.avatar_url || 'https://i.pravatar.cc/150' }} className="w-14 h-14 rounded-2xl bg-gray-100" />
               <View className="ml-4 flex-1">
                  <Text className="text-hi-gray-20 text-[10px] font-black uppercase tracking-widest">Organized By</Text>
                  <Text className="text-lg font-black text-hi-dark">{displayName}</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color="#A2A2A2" />
            </TouchableOpacity>

            {/* Quick Stats */}
            <View className="flex-row mb-10" style={{ gap: 12 }}>
               <View className="flex-1 bg-white p-5 rounded-3xl border border-hi-gray-10 items-center">
                  <Text className="text-hi-gray-20 text-[10px] font-black uppercase mb-1">Budget</Text>
                  <Text className="text-xl font-black text-hi-dark">₹{trip.budget?.toLocaleString() || '--'}</Text>
               </View>
               <View className="flex-1 bg-white p-5 rounded-3xl border border-hi-gray-10 items-center">
                  <Text className="text-hi-gray-20 text-[10px] font-black uppercase mb-1">Source</Text>
                  <Text className="text-xl font-black text-hi-dark" numberOfLines={1}>{trip.source}</Text>
               </View>
            </View>

            {/* Itinerary / Stops */}
            <View className="mb-10">
               <Text className="text-2xl font-black text-hi-dark tracking-tight mb-6">The Itinerary</Text>
               
               <View className="relative">
                  <View className="absolute left-[20px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-hi-gray-10" />
                  
                  {/* Start Point */}
                  <View className="flex-row items-center mb-10">
                     <View className="w-10 h-10 bg-hi-dark rounded-full items-center justify-center z-10 border-4 border-white">
                        <View className="w-2 h-2 bg-white rounded-full" />
                     </View>
                     <View className="ml-6 flex-1">
                        <Text className="text-hi-dark font-black text-lg">{trip.source}</Text>
                        <Text className="text-hi-gray-30 text-sm font-medium">Starting Point</Text>
                     </View>
                  </View>

                  {/* Stops */}
                  {trip.stops?.map((stop: string, idx: number) => (
                    <View key={idx} className="flex-row items-center mb-10">
                      <View className="w-10 h-10 bg-white rounded-full items-center justify-center z-10 border-2 border-hi-gray-10">
                         <View className="w-2 h-2 bg-hi-green rounded-full" />
                      </View>
                      <View className="ml-6 flex-1">
                         <Text className="text-hi-dark font-black text-lg">{stop}</Text>
                         <Text className="text-hi-gray-30 text-sm font-medium">Route Insight</Text>
                      </View>
                    </View>
                  ))}

                  {/* Destination */}
                  <View className="flex-row items-center">
                     <View className="w-10 h-10 bg-hi-green rounded-full items-center justify-center z-10 border-4 border-white shadow-lg shadow-green-900/30">
                        <Ionicons name="location" size={16} color="white" />
                     </View>
                     <View className="ml-6 flex-1">
                        <Text className="text-hi-green font-black text-xl">{trip.destination}</Text>
                        <Text className="text-hi-gray-30 text-sm font-medium">Final Destination</Text>
                     </View>
                  </View>
               </View>
            </View>

            {/* Disclaimer */}
            <View className="bg-white p-6 rounded-3xl border border-hi-gray-10 opacity-70">
               <View className="flex-row items-center mb-3">
                  <Ionicons name="shield-checkmark" size={20} color="#6366F1" />
                  <Text className="ml-2 font-black text-sm text-[#6366F1]">Safety First</Text>
               </View>
               <Text className="text-[12px] font-medium leading-[20px] text-hi-gray-30">
                  Always connect with travelers within RouteSync for your safety. Review the host profile and compatibility score before solidifying plans.
               </Text>
            </View>
        </View>
      </ScrollView>

      {/* Persistent Join Bar */}
      <View style={{ paddingBottom: insets.bottom + 20 }} className="absolute bottom-0 w-full bg-white/90 px-6 pt-5 border-t border-hi-gray-10">
         <TouchableOpacity 
           onPress={() => navigation.navigate('Chat', { buddyId: host.id, tripId: trip.id })}
           className="bg-hi-dark w-full h-16 rounded-full flex-row items-center justify-center shadow-2xl shadow-gray-900"
         >
            <Text className="text-white font-black text-lg mr-2">Say Hi to {displayName}</Text>
            <Feather name="message-circle" size={20} color="white" />
         </TouchableOpacity>
      </View>
    </View>
  );
}
