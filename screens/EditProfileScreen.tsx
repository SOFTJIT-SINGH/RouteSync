import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [travelStyle, setTravelStyle] = useState('');
  const [age, setAge] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://i.pravatar.cc/150');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        // fallback if full_name exists but first/last don't
        if (!data.first_name && !data.last_name && data.full_name) {
           const parts = data.full_name.split(' ');
           setFirstName(parts[0] || '');
           setLastName(parts.slice(1).join(' ') || '');
        }
        setUsername(data.username || '');
        setBio(data.bio || '');
        setPhoneNumber(data.phone_number || '');
        setDob(data.dob || '');
        setGender(data.gender || '');
        setTravelStyle(data.travel_style || '');
        setAge(data.age ? String(data.age) : '');
        setAvatarUrl(data.avatar_url || 'https://i.pravatar.cc/150');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const computedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: computedFullName,
        username: username,
        bio: bio,
        phone_number: phoneNumber,
        dob: dob,
        gender: gender,
        travel_style: travelStyle,
        age: age ? parseInt(age, 10) : null,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert("Success", "Your profile has been updated!", [
        { text: "Awesome", onPress: () => navigation.goBack() }
      ]);
      
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center">
        <ActivityIndicator size="large" color="#30AF5B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center border-b border-gray-100 bg-white z-10">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-gray-900 tracking-tight">Edit Profile</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* Avatar Edit Section */}
          <View className="items-center mt-8 mb-10">
            <View className="relative">
              <Image 
                source={{ uri: avatarUrl }} 
                className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-sm shadow-gray-200"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 bg-[#30AF5B] w-10 h-10 rounded-full items-center justify-center border-4 border-[#FAFAFA] shadow-sm">
                <Feather name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm font-bold text-[#30AF5B] mt-4">Change Profile Photo</Text>
          </View>

          {/* Form Fields */}
          <View className="px-5 space-y-6 pb-32">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">First Name</Text>
                <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                  <Feather name="user" size={18} color="#9CA3AF" />
                  <TextInput 
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Priya"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3 text-base font-bold text-gray-900"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Last Name</Text>
                <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                  <TextInput 
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Patel"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base font-bold text-gray-900"
                  />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Username</Text>
              <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                <Feather name="at-sign" size={18} color="#9CA3AF" />
                <TextInput 
                  value={username}
                  onChangeText={setUsername}
                  placeholder="traveler123"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base font-bold text-gray-900"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-[2]">
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Phone Number</Text>
                <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                  <Feather name="phone" size={18} color="#9CA3AF" />
                  <TextInput 
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="+91 9876543210"
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3 text-base font-bold text-gray-900"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Age</Text>
                <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                  <TextInput 
                    value={age}
                    onChangeText={setAge}
                    placeholder="25"
                    keyboardType="number-pad"
                    maxLength={3}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-center text-base font-bold text-gray-900"
                  />
                </View>
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Date of Birth</Text>
                <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                  <Feather name="calendar" size={18} color="#9CA3AF" />
                  <TextInput 
                    value={dob}
                    onChangeText={setDob}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3 text-base font-bold text-gray-900"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Gender</Text>
                <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                  <TextInput 
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Male / Female"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base font-bold text-gray-900"
                  />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">Travel Style</Text>
              <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                <Feather name="briefcase" size={18} color="#9CA3AF" />
                <TextInput 
                  value={travelStyle}
                  onChangeText={setTravelStyle}
                  placeholder="Backpacker, Luxury, Adventure..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base font-bold text-gray-900"
                />
              </View>
            </View>

            {/* Bio (Multiline) */}
            <View>
              <Text className="text-gray-900 font-bold text-sm mb-3 ml-1">About Me</Text>
              <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 min-h-[120px]">
                <TextInput 
                  value={bio}
                  onChangeText={setBio}
                  placeholder="I love chasing sunsets and trying local street food..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  className="flex-1 text-base font-medium text-gray-900 leading-relaxed pt-1"
                />
              </View>
            </View>

          </View>
        </ScrollView>

        {/* Sticky Save Button */}
        <View className="absolute bottom-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-gray-100">
          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            className="bg-[#30AF5B] py-4 rounded-[20px] items-center shadow-lg shadow-green-900/20"
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-lg tracking-wide">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}