import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';

const AddItinerary = () => {
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('');
  const [source, setSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [budget, setBudget] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7, // Compress for faster upload
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddTrip = async () => {
    if (!destination || !source || !startDate || !budget) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return Alert.alert('Missing Fields', 'Please fill in all core details.');
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');

      // Note: If you have Supabase Storage setup, you would upload the imageUri here first
      // and retrieve the public URL to save in the trips table.

      const { error } = await supabase.from('trips').insert([{
        user_id: user.id,
        source,
        destination,
        start_date: startDate,
        budget_min: parseFloat(budget),
        visibility: 'public',
        // image_url: uploadedImageUrl (Implementation required in Supabase Storage)
      }]);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'Your journey has been synced to the community.');
      
      setDestination(''); setSource(''); setStartDate(''); setBudget(''); setImageUri(null);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mt-10 bg-white p-6 rounded-3xl border border-rs-bg shadow-sm">
      <View className="flex-row items-center mb-6">
        <View className="bg-rs-bg p-3 rounded-2xl mr-4">
          <FontAwesome6 name="map-location-dot" size={20} color="#30AF5B" />
        </View>
        <Text className="text-xl font-bold text-rs-dark">Sync New Journey</Text>
      </View>

      <View className="space-y-4">
        {/* Native Image Picker */}
        <TouchableOpacity 
          onPress={pickImage}
          className="h-32 bg-rs-bg rounded-2xl border-2 border-dashed border-rs-green/30 items-center justify-center overflow-hidden mb-4"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" />
          ) : (
            <>
              <Ionicons name="image-outline" size={32} color="#7B7B7B" />
              <Text className="text-rs-gray font-medium mt-2">Add Cover Photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TextInput placeholder="From" className="bg-rs-bg p-4 rounded-xl text-rs-dark font-medium mb-3" value={source} onChangeText={setSource} />
        <TextInput placeholder="To" className="bg-rs-bg p-4 rounded-xl text-rs-dark font-medium mb-3" value={destination} onChangeText={setDestination} />

        <View className="flex-row gap-3">
          <TextInput placeholder="Date (YYYY-MM-DD)" className="flex-1 bg-rs-bg p-4 rounded-xl text-rs-dark font-medium" value={startDate} onChangeText={setStartDate} />
          <TextInput placeholder="Budget (₹)" className="flex-1 bg-rs-bg p-4 rounded-xl text-rs-dark font-medium" value={budget} keyboardType="numeric" onChangeText={setBudget} />
        </View>

        <TouchableOpacity 
          onPress={handleAddTrip} disabled={loading}
          className="bg-rs-green py-4 rounded-2xl mt-6 items-center shadow-lg"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Post Sync Route</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddItinerary;