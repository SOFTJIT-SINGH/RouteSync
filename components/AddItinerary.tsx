import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const AddItinerary = () => {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [source, setSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const handleAddTrip = async () => {
    // 1. Basic Validation
    if (!destination || !source || !startDate || !budget) {
      Alert.alert('Missing Fields', 'Please fill in the destination, source, date, and budget.');
      return;
    }

    setLoading(true);

    try {
      // 2. Get Current User ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('You must be logged in to add a trip.');

      // 3. Insert into 'trips' table
      const { error } = await supabase
        .from('trips')
        .insert([
          {
            user_id: user.id,
            source: source,
            destination: destination,
            start_date: startDate, // Expected format: YYYY-MM-DD
            end_date: endDate || startDate,
            budget_min: parseFloat(budget),
            budget_max: parseFloat(budget),
            visibility: 'public'
          }
        ]);

      if (error) throw error;

      Alert.alert('Success!', 'Your journey has been synced to the community.');
      
      // 4. Clear Form
      setDestination('');
      setSource('');
      setStartDate('');
      setEndDate('');
      setBudget('');

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mt-10 bg-white p-8 rounded-5xl border border-rs-bg shadow-sm">
      <View className="flex-row items-center mb-6">
        <View className="bg-rs-bg p-3 rounded-2xl mr-4">
          <FontAwesome6 name="map-location-dot" size={24} color="#30AF5B" />
        </View>
        <Text className="text-2xl font-bold text-rs-dark">Add Itinerary</Text>
      </View>

      <View className="space-y-4">
        {/* Source & Destination */}
        <TextInput
          placeholder="From (e.g. Amritsar)"
          className="bg-rs-bg p-4 rounded-2xl text-rs-dark font-medium"
          value={source}
          onChangeText={setSource}
        />
        <TextInput
          placeholder="To (e.g. Manali)"
          className="bg-rs-bg p-4 rounded-2xl text-rs-dark font-medium mt-3"
          value={destination}
          onChangeText={setDestination}
        />

        {/* Date & Budget */}
        <View className="flex-row gap-3 mt-3">
          <TextInput
            placeholder="Date (YYYY-MM-DD)"
            className="flex-1 bg-rs-bg p-4 rounded-2xl text-rs-dark font-medium"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            placeholder="Budget (₹)"
            className="flex-1 bg-rs-bg p-4 rounded-2xl text-rs-dark font-medium"
            value={budget}
            keyboardType="numeric"
            onChangeText={setBudget}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleAddTrip}
          disabled={loading}
          className="bg-rs-green py-5 rounded-3xl mt-6 items-center shadow-lg shadow-green-900/20"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Post Sync Route</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddItinerary;