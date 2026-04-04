import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function OTPScreen({ route, navigation }: any) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) return Alert.alert("Invalid Code", "Please enter the full 6-digit code.");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });
    setLoading(false);
    if (error) Alert.alert("Verification Failed", error.message);
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) Alert.alert("Error", error.message);
    else setTimer(60);
  };

  return (
    <SafeAreaView className="flex-1 bg-hi-bg px-8" edges={['top']}>
      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10">
        <Ionicons name="arrow-back" size={22} color="#292C27" />
      </TouchableOpacity>

      <View className="mt-12">
        <Text className="text-3xl font-black text-hi-dark tracking-tight">Verify It&apos;s You</Text>
        <Text className="text-hi-gray-30 mt-2 leading-6 font-medium">
          We sent a 6-digit code to <Text className="font-bold text-hi-dark">{email}</Text>. Enter it below.
        </Text>
      </View>

      <View className="mt-12">
        <View
          className="flex-row justify-between pt-4 pb-4 px-1"
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = otp[index] || '';
            const isActive = otp.length === index || (otp.length === 6 && index === 5);
            return (
              <View
                key={index}
                className={`w-[48px] h-[56px] rounded-2xl items-center justify-center border-2 ${
                  isActive ? 'border-hi-green bg-hi-green/10' : digit ? 'border-hi-dark bg-white' : 'border-hi-gray-10 bg-white'
                }`}
              >
                <Text className="text-2xl font-black text-hi-dark">{digit}</Text>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            keyboardType="number-pad"
            autoFocus={true}
            style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0 }}
          />
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading}
          className="bg-hi-green rounded-full items-center mt-10 shadow-lg shadow-green-900/20"
          style={{ paddingVertical: 18 }}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-base tracking-wide">Verify & Finish</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} className="mt-8 items-center">
          <Text className="text-hi-gray-20 font-medium">
            Didn&apos;t get it?{' '}
            <Text className={timer === 0 ? "text-hi-green font-bold" : "text-hi-gray-10 font-bold"}>
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}