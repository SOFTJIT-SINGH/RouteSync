import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, Alert, ActivityIndicator, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const AuthScreen = ({ navigation }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    // Basic Logical Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Keyboard.dismiss(); // Closes keyboard to prevent UI lag
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Reset navigation so user can't go back to login
        navigation.replace('Home'); 
        
      } else {
        // --- SIGN UP LOGIC ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: 'New Traveler' } // Triggers your SQL Trigger
          }
        });
        if (error) throw error;

        Alert.alert('Success', 'Account created! Check your email if verification is enabled.');
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // FIX: Allows single-tap button clicks
        >
          
          {/* Header Section */}
          <View className="items-center mt-12 mb-10">
            <View className="bg-rs-bg p-6 rounded-2xl mb-4">
              <FontAwesome6 name="route" size={50} color="#30AF5B"/>
            </View>
            <Text className="text-3xl font-bold text-rs-dark">
              Route<Text className="text-rs-green">Sync</Text>
            </Text>
            <Text className="text-rs-gray mt-1">Sync journeys, find buddies.</Text>
          </View>

          {/* Form Section */}
          <View className="px-8 flex-1">
            <Text className="text-2xl font-bold text-rs-dark mb-6">
              {isLogin ? 'Welcome Back' : 'Join the Tribe'}
            </Text>

            <View className="bg-rs-bg flex-row items-center px-5 py-4 rounded-2xl mb-4 border border-rs-green/5">
              <Ionicons name="mail-outline" size={20} color="#7B7B7B" />
              <TextInput 
                placeholder="Email Address"
                className="flex-1 ml-3 text-rs-dark font-medium"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="bg-rs-bg flex-row items-center px-5 py-4 rounded-2xl mb-6 border border-rs-green/5">
              <Ionicons name="lock-closed-outline" size={20} color="#7B7B7B" />
              <TextInput 
                placeholder="Password"
                className="flex-1 ml-3 text-rs-dark font-medium"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              onPress={handleAuth} 
              disabled={loading}
              activeOpacity={0.8}
              className={`py-5 rounded-2xl items-center ${loading ? 'bg-rs-green/70' : 'bg-rs-green'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-xl">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsLogin(!isLogin)}
              className="mt-8 mb-10 items-center"
            >
              <Text className="text-rs-gray mt-2">
                {isLogin ? "Don't have an account? " : "Already a member? "}
                <Text className="text-rs-green font-bold">
                  {isLogin ? 'Sign Up' : 'Log In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;