import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Image, StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const VIBES = ['Adventure', 'Roadtrip', 'Chill', 'Backpacking', 'Luxury', 'Solo'];

export default function CreateTripScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [breaks, setBreaks] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [vibe, setVibe] = useState('Adventure');
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const addBreak = () => setBreaks([...breaks, '']);
  const updateBreak = (text: string, index: number) => {
    const newBreaks = [...breaks];
    newBreaks[index] = text;
    setBreaks(newBreaks);
  };
  const removeBreak = (index: number) => setBreaks(breaks.filter((_, i) => i !== index));

  const onStartChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };
  const onEndChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleCreateTrip = async () => {
    if (!source || !destination) {
      Alert.alert("Missing Details", "Please enter both a starting point and a destination.");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a trip.");

      const { error } = await supabase.from('trips').insert({
        user_id: user.id,
        source,
        destination,
        stops: breaks.filter(b => b.trim() !== ''),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        budget: budget ? parseFloat(budget) : null,
        vibe,
      });

      if (error) throw error;

      Alert.alert("Trip Published!", "Your itinerary is live and ready for buddies.", [
        { text: "Awesome", onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

          {/* Hero Header */}
          <View className="relative">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop' }}
              className="w-full h-72 bg-hi-dark"
              resizeMode="cover"
            />
            <View className="absolute w-full h-full bg-hi-dark/30" />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ top: insets.top + 10, left: 24 }}
              className="absolute w-12 h-12 bg-hi-dark/50 rounded-full items-center justify-center border border-white/20"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={{ top: insets.top + 14, right: 24 }} className="absolute">
              <View className="bg-hi-green/90 px-4 py-2 rounded-full">
                <Text className="text-white font-black text-xs uppercase tracking-widest">New Trip</Text>
              </View>
            </View>
          </View>

          {/* Main Form */}
          <View className="bg-white rounded-t-4xl -mt-12 px-6 pt-10 pb-40 border-t border-white shadow-2xl">
            <Text className="text-[10px] font-black text-hi-gray-20 uppercase tracking-[0.2em] mb-2">Route Builder</Text>
            <Text className="text-3xl font-black text-hi-dark tracking-tight mb-8">Map your journey.</Text>

            <View style={{ gap: 28 }}>

              {/* 1. Route Timeline */}
              <View>
                <Text className="text-hi-dark font-bold text-sm mb-4 ml-1">The Route</Text>
                <View className="bg-hi-bg p-5 rounded-3xl border border-hi-gray-10 relative">
                  <View className="absolute left-[39px] top-12 bottom-12 w-0.5 border-l-2 border-dashed border-hi-gray-10" />

                  {/* Start */}
                  <View className="flex-row items-center mb-4 relative z-10">
                    <View className="bg-white w-8 h-8 rounded-full items-center justify-center shadow-sm shadow-gray-200 border-2 border-hi-gray-10">
                      <View className="w-2.5 h-2.5 bg-hi-dark rounded-full" />
                    </View>
                    <TextInput
                      value={source}
                      onChangeText={setSource}
                      placeholder="Start City (e.g., Delhi)"
                      placeholderTextColor="#A2A2A2"
                      className="flex-1 ml-4 text-base font-bold text-hi-dark bg-white p-3.5 rounded-xl border border-hi-gray-10"
                    />
                  </View>

                  {/* Dynamic Stops */}
                  {breaks.map((stop, index) => (
                    <View key={index} className="flex-row items-center mb-4 relative z-10">
                      <View className="bg-white w-8 h-8 rounded-full items-center justify-center shadow-sm border-2 border-hi-gray-10">
                        <View className="w-2 h-2 bg-hi-gray-20 rounded-full" />
                      </View>
                      <TextInput
                        value={stop}
                        onChangeText={(text) => updateBreak(text, index)}
                        placeholder={`Stop ${index + 1}`}
                        placeholderTextColor="#A2A2A2"
                        className="flex-1 ml-4 text-base font-bold text-hi-dark bg-white p-3.5 rounded-xl border border-hi-gray-10"
                      />
                      <TouchableOpacity onPress={() => removeBreak(index)} className="ml-3 p-2">
                        <Feather name="minus-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add Stop */}
                  <TouchableOpacity onPress={addBreak} className="flex-row items-center mb-4 ml-10">
                    <Feather name="plus" size={16} color="#30AF5B" />
                    <Text className="text-hi-green font-bold text-sm ml-2">Add a stop</Text>
                  </TouchableOpacity>

                  {/* Destination */}
                  <View className="flex-row items-center relative z-10">
                    <View className="bg-hi-green w-8 h-8 rounded-full items-center justify-center shadow-md shadow-green-900/30 border-2 border-white">
                      <Ionicons name="location" size={14} color="white" />
                    </View>
                    <TextInput
                      value={destination}
                      onChangeText={setDestination}
                      placeholder="Destination (e.g., Manali)"
                      placeholderTextColor="#A2A2A2"
                      className="flex-1 ml-4 text-base font-bold text-hi-dark bg-white p-3.5 rounded-xl border border-hi-gray-10"
                    />
                  </View>
                </View>
              </View>

              {/* 2. Dates */}
              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Text className="text-hi-dark font-bold text-sm mb-3 ml-1">Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    className="flex-row items-center bg-hi-bg p-5 rounded-2xl border border-hi-gray-10"
                  >
                    <Feather name="calendar" size={18} color="#30AF5B" />
                    <Text className="ml-3 text-base font-bold text-hi-dark">
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartChange} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-hi-dark font-bold text-sm mb-3 ml-1">End Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    className="flex-row items-center bg-hi-bg p-5 rounded-2xl border border-hi-gray-10"
                  >
                    <Feather name="calendar" size={18} color="#30AF5B" />
                    <Text className="ml-3 text-base font-bold text-hi-dark">
                      {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker value={endDate} mode="date" display="default" onChange={onEndChange} minimumDate={startDate} />
                  )}
                </View>
              </View>

              {/* 3. Vibe Selector */}
              <View>
                <Text className="text-hi-dark font-bold text-sm mb-3 ml-1">Trip Vibe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row" style={{ gap: 10 }}>
                    {VIBES.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => setVibe(item)}
                        className={`px-5 py-3 rounded-full border ${vibe === item ? 'bg-hi-dark border-hi-dark' : 'bg-hi-bg border-hi-gray-10'}`}
                      >
                        <Text className={`font-bold ${vibe === item ? 'text-white' : 'text-hi-gray-30'}`}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* 4. Budget */}
              <View>
                <Text className="text-hi-dark font-bold text-sm mb-3 ml-1">Estimated Budget (Optional)</Text>
                <View className="flex-row items-center bg-hi-bg p-6 rounded-2xl border border-hi-gray-10">
                  <Text className="text-hi-gray-20 font-black text-3xl">₹</Text>
                  <TextInput
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="0"
                    placeholderTextColor="#EEEEEE"
                    keyboardType="numeric"
                    className="flex-1 ml-3 text-3xl font-black text-hi-green"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Publish Button */}
        <View className="absolute bottom-0 w-full p-6 bg-white border-t border-hi-gray-10 pb-10">
          <TouchableOpacity
            onPress={handleCreateTrip}
            disabled={loading}
            className="bg-hi-green rounded-full flex-row justify-center items-center shadow-lg shadow-green-900/30"
            style={{ paddingVertical: 18 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-black text-base tracking-wide mr-2">Publish Itinerary</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}