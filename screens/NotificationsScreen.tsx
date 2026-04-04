import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'sync',
    title: 'New Sync Request',
    message: 'Priya Patel wants to join your Manali trip!',
    time: '2 hours ago',
    read: false,
    icon: 'people',
    color: '#30AF5B',
  },
  {
    id: '2',
    type: 'match',
    title: 'New Match Found',
    message: 'You and Arjun share 92% travel compatibility.',
    time: '5 hours ago',
    read: false,
    icon: 'flame',
    color: '#FF814C',
  },
  {
    id: '3',
    type: 'trip',
    title: 'Trip Reminder',
    message: 'Your Kasol Valley trip starts in 3 days!',
    time: '1 day ago',
    read: true,
    icon: 'calendar',
    color: '#30AF5B',
  },
  {
    id: '4',
    type: 'social',
    title: 'Aisha liked your post',
    message: '"Finally made it to Spiti Valley..."',
    time: '2 days ago',
    read: true,
    icon: 'heart',
    color: '#EF4444',
  },
];

export default function NotificationsScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10"
        >
          <Ionicons name="arrow-back" size={22} color="#292C27" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-hi-dark tracking-tight">Notifications</Text>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10">
          <Feather name="check-circle" size={18} color="#30AF5B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Unread Section */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-3 ml-1 mt-2">New</Text>
        {MOCK_NOTIFICATIONS.filter(n => !n.read).map((notif) => (
          <TouchableOpacity
            key={notif.id}
            activeOpacity={0.8}
            className="bg-white p-4 rounded-2xl border border-hi-gray-10 shadow-sm shadow-gray-100 mb-3 flex-row items-center"
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: notif.color + '15' }}
            >
              <Ionicons name={notif.icon as any} size={22} color={notif.color} />
            </View>
            <View className="flex-1">
              <Text className="text-hi-dark font-bold text-base">{notif.title}</Text>
              <Text className="text-hi-gray-30 text-sm font-medium mt-0.5" numberOfLines={1}>{notif.message}</Text>
              <Text className="text-hi-gray-20 text-xs font-bold mt-1.5">{notif.time}</Text>
            </View>
            <View className="w-2.5 h-2.5 bg-hi-green rounded-full ml-2" />
          </TouchableOpacity>
        ))}

        {/* Earlier Section */}
        <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-3 ml-1 mt-6">Earlier</Text>
        {MOCK_NOTIFICATIONS.filter(n => n.read).map((notif) => (
          <TouchableOpacity
            key={notif.id}
            activeOpacity={0.8}
            className="bg-white/60 p-4 rounded-2xl border border-hi-gray-10 mb-3 flex-row items-center"
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: notif.color + '10' }}
            >
              <Ionicons name={notif.icon as any} size={22} color={notif.color + '80'} />
            </View>
            <View className="flex-1">
              <Text className="text-hi-gray-50 font-bold text-base">{notif.title}</Text>
              <Text className="text-hi-gray-20 text-sm font-medium mt-0.5" numberOfLines={1}>{notif.message}</Text>
              <Text className="text-hi-gray-20 text-xs font-bold mt-1.5">{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
