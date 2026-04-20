import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

const calculateAge = (dobString: string) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

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
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const uploadImage = async (uri: string, userId: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      let finalAvatarUrl = avatarUrl;
      // Only upload if it's a local file URI
      if (avatarUrl.startsWith('file://')) {
        const uploaded = await uploadImage(avatarUrl, user.id);
        if (uploaded) finalAvatarUrl = uploaded;
      }

      const computedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: computedFullName,
        username: username,
        bio: bio,
        phone_number: phoneNumber,
        dob: dob || null,
        gender: gender,
        travel_style: travelStyle,
        age: age ? parseInt(age, 10) : null,
        avatar_url: finalAvatarUrl,
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

  const openAvatarPicker = async (isCamera: boolean) => {
    try {
      const { status } = isCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', `We need ${isCamera ? 'camera' : 'gallery'} access to change your photo.`);
        return;
      }

      const result = isCamera 
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-hi-bg justify-center items-center">
        <ActivityIndicator size="large" color="#30AF5B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center border-b border-hi-gray-10 bg-white z-10">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-hi-bg rounded-full border border-hi-gray-10">
            <Ionicons name="close" size={24} color="#292C27" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-hi-dark tracking-tight">Edit Profile</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* Avatar Edit Section */}
          <View className="items-center mt-8 mb-10">
            <View className="relative">
              <Image 
                source={{ uri: avatarUrl }} 
                className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-sm shadow-gray-200"
              />
              <TouchableOpacity
                onPress={async () => {
                  Alert.alert('Change Photo', 'Take a selfie or choose from gallery', [
                    { text: 'Take Photo', onPress: () => openAvatarPicker(true) },
                    { text: 'Choose from Gallery', onPress: () => openAvatarPicker(false) },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
                className="absolute bottom-0 right-0 bg-hi-green w-10 h-10 rounded-full items-center justify-center border-4 border-hi-bg shadow-sm"
              >
                <Feather name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm font-bold text-hi-green mt-4">Change Profile Photo</Text>
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
                <View className="relative">
                  <View className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-50 flex-row items-center">
                    <Feather name="calendar" size={18} color="#9CA3AF" />
                    <TextInput 
                      defaultValue={dob ? new Date(dob).toLocaleDateString('en-GB') : ''}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={(text: string) => {
                        if (text.length === 10) {
                          const parts = text.split('/');
                          if (parts.length === 3) {
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const year = parseInt(parts[2], 10);
                            const date = new Date(year, month, day);
                            if (!isNaN(date.getTime())) {
                              const dobStr = date.toISOString().split('T')[0];
                              setDob(dobStr);
                              setAge(calculateAge(dobStr));
                            }
                          }
                        }
                      }}
                      className="flex-1 ml-3 text-base font-bold text-gray-900"
                    />
                  </View>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className="absolute right-4 top-2 w-10 h-10 items-center justify-center"
                  >
                    <Feather name="edit-2" size={16} color="#30AF5B" />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={dob ? new Date(dob) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const dobStr = selectedDate.toISOString().split('T')[0];
                        setDob(dobStr);
                        setAge(calculateAge(dobStr));
                      }
                    }}
                  />
                )}
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
        <View className="absolute bottom-0 w-full p-5 bg-white border-t border-hi-gray-10">
          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            className="bg-hi-green py-4 rounded-full items-center shadow-lg shadow-green-900/20"
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