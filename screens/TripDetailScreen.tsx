import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Alert, TextInput, Modal, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

const MODE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  solo: { label: 'Solo', icon: 'person', color: '#6366F1' },
  duo: { label: 'Duo', icon: 'people', color: '#EC4899' },
  group: { label: 'Group', icon: 'people-circle', color: '#30AF5B' },
  join_on_way: { label: 'Join on Way', icon: 'git-merge', color: '#FF814C' },
};

export default function TripDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { tripId } = route.params;
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [joinStatus, setJoinStatus] = useState<string | null>(null); // null | 'pending' | 'accepted' | 'member'
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchAll();
  }, [tripId]);

  const fetchAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch trip
      const { data, error } = await supabase
        .from('trips')
        .select(`*, profiles:user_id (id, full_name, first_name, username, avatar_url, bio)`)
        .eq('id', tripId)
        .single();
      if (error) throw error;
      setTrip(data);

      // Fetch members
      const { data: memberData } = await supabase
        .from('trip_members')
        .select('user_id, profiles(id, first_name, full_name, avatar_url)')
        .eq('trip_id', tripId);
      setMembers(memberData?.map((m: any) => m.profiles) || []);

      // Check if current user is a member
      const isMember = memberData?.some((m: any) => m.user_id === user?.id);
      if (isMember) {
        setJoinStatus('member');
        fetchExpenses();
      } else if (user) {
        // Check for existing sync request
        const { data: req } = await supabase
          .from('sync_requests')
          .select('status')
          .eq('sender_id', user.id)
          .eq('target_trip_id', tripId)
          .maybeSingle();
        if (req) setJoinStatus(req.status);
      }
    } catch (e) {
      console.error('Fetch trip error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('trip_expenses')
      .select('*, profiles:paid_by(first_name, full_name)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    setExpenses(data || []);
  };

  const handleJoinRequest = async () => {
    if (!userId || !trip) return;
    try {
      await supabase.from('sync_requests').insert({
        sender_id: userId,
        receiver_id: trip.user_id,
        target_trip_id: tripId,
        status: 'pending',
      });
      // Notify trip owner
      await supabase.from('notifications').insert({
        user_id: trip.user_id,
        type: 'sync',
        title: 'New Join Request!',
        message: `Someone wants to join your trip to ${trip.destination}`,
        metadata: { tripId, senderId: userId },
      });
      setJoinStatus('pending');
      Alert.alert('Request Sent!', 'The trip organizer will review your request.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleLeaveTrip = () => {
    Alert.alert('Leave Trip', 'Are you sure you want to leave this trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
        await supabase.from('trip_members').delete().eq('trip_id', tripId).eq('user_id', userId);
        setJoinStatus(null);
        setMembers(prev => prev.filter(m => m.id !== userId));
      }},
    ]);
  };

  const addExpense = async () => {
    if (!expDesc.trim() || !expAmount.trim() || !userId) return;
    try {
      await supabase.from('trip_expenses').insert({
        trip_id: tripId,
        paid_by: userId,
        description: expDesc.trim(),
        amount: parseFloat(expAmount),
        split_type: 'equal',
      });
      setExpDesc('');
      setExpAmount('');
      fetchExpenses();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteTrip = () => {
    Alert.alert('Delete Trip', 'This will permanently delete this trip and all its data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await supabase.from('trip_members').delete().eq('trip_id', tripId);
            await supabase.from('sync_requests').delete().eq('target_trip_id', tripId);
            await supabase.from('trips').delete().eq('id', tripId);
            Alert.alert('Deleted', 'Your trip has been removed.');
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      },
    ]);
  };

  const handleEditTrip = () => {
    setIsEditing(true);
    setEditData({
      destination: trip.destination || '',
      source: trip.source || '',
      budget: trip.budget?.toString() || '',
      vibe: trip.vibe || '',
      max_members: trip.max_members?.toString() || '5',
    });
  };

  const handleSaveEdit = async () => {
    try {
      const updates: any = {};
      if (editData.destination) updates.destination = editData.destination;
      if (editData.source) updates.source = editData.source;
      if (editData.budget) updates.budget = parseFloat(editData.budget);
      if (editData.vibe) updates.vibe = editData.vibe;
      if (editData.max_members) updates.max_members = parseInt(editData.max_members);

      const { error } = await supabase.from('trips').update(updates).eq('id', tripId);
      if (error) throw error;

      setTrip({ ...trip, ...updates });
      setIsEditing(false);
      Alert.alert('Updated!', 'Trip details have been saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator color="#30AF5B" /></View>;
  if (!trip) return <View className="flex-1 items-center justify-center bg-white"><Text>Trip not found.</Text></View>;

  const host = trip.profiles || {};
  const displayName = host.first_name || host.full_name || 'Traveler';
  const isOwner = userId === trip.user_id;
  const mode = MODE_LABELS[trip.trip_mode] || MODE_LABELS.solo;
  const spotsLeft = (trip.max_members || 5) - members.length;
  const totalExpense = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const perPerson = members.length > 0 ? totalExpense / members.length : 0;

  return (
    <View className="flex-1 bg-hi-bg">
      <StatusBar barStyle="light-content" translucent />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
            <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
              <View className="px-4 py-1.5 rounded-full shadow-lg" style={{ backgroundColor: mode.color }}>
                <Text className="text-white font-black text-[10px] uppercase tracking-widest">{mode.label}</Text>
              </View>
              {trip.vibe && (
                <View className="bg-white/20 px-3 py-1.5 rounded-full border border-white/20">
                  <Text className="text-white font-bold text-[10px] uppercase">{trip.vibe}</Text>
                </View>
              )}
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

        {/* Content */}
        <View className="bg-hi-bg rounded-t-[40px] -mt-8 px-6 pt-10 pb-40">
          {/* Host Info */}
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile', { userId: host.id })}
            className="flex-row items-center bg-white p-4 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-100 mb-8"
          >
            <Avatar uri={host.avatar_url} name={displayName} size={56} rounded="2xl" />
            <View className="ml-4 flex-1">
              <Text className="text-hi-gray-20 text-[10px] font-black uppercase tracking-widest">Organized By</Text>
              <Text className="text-lg font-black text-hi-dark">{displayName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A2A2A2" />
          </TouchableOpacity>

          {/* Quick Stats */}
          <View className="flex-row mb-8" style={{ gap: 12 }}>
            <View className="flex-1 bg-white p-5 rounded-3xl border border-hi-gray-10 items-center">
              <Text className="text-hi-gray-20 text-[10px] font-black uppercase mb-1">Budget</Text>
              <Text className="text-xl font-black text-hi-dark">₹{trip.budget?.toLocaleString() || '--'}</Text>
            </View>
            <View className="flex-1 bg-white p-5 rounded-3xl border border-hi-gray-10 items-center">
              <Text className="text-hi-gray-20 text-[10px] font-black uppercase mb-1">Spots Left</Text>
              <Text className="text-xl font-black" style={{ color: spotsLeft > 0 ? '#30AF5B' : '#EF4444' }}>{spotsLeft > 0 ? spotsLeft : 'Full'}</Text>
            </View>
          </View>

          {/* Members Panel */}
          <View className="mb-8">
            <Text className="text-xl font-black text-hi-dark tracking-tight mb-4">
              Crew ({members.length}/{trip.max_members || 5})
            </Text>
            <View className="bg-white rounded-3xl border border-hi-gray-10 p-4" style={{ gap: 10 }}>
              {members.map((m: any) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => navigation.navigate('UserProfile', { userId: m.id })}
                  className="flex-row items-center"
                >
                  <Avatar uri={m.avatar_url} name={m.first_name || m.full_name || 'Traveler'} size={40} />
                  <Text className="ml-3 font-bold text-hi-dark flex-1">{m.first_name || m.full_name || 'Traveler'}</Text>
                  {m.id === trip.user_id && (
                    <View className="bg-hi-green/15 px-2.5 py-1 rounded-full">
                      <Text className="text-[10px] font-black text-hi-green uppercase">Host</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {members.length === 0 && (
                <Text className="text-hi-gray-20 text-center py-4 font-medium">No members yet</Text>
              )}
            </View>
          </View>

          {/* Barter Tags */}
          {(trip.offering?.length > 0 || trip.seeking?.length > 0) && (
            <View className="mb-8">
              <Text className="text-xl font-black text-hi-dark tracking-tight mb-4">Collaboration</Text>
              {trip.offering?.length > 0 && (
                <View className="mb-3">
                  <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1">Host Offers</Text>
                  <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                    {trip.offering.map((tag: string, i: number) => (
                      <View key={i} className="bg-hi-green/10 px-3 py-1.5 rounded-full border border-hi-green/20">
                        <Text className="text-xs font-bold text-hi-green">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {trip.seeking?.length > 0 && (
                <View>
                  <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1">Looking For</Text>
                  <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                    {trip.seeking.map((tag: string, i: number) => (
                      <View key={i} className="bg-[#FF814C]/10 px-3 py-1.5 rounded-full border border-[#FF814C]/20">
                        <Text className="text-xs font-bold text-[#FF814C]">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Itinerary */}
          <View className="mb-8">
            <Text className="text-xl font-black text-hi-dark tracking-tight mb-6">The Itinerary</Text>
            <View className="relative">
              <View className="absolute left-[20px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-hi-gray-10" />
              <View className="flex-row items-center mb-10">
                <View className="w-10 h-10 bg-hi-dark rounded-full items-center justify-center z-10 border-4 border-white">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
                <View className="ml-6 flex-1">
                  <Text className="text-hi-dark font-black text-lg">{trip.source}</Text>
                  <Text className="text-hi-gray-30 text-sm font-medium">Starting Point</Text>
                </View>
              </View>
              {trip.stops?.map((stop: string, idx: number) => (
                <View key={idx} className="flex-row items-center mb-10">
                  <View className="w-10 h-10 bg-white rounded-full items-center justify-center z-10 border-2 border-hi-gray-10">
                    <View className="w-2 h-2 bg-hi-green rounded-full" />
                  </View>
                  <View className="ml-6 flex-1">
                    <Text className="text-hi-dark font-black text-lg">{stop}</Text>
                    <Text className="text-hi-gray-30 text-sm font-medium">Stop {idx + 1}</Text>
                  </View>
                </View>
              ))}
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

          {/* Expense Splitter (only for members) */}
          {joinStatus === 'member' && (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-black text-hi-dark tracking-tight">Expenses</Text>
                <TouchableOpacity onPress={() => setShowExpenseModal(true)} className="bg-hi-dark px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-xs">+ Add</Text>
                </TouchableOpacity>
              </View>

              {/* Summary */}
              <View className="flex-row mb-4" style={{ gap: 12 }}>
                <View className="flex-1 bg-white p-4 rounded-2xl border border-hi-gray-10 items-center">
                  <Text className="text-[10px] font-black text-hi-gray-20 uppercase">Total</Text>
                  <Text className="text-lg font-black text-hi-dark">₹{totalExpense.toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-hi-green/10 p-4 rounded-2xl border border-hi-green/20 items-center">
                  <Text className="text-[10px] font-black text-hi-green uppercase">Per Person</Text>
                  <Text className="text-lg font-black text-hi-green">₹{Math.round(perPerson).toLocaleString()}</Text>
                </View>
              </View>

              {/* Expense List */}
              {expenses.slice(0, 5).map((exp: any) => (
                <View key={exp.id} className="flex-row items-center bg-white p-3.5 rounded-2xl border border-hi-gray-10 mb-2">
                  <View className="w-9 h-9 bg-hi-bg rounded-full items-center justify-center mr-3">
                    <Feather name="credit-card" size={16} color="#292C27" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-hi-dark text-sm">{exp.description}</Text>
                    <Text className="text-[10px] text-hi-gray-20 font-medium">
                      Paid by {exp.profiles?.first_name || exp.profiles?.full_name || 'Member'}
                    </Text>
                  </View>
                  <Text className="font-black text-hi-dark">₹{Number(exp.amount).toLocaleString()}</Text>
                </View>
              ))}
              {expenses.length === 0 && (
                <View className="bg-white p-6 rounded-2xl border border-hi-gray-10 items-center">
                  <Text className="text-hi-gray-20 font-medium">No expenses logged yet</Text>
                </View>
              )}
            </View>
          )}

          {/* Safety */}
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

      {/* Bottom Action Bar */}
      <View style={{ paddingBottom: insets.bottom + 20 }} className="absolute bottom-0 w-full bg-white/95 px-6 pt-5 border-t border-hi-gray-10">
        {isOwner ? (
          <View style={{ gap: 10 }}>
            <View className="flex-row" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={handleEditTrip}
                className="flex-1 bg-white h-14 rounded-full flex-row items-center justify-center border border-hi-gray-10"
              >
                <Feather name="edit-2" size={18} color="#292C27" />
                <Text className="text-hi-dark font-bold text-sm ml-2">Edit Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteTrip}
                className="h-14 px-5 rounded-full items-center justify-center bg-red-50 border border-red-200"
              >
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chat', { tripId: trip.id })}
              className="bg-hi-dark w-full h-14 rounded-full flex-row items-center justify-center shadow-lg shadow-gray-900"
            >
              <Feather name="message-circle" size={18} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Open Group Chat</Text>
            </TouchableOpacity>
          </View>
        ) : joinStatus === 'member' ? (
          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity onPress={handleLeaveTrip} className="bg-red-50 h-16 px-6 rounded-full items-center justify-center border border-red-200">
              <Feather name="log-out" size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chat', { tripId: trip.id })}
              className="flex-1 bg-hi-green h-16 rounded-full flex-row items-center justify-center shadow-lg shadow-green-900/30"
            >
              <Text className="text-white font-black text-lg mr-2">Group Chat</Text>
              <Feather name="message-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : joinStatus === 'pending' ? (
          <View className="bg-hi-bg w-full h-16 rounded-full flex-row items-center justify-center border border-hi-gray-10">
            <Ionicons name="time-outline" size={22} color="#A2A2A2" />
            <Text className="text-hi-gray-30 font-black text-base ml-2">Request Pending</Text>
          </View>
        ) : spotsLeft > 0 ? (
          <TouchableOpacity
            onPress={handleJoinRequest}
            className="bg-hi-green w-full h-16 rounded-full flex-row items-center justify-center shadow-2xl shadow-green-900/30"
          >
            <Text className="text-white font-black text-lg mr-2">Request to Join</Text>
            <Ionicons name="add-circle" size={22} color="white" />
          </TouchableOpacity>
        ) : (
          <View className="bg-hi-bg w-full h-16 rounded-full flex-row items-center justify-center border border-hi-gray-10">
            <Ionicons name="close-circle" size={22} color="#EF4444" />
            <Text className="text-hi-gray-30 font-black text-base ml-2">Trip is Full</Text>
          </View>
        )}
      </View>

      {/* Add Expense Modal */}
      <Modal visible={showExpenseModal} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <TouchableOpacity className="absolute inset-0 bg-black/40" activeOpacity={1} onPress={() => setShowExpenseModal(false)} />
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10" style={{ paddingBottom: insets.bottom + 24 }}>
            <Text className="text-xl font-black text-hi-dark mb-6">Add Expense</Text>
            <TextInput
              value={expDesc}
              onChangeText={setExpDesc}
              placeholder="What was it for? (e.g., Hotel, Fuel)"
              placeholderTextColor="#A2A2A2"
              className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 font-bold text-hi-dark mb-3"
            />
            <View className="flex-row items-center bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 mb-6">
              <Text className="text-hi-gray-20 font-black text-xl mr-2">₹</Text>
              <TextInput
                value={expAmount}
                onChangeText={setExpAmount}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#EEEEEE"
                className="flex-1 text-xl font-black text-hi-green"
              />
            </View>
            <TouchableOpacity
              onPress={() => { addExpense(); setShowExpenseModal(false); }}
              disabled={!expDesc.trim() || !expAmount.trim()}
              className="bg-hi-green w-full py-4 rounded-full items-center"
            >
              <Text className="text-white font-black text-base">Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <TouchableOpacity className="absolute inset-0 bg-black/40" activeOpacity={1} onPress={() => setIsEditing(false)} />
          <View className="bg-white rounded-t-3xl px-6 pt-6" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-black text-hi-dark">Edit Trip</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Feather name="x" size={22} color="#A2A2A2" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1">Destination</Text>
              <TextInput
                value={editData.destination}
                onChangeText={(t) => setEditData({ ...editData, destination: t })}
                placeholder="Destination"
                placeholderTextColor="#A2A2A2"
                className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 font-bold text-hi-dark mb-4"
              />
              <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1">Starting Point</Text>
              <TextInput
                value={editData.source}
                onChangeText={(t) => setEditData({ ...editData, source: t })}
                placeholder="Source"
                placeholderTextColor="#A2A2A2"
                className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 font-bold text-hi-dark mb-4"
              />
              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1">Budget (₹)</Text>
                  <TextInput
                    value={editData.budget}
                    onChangeText={(t) => setEditData({ ...editData, budget: t })}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#A2A2A2"
                    className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 font-bold text-hi-dark"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1">Max Members</Text>
                  <TextInput
                    value={editData.max_members}
                    onChangeText={(t) => setEditData({ ...editData, max_members: t })}
                    placeholder="5"
                    keyboardType="numeric"
                    placeholderTextColor="#A2A2A2"
                    className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 font-bold text-hi-dark"
                  />
                </View>
              </View>
              <Text className="text-xs font-bold text-hi-gray-20 uppercase tracking-widest mb-2 ml-1 mt-4">Vibe</Text>
              <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                {['Adventure', 'Roadtrip', 'Chill', 'Backpacking', 'Luxury', 'Solo'].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setEditData({ ...editData, vibe: v })}
                    className={`px-4 py-2.5 rounded-full border ${editData.vibe === v ? 'bg-hi-dark border-hi-dark' : 'bg-hi-bg border-hi-gray-10'}`}
                  >
                    <Text className={`font-bold text-sm ${editData.vibe === v ? 'text-white' : 'text-hi-gray-30'}`}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSaveEdit}
              className="bg-hi-green w-full py-4 rounded-full items-center mt-4"
            >
              <Text className="text-white font-black text-base">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
