import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Missing Info", "Please enter both email and password.");
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Login Failed", error.message);
  };

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          className="flex-1 px-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <View className="mb-14">
            <Text className="text-5xl font-black text-hi-dark tracking-tighter">
              Route<Text className="text-hi-green">Sync</Text>.
            </Text>
            <Text className="text-hi-gray-30 mt-3 text-lg font-medium">Find your tribe. Travel together.</Text>
          </View>

          <View style={{ gap: 20 }}>
            <View>
              <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2.5 ml-1">Email</Text>
              <View className="bg-white border border-hi-gray-10 rounded-2xl px-4 flex-row items-center">
                <Feather name="mail" size={18} color="#A2A2A2" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#A2A2A2"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 ml-3 py-4 text-base font-bold text-hi-dark"
                />
              </View>
            </View>

            <View>
              <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2.5 ml-1">Password</Text>
              <View className="bg-white border border-hi-gray-10 rounded-2xl px-4 flex-row items-center">
                <Feather name="lock" size={18} color="#A2A2A2" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#A2A2A2"
                  className="flex-1 ml-3 py-4 text-base font-bold text-hi-dark"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#A2A2A2" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="self-end">
              <Text className="text-hi-green font-bold text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-hi-green rounded-full items-center shadow-lg shadow-green-900/20"
              style={{ paddingVertical: 18 }}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-base tracking-wide">Login</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-10 items-center">
            <Text className="text-hi-gray-30">
              Don&apos;t have an account? <Text className="text-hi-green font-bold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}