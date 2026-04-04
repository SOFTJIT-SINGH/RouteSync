import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const SettingRow = ({ icon, label, value, onPress, isSwitch, switchValue, onToggle }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isSwitch}
    activeOpacity={0.7}
    className="flex-row items-center py-4 px-1"
  >
    <View className="w-10 h-10 bg-hi-bg rounded-xl items-center justify-center border border-hi-gray-10 mr-4">
      <Feather name={icon} size={18} color="#292C27" />
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
    ) : (
      <Feather name="chevron-right" size={20} color="#EEEEEE" />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: any) {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);

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
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("Contact Support", "Please email support@routesync.app to delete your account.") },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
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
          <SettingRow icon="user" label="Edit Profile" onPress={() => navigation.navigate('MainApp', { screen: 'RootTabs', params: { screen: 'Profile' } })} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="lock" label="Change Password" value="Last changed 30 days ago" />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="shield" label="Privacy" value="Public profile" />
        </View>

        {/* Preferences */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">Preferences</Text>
        <View className="bg-white rounded-3xl border border-hi-gray-10 px-4 mb-6">
          <SettingRow icon="bell" label="Push Notifications" isSwitch switchValue={pushNotifs} onToggle={setPushNotifs} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="map-pin" label="Location Sharing" isSwitch switchValue={locationSharing} onToggle={setLocationSharing} />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="globe" label="Language" value="English" />
        </View>

        {/* About */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">About</Text>
        <View className="bg-white rounded-3xl border border-hi-gray-10 px-4 mb-6">
          <SettingRow icon="info" label="App Version" value="1.0.0" />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="file-text" label="Terms of Service" />
          <View className="h-px bg-hi-gray-10" />
          <SettingRow icon="book-open" label="Privacy Policy" />
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
