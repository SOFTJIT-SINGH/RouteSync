import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ResetPasswordScreen({ navigation }: any) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      return Alert.alert("Missing Info", "Please enter and confirm your new password.");
    }
    /*
    if (password.length < 6) {
      return Alert.alert("Weak Password", "Password must be at least 6 characters.");
    }
    */
    if (password !== confirmPassword) {
      return Alert.alert("Mismatch", "Passwords do not match.");
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Your password has been updated. You can now log in with your new password.", [
        { text: "Go to Login", onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-8" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mb-10 w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10">
            <Ionicons name="close" size={22} color="#292C27" />
          </TouchableOpacity>

          <View className="mb-10">
            <Text className="text-4xl font-black text-hi-dark tracking-tighter">New Password</Text>
            <Text className="text-hi-gray-30 mt-2 text-base font-medium">Create a strong password to secure your account.</Text>
          </View>

          <View style={{ gap: 20 }}>
            <View>
              <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2.5 ml-1">New Password</Text>
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

            <View>
              <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2.5 ml-1">Confirm New Password</Text>
              <View className="bg-white border border-hi-gray-10 rounded-2xl px-4 flex-row items-center">
                <Feather name="lock" size={18} color="#A2A2A2" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#A2A2A2"
                  className="flex-1 ml-3 py-4 text-base font-bold text-hi-dark"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className="bg-hi-green rounded-full items-center mt-4 shadow-lg shadow-green-900/20"
              style={{ paddingVertical: 18 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-base tracking-wide">Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
