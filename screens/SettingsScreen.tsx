import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const SettingRow = ({ icon, label, value, onPress, isSwitch, switchValue, onToggle, iconColor }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isSwitch && !onPress}
    activeOpacity={0.7}
    className="flex-row items-center py-4 px-1"
  >
    <View className="w-10 h-10 bg-hi-bg rounded-xl items-center justify-center border border-hi-gray-10 mr-4">
      <Feather name={icon} size={18} color={iconColor || "#292C27"} />
    </View>
    <View className="flex-1">
      <Text className="text-hi-dark font-bold text-base">{label}</Text>
      {value && <Text className="text-hi-gray-20 text-sm font-medium mt-0.5">{value}</Text>}
    </View>
    {isSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onToggle}
        trackColor={{ false: '#EEEEEE', true: '#30AF5B' }}
        thumbColor="white"
      />
    ) : onPress ? (
      <Feather name="chevron-right" size={20} color="#EEEEEE" />
    ) : null}
  </TouchableOpacity>
);

type SettingsView = 'main' | 'security' | 'privacy' | 'terms' | 'policy';

export default function SettingsScreen({ navigation }: any) {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [profile, setProfile] = useState<any>(null);

  // Security state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedPush = await AsyncStorage.getItem('settings_push_notifs');
        const storedLocation = await AsyncStorage.getItem('settings_location_sharing');
        if (storedPush !== null) setPushNotifs(storedPush === 'true');
        if (storedLocation !== null) setLocationSharing(storedLocation === 'true');

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          setProfile({ ...data, email: user.email });
        }
      } catch (e) {
        console.warn('Error loading settings:', e);
      }
    };
    loadSettings();
  }, []);

  const togglePushNotifs = async (value: boolean) => {
    setPushNotifs(value);
    await AsyncStorage.setItem('settings_push_notifs', String(value));
  };

  const toggleLocationSharing = async (value: boolean) => {
    setLocationSharing(value);
    await AsyncStorage.setItem('settings_location_sharing', String(value));
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => await supabase.auth.signOut() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profiles').delete().eq('id', user.id);
                await supabase.auth.signOut();
              }
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert("Success", "Your password has been updated.");
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const appVersion = '1.0.0';

  // ── Sub-views ──

  const renderHeader = (title: string) => (
    <View className="px-6 pt-4 pb-4 flex-row items-center">
      <TouchableOpacity
        onPress={() => setCurrentView('main')}
        className="w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10 mr-4"
      >
        <Ionicons name="arrow-back" size={22} color="#292C27" />
      </TouchableOpacity>
      <Text className="text-xl font-black text-hi-dark tracking-tight">{title}</Text>
    </View>
  );

  if (currentView === 'security') {
    return (
      <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        {renderHeader('Account Security')}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Current Account */}
          <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1 mt-4">Current Account</Text>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-5 mb-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4 border border-blue-100">
                <Feather name="mail" size={16} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-hi-gray-30 uppercase tracking-widest mb-0.5">Email</Text>
                <Text className="text-base font-bold text-hi-dark">{profile?.email || 'Loading...'}</Text>
              </View>
            </View>
          </View>

          {/* Change Password */}
          <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Change Password</Text>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-5 mb-6" style={{ gap: 12 }}>
            <View className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 flex-row items-center">
              <Feather name="lock" size={18} color="#9CA3AF" />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password (min 6 characters)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="flex-1 ml-3 text-base font-bold text-hi-dark"
              />
            </View>
            <View className="bg-hi-bg p-4 rounded-2xl border border-hi-gray-10 flex-row items-center">
              <Feather name="lock" size={18} color="#9CA3AF" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="flex-1 ml-3 text-base font-bold text-hi-dark"
              />
            </View>
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={changingPassword}
              className="bg-hi-green py-4 rounded-full items-center mt-2"
            >
              {changingPassword ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-base">Update Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Active Sessions */}
          <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Security Tips</Text>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-5">
            <View className="flex-row items-start mb-4">
              <View className="bg-hi-green/10 p-2 rounded-xl mr-3">
                <Ionicons name="shield-checkmark" size={18} color="#30AF5B" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-hi-dark text-sm">Use a strong password</Text>
                <Text className="text-xs text-hi-gray-30 mt-1">Combine uppercase, lowercase, numbers, and special characters.</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <View className="bg-blue-50 p-2 rounded-xl mr-3">
                <Feather name="smartphone" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-hi-dark text-sm">Keep your email secure</Text>
                <Text className="text-xs text-hi-gray-30 mt-1">Your email is the key to password recovery. Keep it up to date.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'privacy') {
    return (
      <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        {renderHeader('Privacy & Visibility')}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1 mt-4">Profile Visibility</Text>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-5 mb-6" style={{ gap: 16 }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-hi-bg rounded-xl items-center justify-center border border-hi-gray-10 mr-4">
                  <Feather name="eye" size={18} color="#292C27" />
                </View>
                <View className="flex-1">
                  <Text className="text-hi-dark font-bold text-base">Public Profile</Text>
                  <Text className="text-hi-gray-20 text-sm font-medium mt-0.5">Other travelers can find and view your profile</Text>
                </View>
              </View>
              <Switch value={true} trackColor={{ false: '#EEE', true: '#30AF5B' }} thumbColor="white" />
            </View>
            <View className="h-px bg-hi-gray-10" />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-hi-bg rounded-xl items-center justify-center border border-hi-gray-10 mr-4">
                  <Feather name="map-pin" size={18} color="#292C27" />
                </View>
                <View className="flex-1">
                  <Text className="text-hi-dark font-bold text-base">Show Location</Text>
                  <Text className="text-hi-gray-20 text-sm font-medium mt-0.5">Display your general location on your profile</Text>
                </View>
              </View>
              <Switch value={locationSharing} onValueChange={toggleLocationSharing} trackColor={{ false: '#EEE', true: '#30AF5B' }} thumbColor="white" />
            </View>
          </View>

          <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Trip Privacy</Text>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-5 mb-6">
            <View className="flex-row items-start">
              <View className="bg-hi-green/10 p-2 rounded-xl mr-3 mt-0.5">
                <Feather name="globe" size={18} color="#30AF5B" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-hi-dark text-sm">Default Trip Visibility</Text>
                <Text className="text-xs text-hi-gray-30 mt-1 leading-relaxed">
                  When you create a new trip, you can set it as Public, Friends Only, or Private. You can change this per trip in the Create Trip screen.
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Data</Text>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-5">
            <View className="flex-row items-start mb-4">
              <View className="bg-blue-50 p-2 rounded-xl mr-3">
                <Feather name="database" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-hi-dark text-sm">Your Data</Text>
                <Text className="text-xs text-hi-gray-30 mt-1">We only store the information you provide. Your data is encrypted and stored securely on Supabase infrastructure.</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <View className="bg-red-50 p-2 rounded-xl mr-3">
                <Feather name="trash-2" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-hi-dark text-sm">Delete My Data</Text>
                <Text className="text-xs text-hi-gray-30 mt-1">You can delete your account and all associated data at any time from the bottom of this Settings page.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'terms') {
    return (
      <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        {renderHeader('Terms of Service')}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-6 mt-4">
            <Text className="text-lg font-black text-hi-dark mb-4">RouteSync Terms of Service</Text>
            <Text className="text-sm text-hi-gray-50 leading-relaxed mb-4">
              Last updated: April 2026
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">1. Acceptance of Terms</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              By downloading, installing, or using RouteSync, you agree to these Terms of Service. If you do not agree, do not use the application.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">2. User Accounts</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration and keep it updated.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">3. Acceptable Use</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              Users must not use RouteSync for illegal activities, harassment, or spam. All interactions should be respectful and in good faith. We reserve the right to suspend accounts that violate these guidelines.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">4. Travel Safety</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              RouteSync facilitates connections between travelers but does not guarantee the safety of any meetup or trip. Always meet in public places and verify travel companions before committing to shared travel plans.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">5. Content Policy</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              Users retain ownership of content they post. By posting, you grant RouteSync a non-exclusive license to display your content within the platform. We may remove content that violates community guidelines.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">6. Limitation of Liability</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed">
              RouteSync is provided "as is" without warranties. We are not liable for any damages arising from use of the platform, including but not limited to travel-related incidents.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'policy') {
    return (
      <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        {renderHeader('Privacy Policy')}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="bg-white rounded-3xl border border-hi-gray-10 p-6 mt-4">
            <Text className="text-lg font-black text-hi-dark mb-4">RouteSync Privacy Policy</Text>
            <Text className="text-sm text-hi-gray-50 leading-relaxed mb-4">
              Last updated: April 2026
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">Information We Collect</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              We collect information you provide during registration (name, email, profile details) and usage data to improve the app experience. We do not collect data from third-party sources.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">How We Use Your Data</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              Your data is used to provide and improve RouteSync services, match you with compatible travelers, enable community features, and send relevant notifications. We never sell your personal data to third parties.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">Data Storage & Security</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              All data is stored securely using Supabase infrastructure with encryption at rest and in transit. Access is restricted to authenticated users only through Row Level Security policies.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">Your Rights</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed mb-4">
              You can view, edit, or delete your personal data at any time through the app. You can request a full data export by contacting our support team. Account deletion permanently removes all your data.
            </Text>
            <Text className="text-sm font-bold text-hi-dark mb-2">Contact</Text>
            <Text className="text-sm text-hi-gray-30 leading-relaxed">
              For privacy-related inquiries, reach out to us at support@routesync.app
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main Settings View ──
  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View className="px-6 pt-4 pb-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10 mr-4"
        >
          <Ionicons name="arrow-back" size={22} color="#292C27" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-hi-dark tracking-tight">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Account Section */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1 mt-4">Account</Text>
        <View className="bg-white rounded-3xl border border-hi-gray-10 px-4 mb-6">
          <SettingRow icon="user" label="Edit Profile" onPress={() => navigation.navigate('MainApp', { screen: 'EditProfile' })} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="lock" label="Account Security" value="Password, sessions" onPress={() => setCurrentView('security')} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="shield" label="Privacy & Visibility" value="Profile, location, data" onPress={() => setCurrentView('privacy')} />
        </View>

        {/* Preferences */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Preferences</Text>
        <View className="bg-white rounded-3xl border border-hi-gray-10 px-4 mb-6">
          <SettingRow icon="bell" label="Push Notifications" isSwitch switchValue={pushNotifs} onToggle={togglePushNotifs} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="map-pin" label="Location Sharing" isSwitch switchValue={locationSharing} onToggle={toggleLocationSharing} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="globe" label="Language" value="English" />
        </View>

        {/* About */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">About</Text>
        <View className="bg-white rounded-3xl border border-hi-gray-10 px-4 mb-6">
          <SettingRow icon="info" label="App Version" value={`v${appVersion}`} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="file-text" label="Terms of Service" onPress={() => setCurrentView('terms')} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="book-open" label="Privacy Policy" onPress={() => setCurrentView('policy')} />
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white py-4 rounded-full flex-row justify-center items-center border border-hi-gray-10 mb-4"
        >
          <Feather name="log-out" size={18} color="#292C27" />
          <Text className="text-hi-dark font-bold text-base ml-2">Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="bg-white py-4 rounded-full flex-row justify-center items-center border border-red-200 mb-10"
        >
          <Feather name="trash-2" size={18} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
