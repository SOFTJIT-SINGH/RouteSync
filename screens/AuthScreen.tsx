import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Log in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // 1. Sign up new user
        if (!fullName) {
          Alert.alert('Error', 'Please enter your full name for registration.');
          setLoading(false);
          return;
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // 2. Create their public profile in the database
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              full_name: fullName,
              // Generates a nice default avatar with their initials
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=30AF5B&color=fff`,
            }
          ]);
          if (profileError) throw profileError;
        }
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center px-6">
      <View className="mb-10">
        <Text className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">
          Route<Text className="text-[#30AF5B]">Sync</Text>
        </Text>
        <Text className="text-lg text-gray-500 font-medium">
          {isLogin ? 'Welcome back, traveler.' : 'Start your journey with us.'}
        </Text>
      </View>

      <View className="space-y-4">
        {!isLogin && (
          <View className="bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm mb-4">
            <TextInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              className="h-12 text-base text-gray-900"
            />
          </View>
        )}

        <View className="bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm mb-4">
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="h-12 text-base text-gray-900"
          />
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm mb-6">
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="h-12 text-base text-gray-900"
          />
        </View>

        <TouchableOpacity 
          onPress={handleAuth} 
          disabled={loading}
          className={`py-4 rounded-2xl items-center shadow-sm ${loading ? 'bg-green-300' : 'bg-[#30AF5B]'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isLogin ? 'Log In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsLogin(!isLogin)} 
          className="mt-6 items-center p-2"
        >
          <Text className="text-gray-600 font-medium text-base">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text className="text-[#30AF5B] font-bold">
              {isLogin ? 'Sign Up' : 'Log In'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}