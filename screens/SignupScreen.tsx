import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const TRAVEL_STYLES = ['Backpacker', 'Luxury', 'Adventure', 'Chill', 'Road Trip', 'Solo'];

// 🛠️ FIX: Moved InputField OUTSIDE the main component so it doesn't unmount on every keystroke
const InputField = ({
  label, value, onChangeText, placeholder, icon, keyboardType, secureTextEntry, multiline, maxLength, autoCapitalize,
}: any) => (
  <View className="mb-5">
    <Text className="text-hi-gray-30 font-bold uppercase text-[10px] tracking-widest mb-2.5 ml-1">{label}</Text>
    <View className={`bg-hi-bg border border-hi-gray-10 rounded-2xl px-4 flex-row items-center ${multiline ? 'min-h-[100px] items-start pt-4' : 'py-0'}`}>
      {icon && (
        <Feather name={icon} size={18} color="#A2A2A2" style={multiline ? { marginTop: 2 } : {}} />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A2A2A2"
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize || 'sentences'}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`flex-1 text-base font-bold text-hi-dark ${icon ? 'ml-3' : ''} ${multiline ? 'pt-0 pb-4' : 'py-4'}`}
      />
    </View>
  </View>
);

// 🛠️ FIX: Moved ChipSelector OUTSIDE the main component as well
const ChipSelector = ({ label, options, selected, onSelect }: any) => (
  <View className="mb-5">
    <Text className="text-hi-gray-30 font-bold uppercase text-[10px] tracking-widest mb-2.5 ml-1">{label}</Text>
    <View className="flex-row flex-wrap gap-2.5">
      {options.map((option: string) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(selected === option ? '' : option)}
          className={`px-4 py-3 rounded-full border ${
            selected === option
              ? 'bg-hi-green border-hi-green'
              : 'bg-white border-hi-gray-10'
          }`}
        >
          <Text className={`font-bold text-sm ${selected === option ? 'text-white' : 'text-hi-gray-50'}`}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function SignupScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1 – Identity
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  // Step 2 – Personal Details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [travelStyle, setTravelStyle] = useState('');
  const [bio, setBio] = useState('');

  // Step 3 – Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateStep = () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Missing Info', 'First name and last name are required.');
        return false;
      }
    }
    if (step === 3) {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Missing Info', 'Email and password are required.');
        return false;
      }
      if (password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Mismatch', 'Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleSignup = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const computedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: computedFullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;

      // Insert the full profile row
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert([
          {
            id: authData.user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: computedFullName,
            username: username.trim() || null,
            phone_number: phoneNumber.trim() || null,
            dob: dob.trim() || null,
            gender: gender || null,
            age: age ? parseInt(age, 10) : null,
            travel_style: travelStyle || null,
            bio: bio.trim() || null,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=30AF5B&color=fff&size=200`,
          }
        ]);
        if (profileError) {
          console.warn('Profile insert warning:', profileError.message);
        }
      }

      navigation.navigate('OTP', { email });
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step Content ──
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text className="text-3xl font-black text-hi-dark tracking-tight mb-1">Who are you?</Text>
            <Text className="text-hi-gray-30 font-medium mb-8">Tell us a bit about yourself.</Text>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField label="First Name" value={firstName} onChangeText={setFirstName} placeholder="Priya" icon="user" />
              </View>
              <View className="flex-1">
                <InputField label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Patel" />
              </View>
            </View>
            <InputField label="Username" value={username} onChangeText={setUsername} placeholder="priya_travels" icon="at-sign" autoCapitalize="none" />
            <InputField label="Bio (optional)" value={bio} onChangeText={setBio} placeholder="Chasing sunsets and trying local street food..." icon="edit-3" multiline />
          </View>
        );

      case 2:
        return (
          <View>
            <Text className="text-3xl font-black text-hi-dark tracking-tight mb-1">Your Details</Text>
            <Text className="text-hi-gray-30 font-medium mb-8">Help us personalize your experience.</Text>

            <View className="flex-row gap-4">
              <View className="flex-[2]">
                <InputField label="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="+91 9876543210" icon="phone" keyboardType="phone-pad" />
              </View>
              <View className="flex-1">
                <InputField label="Age" value={age} onChangeText={setAge} placeholder="25" keyboardType="number-pad" maxLength={3} />
              </View>
            </View>
            <InputField label="Date of Birth" value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" icon="calendar" />
            <ChipSelector label="Gender" options={GENDERS} selected={gender} onSelect={setGender} />
            <ChipSelector label="Travel Style" options={TRAVEL_STYLES} selected={travelStyle} onSelect={setTravelStyle} />
          </View>
        );

      case 3:
        return (
          <View>
            <Text className="text-3xl font-black text-hi-dark tracking-tight mb-1">Almost there!</Text>
            <Text className="text-hi-gray-30 font-medium mb-8">Set up your login credentials.</Text>

            <InputField label="Email" value={email} onChangeText={setEmail} placeholder="priya@example.com" icon="mail" autoCapitalize="none" keyboardType="email-address" />
            <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Min. 6 characters" icon="lock" secureTextEntry />
            <InputField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" icon="lock" secureTextEntry />
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">

        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <TouchableOpacity onPress={handleBack} className="w-10 h-10 bg-hi-bg rounded-full items-center justify-center border border-hi-gray-10">
            <Ionicons name="arrow-back" size={22} color="#292C27" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${
                  i + 1 <= step ? 'bg-hi-green w-8' : 'bg-hi-gray-10 w-2'
                }`}
              />
            ))}
          </View>
          <Text className="text-hi-gray-20 font-bold text-sm">{step}/{totalSteps}</Text>
        </View>

        {/* Body */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-6 pb-6 pt-3 bg-white border-t border-hi-gray-10">
          {step < totalSteps ? (
            <TouchableOpacity
              onPress={handleNext}
              className="bg-hi-dark py-4.5 rounded-full items-center shadow-sm shadow-gray-900/10"
              style={{ paddingVertical: 18 }}
            >
              <Text className="text-white font-black text-base tracking-wide">Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className="bg-hi-green py-4.5 rounded-full items-center shadow-lg shadow-green-900/20"
              style={{ paddingVertical: 18 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-base tracking-wide">Create Account</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}