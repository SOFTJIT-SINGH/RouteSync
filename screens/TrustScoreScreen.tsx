import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TrustScoreScreen({ navigation }: any) {
  const checkmarks = [
    { title: 'Upload Profile Photo', score: '+20%', icon: 'camera', color: '#6366F1' },
    { title: 'Write a Great Bio', score: '+20%', icon: 'edit-3', color: '#EC4899' },
    { title: 'Complete a Trip', score: '+15%', icon: 'map-pin', color: '#30AF5B' },
    { title: 'Identity Verification', score: '+25%', icon: 'shield', color: '#14B8A6' },
    { title: 'Connect with Buddies', score: '+10%', icon: 'users', color: '#F59E0B' },
    { title: 'Earn Badges', score: '+10%', icon: 'award', color: '#8B5CF6' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-gray-900 tracking-tight ml-4">Trust Score Guide</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <View className="px-6 py-8 items-center">
          <View className="w-32 h-32 bg-hi-green/10 rounded-full items-center justify-center mb-6 relative">
            <View className="absolute inset-0 rounded-full border-4 border-hi-green/20" />
            <Text className="text-4xl font-black text-hi-green">85%</Text>
            <View className="absolute -bottom-2 bg-hi-dark px-3 py-1 rounded-full">
                <Text className="text-[10px] font-black text-white uppercase">Average</Text>
            </View>
          </View>
          
          <Text className="text-2xl font-black text-gray-900 text-center">Your Trust Score Matters</Text>
          <Text className="text-gray-500 font-medium text-center mt-3 leading-relaxed">
            The Trust Score helps travel buddies feel safe and confident when planning trips with you. High scores lead to more successful matches!
          </Text>
        </View>

        {/* How to improve */}
        <View className="px-6 mt-4">
          <Text className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">How to Level Up</Text>
          
          {checkmarks.map((item, index) => (
            <View key={index} className="flex-row items-center bg-gray-50 p-5 rounded-3xl mb-4 border border-gray-100">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Feather name={item.icon as any} size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">{item.title}</Text>
                <Text className="text-xs font-black text-hi-green uppercase mt-1">Boosts score by {item.score}</Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color="#D1D5DB" />
            </View>
          ))}
        </View>

        {/* Tips Section */}
        <View className="mx-6 mt-8 p-6 bg-hi-dark rounded-4xl relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
          <Ionicons name="bulb" size={32} color="#30AF5B" className="mb-4" />
          <Text className="text-xl font-black text-white">Pro Tip</Text>
          <Text className="text-white/60 font-medium mt-2 leading-6">
            Travelers with a Trust Score above 80% get 3x more sync requests. Complete your profile today to stand out!
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile')}
            className="bg-hi-green mt-6 py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-black">Go to Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
