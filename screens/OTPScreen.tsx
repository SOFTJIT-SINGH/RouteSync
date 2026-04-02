import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
    // RootNavigator will automatically switch to MainStack upon successful session
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) Alert.alert("Error", error.message);
    else setTimer(60);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-8">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      <View className="mt-12">
        <Text className="text-4xl font-black text-gray-900">Verify It&apos;s You</Text>
        <Text className="text-gray-500 mt-2 leading-6">
          We sent a code to <Text className="font-bold text-gray-900">{email}</Text>. Enter it below to activate your account.
        </Text>
      </View>

      <View className="mt-12">
        <View className="flex-row justify-between pt-4 pb-4 px-2" onStartShouldSetResponder={() => true} onResponderRelease={() => inputRef.current?.focus()}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = otp[index] || '';
            const isActive = otp.length === index || (otp.length === 6 && index === 5);
            return (
               <View 
                  key={index} 
                  className={`w-12 h-14 rounded-2xl items-center justify-center border-2 ${isActive ? 'border-[#30AF5B] bg-green-50' : 'border-gray-100 bg-gray-50'}`}
               >
                 <Text className="text-2xl font-black text-gray-900">{digit}</Text>
               </View>
            );
          })}
          
          {/* Hidden true input mechanism overlay */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            keyboardType="number-pad"
            autoFocus={true}
            className="absolute opacity-0 w-full h-full"
            style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0 }}
          />
        </View>

        <TouchableOpacity 
          onPress={handleVerify}
          disabled={loading}
          className="bg-[#30AF5B] py-5 rounded-3xl items-center mt-10 shadow-lg shadow-green-100"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Finish</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} className="mt-8 items-center">
          <Text className="text-gray-400 font-medium">
            Didn&apos;t get it? <Text className={timer === 0 ? "text-[#30AF5B] font-bold" : "text-gray-300"}>
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}