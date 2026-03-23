import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Login Failed", error.message);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-8">
      <View className="mt-20">
        <Text className="text-5xl font-black text-gray-900">Route<Text className="text-[#30AF5B]">Sync</Text>.</Text>
        <Text className="text-gray-500 mt-3 text-lg font-medium">Find your tribe. Travel together.</Text>
      </View>

      <View className="mt-16 space-y-6">
        <View>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Email</Text>
          <TextInput 
            value={email} 
            onChangeText={setEmail} 
            placeholder="name@example.com" 
            autoCapitalize="none"
            className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" 
          />
        </View>

        <View>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Password</Text>
          <TextInput 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholder="••••••••" 
            className="bg-gray-50 p-5 rounded-3xl border border-gray-100 text-lg" 
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          className="bg-[#30AF5B] py-5 rounded-3xl items-center mt-6 shadow-lg shadow-green-100"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-8 items-center">
          <Text className="text-gray-500">Don&apos;t have an account? <Text className="text-[#30AF5B] font-bold">Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}