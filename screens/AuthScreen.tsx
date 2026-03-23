import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup' | 'otp' | 'forgot_password';

const AuthScreen = ({ navigation }: any) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); 
  const [passwordError, setPasswordError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => { setPasswordError(''); }, [mode]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigation.replace('HomeDashboard');
    };
    checkUser();
  }, []);

  const validatePassword = (pass: string) => {
    if (mode !== 'signup' || !pass) return setPasswordError('');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(pass)) {
      setPasswordError('Must be 8+ chars with Upper, Lower, Number, and Symbol.');
    } else {
      setPasswordError(''); 
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({ type: 'signup', email: email });
      if (error) throw error;
      setTimer(60); 
      Alert.alert('Sent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    Keyboard.dismiss();
    if (!email) return Alert.alert('Error', 'Email is required');

    if (mode === 'signup') {
      if (!fullName) return Alert.alert('Error', 'Full Name is required');
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return Alert.alert('Weak Password', 'Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character.');
      }
      if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigation.replace('HomeDashboard');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        Alert.alert('Verify Email', 'Check your inbox for the 8-digit code.');
        setMode('otp');
        setTimer(60);
      } else if (mode === 'otp') {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
        if (error) throw error;
        navigation.replace('HomeDashboard');
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        Alert.alert('Reset Sent', 'Check your email for the password reset link.');
        setMode('login');
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Premium Header */}
          <View className="mb-10 mt-12 items-center">
            <View className="mb-5 rounded-full bg-green-50 w-20 h-20 items-center justify-center">
              <FontAwesome6 name="route" size={36} color="#30AF5B" />
            </View>
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">Route<Text className="text-[#30AF5B]">Sync</Text></Text>
            <Text className="mt-2 text-base font-medium text-gray-500 text-center">
              {mode === 'login' && 'Log in to find your travel buddy.'}
              {mode === 'signup' && 'Create an account to start exploring.'}
              {mode === 'otp' && 'We sent a verification code to your email.'}
              {mode === 'forgot_password' && 'Enter your email to reset your password.'}
            </Text>
          </View>

          <View className="flex-1 w-full max-w-sm self-center">
            
            {mode === 'signup' && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Name</Text>
                <View className={`flex-row items-center rounded-2xl bg-gray-50 px-4 py-1 h-14 border ${focusedField === 'fullName' ? 'border-[#30AF5B] bg-green-50' : 'border-gray-200'}`}>
                  <Ionicons name="person" size={18} color={focusedField === 'fullName' ? '#30AF5B' : '#9CA3AF'} />
                  <TextInput
                    placeholder="e.g. Priya Patel"
                    placeholderTextColor="#D1D5DB"
                    className="ml-3 flex-1 text-base text-gray-900 font-medium"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</Text>
              <View className={`flex-row items-center rounded-2xl bg-gray-50 px-4 py-1 h-14 border ${focusedField === 'email' ? 'border-[#30AF5B] bg-green-50' : 'border-gray-200'}`}>
                <Ionicons name="mail" size={18} color={focusedField === 'email' ? '#30AF5B' : '#9CA3AF'} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#D1D5DB"
                  className="ml-3 flex-1 text-base text-gray-900 font-medium"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {(mode === 'login' || mode === 'signup') && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</Text>
                <View className={`flex-row items-center rounded-2xl bg-gray-50 px-4 py-1 h-14 border ${passwordError ? 'border-red-400 bg-red-50' : focusedField === 'password' ? 'border-[#30AF5B] bg-green-50' : 'border-gray-200'}`}>
                  <Ionicons name="lock-closed" size={18} color={passwordError ? '#EF4444' : focusedField === 'password' ? '#30AF5B' : '#9CA3AF'} />
                  <TextInput
                    placeholder="Min. 8 characters"
                    placeholderTextColor="#D1D5DB"
                    className="ml-3 flex-1 text-base text-gray-900 font-medium"
                    secureTextEntry
                    value={password}
                    onChangeText={(txt) => {
                      setPassword(txt);
                      if (passwordError) validatePassword(txt); 
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => { setFocusedField(null); validatePassword(password); }}
                  />
                </View>
                {passwordError ? <Text className="ml-2 mt-2 text-xs font-medium text-red-500">{passwordError}</Text> : null}
              </View>
            )}

            {mode === 'signup' && (
              <View className="mb-6">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Confirm Password</Text>
                <View className={`flex-row items-center rounded-2xl bg-gray-50 px-4 py-1 h-14 border ${focusedField === 'confirmPassword' ? 'border-[#30AF5B] bg-green-50' : 'border-gray-200'}`}>
                  <Ionicons name="shield-checkmark" size={18} color={focusedField === 'confirmPassword' ? '#30AF5B' : '#9CA3AF'} />
                  <TextInput
                    placeholder="Re-enter password"
                    placeholderTextColor="#D1D5DB"
                    className="ml-3 flex-1 text-base text-gray-900 font-medium"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}

            {mode === 'otp' && (
              <>
                <View className="mb-2">
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Verification Code</Text>
                  <View className={`flex-row items-center rounded-2xl bg-gray-50 px-4 py-1 h-14 border ${focusedField === 'otp' ? 'border-[#30AF5B] bg-green-50' : 'border-gray-200'}`}>
                    <Ionicons name="key" size={18} color={focusedField === 'otp' ? '#30AF5B' : '#9CA3AF'} />
                    <TextInput
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#D1D5DB"
                      className="ml-3 flex-1 text-base text-gray-900 font-medium tracking-widest"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="numeric"
                      onFocus={() => setFocusedField('otp')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0} className="mb-6 mt-2 self-end px-1">
                  <Text className={`font-semibold text-sm ${timer > 0 ? 'text-gray-400' : 'text-[#30AF5B]'}`}>
                    {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code?'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className={`items-center rounded-2xl py-4 shadow-sm mt-4 ${loading ? 'bg-green-400' : 'bg-[#30AF5B]'}`}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold text-white tracking-wide">
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'otp' ? 'Verify' : 'Reset Password'}
                </Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 mb-10 items-center">
              {mode === 'login' && (
                <TouchableOpacity onPress={() => setMode('forgot_password')} className="mb-6">
                  <Text className="font-bold text-[#30AF5B]">Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setPasswordError('');
              }}>
                <Text className="text-gray-500 font-medium">
                  {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
                  <Text className="font-bold text-[#30AF5B]">
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;