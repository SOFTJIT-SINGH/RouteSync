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

export default function CreateTripScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // Trip State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [breaks, setBreaks] = useState<string[]>([]); // Array for dynamic stops
  const [budget, setBudget] = useState('');
  const [vibe, setVibe] = useState('Adventure'); // Premium extra feature
  const [loading, setLoading] = useState(false);

  // Date State
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Handlers for dynamic breaks (stops)
  const addBreak = () => setBreaks([...breaks, '']);
  const updateBreak = (text: string, index: number) => {
    const newBreaks = [...breaks];
    newBreaks[index] = text;
    setBreaks(newBreaks);
  };
  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  // Date Picker Handlers
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
        source: source,
        destination: destination,
        stops: breaks.filter(b => b.trim() !== ''), // Only save non-empty stops
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        budget: budget ? parseFloat(budget) : null,
        vibe: vibe // Save the travel style
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
          
          {/* Hero Header */}
          <View className="relative">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop' }} 
              className="w-full h-72 bg-gray-900"
              resizeMode="cover"
            />
            <View className="absolute w-full h-full bg-black/30" />
            
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ top: insets.top + 10, left: 24 }}
              className="absolute w-12 h-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md border border-white/20"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main Form Area */}
          <View className="bg-white rounded-t-[40px] -mt-12 px-6 pt-10 pb-40 border-t border-white shadow-2xl">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Route Builder
            </Text>
            <Text className="text-4xl font-black text-gray-900 tracking-tight mb-8">
              Map your journey.
            </Text>

            <View className="space-y-8">
              
              {/* 1. Dynamic Routing Timeline */}
              <View>
                <Text className="text-gray-900 font-bold text-sm mb-4 ml-1">The Route</Text>
                
                <View className="bg-[#F8FAFC] p-5 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-100 relative">
                  
                  {/* Visual Timeline Line */}
                  <View className="absolute left-[39px] top-12 bottom-12 w-0.5 border-l-2 border-dashed border-gray-300" />

                  {/* Start Point */}
                  <View className="flex-row items-center mb-4 relative z-10">
                    <View className="bg-white w-8 h-8 rounded-full items-center justify-center shadow-sm shadow-gray-200 border-2 border-gray-100">
                      <View className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
                    </View>
                    <TextInput 
                      value={source}
                      onChangeText={setSource}
                      placeholder="Start City (e.g., Delhi)"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-4 text-base font-bold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100"
                    />
                  </View>

                  {/* Dynamic Stops */}
                  {breaks.map((stop, index) => (
                    <View key={index} className="flex-row items-center mb-4 relative z-10">
                      <View className="bg-white w-8 h-8 rounded-full items-center justify-center shadow-sm border-2 border-gray-100">
                        <View className="w-2 h-2 bg-gray-400 rounded-full" />
                      </View>
                      <TextInput 
                        value={stop}
                        onChangeText={(text) => updateBreak(text, index)}
                        placeholder={`Stop ${index + 1}`}
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-4 text-base font-bold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100"
                      />
                      <TouchableOpacity onPress={() => removeBreak(index)} className="ml-3 p-2">
                        <Feather name="minus-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add Stop Button */}
                  <TouchableOpacity onPress={addBreak} className="flex-row items-center mb-4 ml-10">
                    <Feather name="plus" size={16} color="#30AF5B" />
                    <Text className="text-[#30AF5B] font-bold text-sm ml-2">Add a stop</Text>
                  </TouchableOpacity>

                  {/* Destination */}
                  <View className="flex-row items-center relative z-10">
                    <View className="bg-[#30AF5B] w-8 h-8 rounded-full items-center justify-center shadow-md shadow-green-900/30 border-2 border-white">
                      <Ionicons name="location" size={14} color="white" />
                    </View>
                    <TextInput 
                      value={destination}
                      onChangeText={setDestination}
                      placeholder="Destination (e.g., Manali)"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-4 text-base font-bold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100"
                    />
                  </View>
                </View>
              </View>

              {/* 2. Dates (Using Native Pickers) */}
              <View className="flex-row space-x-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Start Date</Text>
                  <TouchableOpacity 
                    onPress={() => setShowStartPicker(true)}
                    className="flex-row items-center bg-[#F8FAFC] p-5 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-100"
                  >
                    <Feather name="calendar" size={18} color="#30AF5B" />
                    <Text className="ml-3 text-base font-bold text-gray-900">
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartChange} />
                  )}
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">End Date</Text>
                  <TouchableOpacity 
                    onPress={() => setShowEndPicker(true)}
                    className="flex-row items-center bg-[#F8FAFC] p-5 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-100"
                  >
                    <Feather name="calendar" size={18} color="#30AF5B" />
                    <Text className="ml-3 text-base font-bold text-gray-900">
                      {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker value={endDate} mode="date" display="default" onChange={onEndChange} minimumDate={startDate} />
                  )}
                </View>
              </View>

              {/* 3. Travel Vibe Selector */}
              <View>
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Trip Vibe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {['Adventure', 'Roadtrip', 'Chill', 'Backpacking'].map((item) => (
                    <TouchableOpacity 
                      key={item}
                      onPress={() => setVibe(item)}
                      className={`px-5 py-3 rounded-full mr-3 border ${vibe === item ? 'bg-gray-900 border-gray-900' : 'bg-[#F8FAFC] border-gray-200'}`}
                    >
                      <Text className={`font-bold ${vibe === item ? 'text-white' : 'text-gray-500'}`}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 4. Estimated Budget */}
              <View>
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Estimated Budget (Optional)</Text>
                <View className="flex-row items-center bg-[#F8FAFC] p-6 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-100">
                  <Text className="text-gray-400 font-black text-3xl">₹</Text>
                  <TextInput 
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="numeric"
                    className="flex-1 ml-3 text-3xl font-black text-[#30AF5B]"
                  />
                </View>
              </View>

            </View>
          </View>
        </ScrollView>

        {/* Floating Publish Button */}
        <View className="absolute bottom-0 w-full p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-10">
          <TouchableOpacity 
            onPress={handleCreateTrip}
            disabled={loading}
            className="bg-[#30AF5B] py-5 rounded-[20px] flex-row justify-center items-center shadow-lg shadow-green-900/30"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-black text-lg tracking-wide mr-2">Publish Itinerary</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}