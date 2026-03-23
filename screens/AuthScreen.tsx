import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [step, setStep] = useState(1); // Track signup progress
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [otp, setOtp] = useState('');

  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDate(selectedDate);
      setDob(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: `${firstName} ${lastName}` } }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            phone_number: phone,
            dob: dob,
            gender: gender,
            avatar_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=30AF5B&color=fff`
          }
        ]);
        if (profileError) throw profileError;
      }
      setMode('otp');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSignupSteps = () => {
    if (step === 1) {
      return (
        <View className="space-y-6">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest">Step 1: Your Identity</Text>
          <View>
            <Text className="text-gray-900 font-bold mb-2 ml-1">First Name</Text>
            <TextInput placeholder="Priya" value={firstName} onChangeText={setFirstName} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" />
          </View>
          <View>
            <Text className="text-gray-900 font-bold mb-2 ml-1">Last Name</Text>
            <TextInput placeholder="Patel" value={lastName} onChangeText={setLastName} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" />
          </View>
          <TouchableOpacity onPress={() => setStep(2)} className="bg-[#30AF5B] py-5 rounded-3xl items-center shadow-lg shadow-green-200">
            <Text className="text-white font-bold text-lg">Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (step === 2) {
      return (
        <View className="space-y-6">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest">Step 2: Essentials</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
             <Text className="text-gray-400">Date of Birth</Text>
             <Text className="text-lg font-bold text-gray-900 mt-1">{dob || "Select Date"}</Text>
          </TouchableOpacity>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" />
          <TouchableOpacity onPress={handleSignup} className="bg-[#30AF5B] py-5 rounded-3xl items-center shadow-lg shadow-green-200">
            <Text className="text-white font-bold text-lg">Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(1)} className="items-center"><Text className="text-gray-400 font-bold">Back</Text></TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }}>
          <View className="mb-12">
            <Text className="text-4xl font-black text-gray-900">Route<Text className="text-[#30AF5B]">Sync</Text></Text>
            <Text className="text-gray-500 mt-2 font-medium">Elevate your travel experience.</Text>
          </View>

          {mode === 'login' ? (
            <View className="space-y-6">
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" />
              <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" />
              <TouchableOpacity onPress={() => {}} className="bg-[#30AF5B] py-5 rounded-3xl items-center">
                <Text className="text-white font-bold text-lg">Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('signup')} className="items-center mt-4">
                <Text className="text-gray-500">New here? <Text className="text-[#30AF5B] font-bold">Join Now</Text></Text>
              </TouchableOpacity>
            </View>
          ) : renderSignupSteps()}
          
          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display="spinner" onChange={onDateChange} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}