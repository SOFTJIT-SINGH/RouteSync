import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function SignupScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !fullName) return Alert.alert("Error", "All fields are required");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else navigation.navigate('OTP', { email });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-8">
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        
        <Text className="text-4xl font-black mt-8 text-gray-900">Create Account</Text>
        <Text className="text-gray-500 mt-2 mb-10">Start your journey with RouteSync.</Text>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Full Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="John Doe" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
          </View>
          <View>
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="john@example.com" autoCapitalize="none" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
          </View>
          <View>
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Password</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
          </View>

          <TouchableOpacity onPress={handleSignup} className="bg-[#30AF5B] py-5 rounded-3xl items-center mt-4 shadow-lg shadow-green-100">
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Sign Up</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}