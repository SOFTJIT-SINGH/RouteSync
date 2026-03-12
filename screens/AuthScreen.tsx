import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
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

  // Clear password errors when switching modes
  useEffect(() => {
    setPasswordError('');
  }, [mode]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) navigation.replace('HomeDashboard');
    };
    checkUser();
  }, []);

  // Smarter validation: Only warns if they typed something invalid
  const validatePassword = (pass: string) => {
    if (mode !== 'signup') return; 

    // Don't show error if field is empty; let the submit button catch that
    if (!pass) {
      setPasswordError('');
      return;
    }

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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
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
        return Alert.alert(
          'Weak Password',
          'Password must be at least 8 characters long and include: \n• One uppercase letter \n• One lowercase letter \n• One number \n• One special character (@$!%*?&)'
        );
      }

      if (password !== confirmPassword) {
        return Alert.alert('Error', 'Passwords do not match');
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigation.replace('HomeDashboard');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        Alert.alert('Verify Email', 'Check your inbox for the 8-digit code.');
        setMode('otp');
        setTimer(60);
      } else if (mode === 'otp') {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'signup',
        });
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
    <SafeAreaView className="flex-1 bg-white px-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="mb-8 mt-8 items-center">
            <View className="mb-4 rounded-2xl bg-rs-bg p-5">
              <FontAwesome6 name="route" size={40} color="#30AF5B" />
            </View>
            <Text className="text-xl font-bold text-rs-dark tracking-wider">RouteSync</Text>
          </View>

          <View className="flex-1 px-4">
            <Text className="mb-6 text-2xl font-bold text-rs-dark">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'otp' && 'Verify Your Email'}
              {mode === 'forgot_password' && 'Forgot Password'}
            </Text>

            {mode === 'signup' && (
              <View
                className={`mb-4 flex-row items-center rounded-2xl bg-rs-bg px-5 py-4 border-2 ${
                  focusedField === 'fullName' ? 'border-rs-green' : 'border-rs-bg'
                }`}>
                <Ionicons name="person-outline" size={20} color={focusedField === 'fullName' ? '#30AF5B' : '#7B7B7B'} />
                <TextInput
                  placeholder="Full Name"
                  className="ml-3 flex-1 text-rs-dark"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            <View
              className={`mb-4 flex-row items-center rounded-2xl bg-rs-bg px-5 py-4 border-2 ${
                focusedField === 'email' ? 'border-rs-green' : 'border-rs-bg'
              }`}>
              <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? '#30AF5B' : '#7B7B7B'} />
              <TextInput
                placeholder="Email Address"
                className="ml-3 flex-1 text-rs-dark"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {(mode === 'login' || mode === 'signup') && (
              <View className="mb-4">
                <View
                  className={`flex-row items-center rounded-2xl bg-rs-bg px-5 py-4 border-2 ${
                    passwordError 
                      ? 'border-red-500' 
                      : focusedField === 'password' 
                        ? 'border-rs-green' 
                        : 'border-rs-bg'
                  }`}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordError ? '#EF4444' : focusedField === 'password' ? '#30AF5B' : '#7B7B7B'}
                  />
                  <TextInput
                    placeholder="Password"
                    className="ml-3 flex-1 text-rs-dark"
                    secureTextEntry
                    value={password}
                    onChangeText={(txt) => {
                      setPassword(txt);
                      // Only dynamically validate if they are actively fixing an existing error
                      if (passwordError) validatePassword(txt); 
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      setFocusedField(null);
                      validatePassword(password);
                    }}
                  />
                </View>

                {passwordError ? (
                  <Text className="ml-2 mt-1 text-xs font-medium text-red-500">
                    {passwordError}
                  </Text>
                ) : null}
              </View>
            )}

            {mode === 'signup' && (
              <View
                className={`mb-4 flex-row items-center rounded-2xl bg-rs-bg px-5 py-4 border-2 ${
                  focusedField === 'confirmPassword' ? 'border-rs-green' : 'border-rs-bg'
                }`}>
                <Ionicons name="shield-checkmark-outline" size={20} color={focusedField === 'confirmPassword' ? '#30AF5B' : '#7B7B7B'} />
                <TextInput
                  placeholder="Confirm Password"
                  className="ml-3 flex-1 text-rs-dark"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            {mode === 'otp' && (
              <>
                <View
                  className={`mb-2 flex-row items-center rounded-2xl bg-rs-bg px-5 py-4 border-2 ${
                    focusedField === 'otp' ? 'border-rs-green' : 'border-rs-bg'
                  }`}>
                  <Ionicons name="key-outline" size={20} color={focusedField === 'otp' ? '#30AF5B' : '#7B7B7B'} />
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    className="ml-3 flex-1 text-rs-dark"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={timer > 0}
                  className="mb-6 self-end px-2">
                  <Text className={`font-bold ${timer > 0 ? 'text-rs-gray' : 'text-rs-green'}`}>
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code?'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className="items-center rounded-3xl bg-rs-green py-5 shadow-md mt-2">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold uppercase text-white">
                  {mode.replace('_', ' ')}
                </Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 items-center">
              {mode === 'login' && (
                <TouchableOpacity onPress={() => setMode('forgot_password')}>
                  <Text className="mb-4 font-bold text-rs-green">Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                <Text className="text-rs-gray">
                  {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
                  <Text className="font-bold text-rs-green">
                    {mode === 'login' ? 'Sign Up' : 'Login'}
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