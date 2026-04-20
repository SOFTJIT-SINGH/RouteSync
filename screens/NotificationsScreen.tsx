import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  read: boolean;
  created_at: string;
  metadata?: any;
};

const ICON_MAP: Record<string, string> = {
  sync: 'people',
  match: 'flame',
  trip: 'calendar',
  social: 'heart',
  system: 'notifications',
};

const COLOR_MAP: Record<string, string> = {
  sync: '#30AF5B',
  match: '#FF814C',
  trip: '#30AF5B',
  social: '#EF4444',
  system: '#6366F1',
};

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          icon: n.icon || ICON_MAP[n.type] || 'notifications',
          color: n.color || COLOR_MAP[n.type] || '#30AF5B',
          read: n.read,
          created_at: n.created_at,
          metadata: n.metadata,
        })));
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.log('Notifications fetch failed, table may not exist yet:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription for new notifications
    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const n = payload.new;
            setNotifications(prev => [{
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              icon: n.icon || ICON_MAP[n.type] || 'notifications',
              color: n.color || COLOR_MAP[n.type] || '#30AF5B',
              read: n.read,
              created_at: n.created_at,
              metadata: n.metadata,
            }, ...prev]);
          }
        )
        .subscribe();
    };
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    } catch (e) {
      console.warn('Failed to mark all read:', e);
    }
  };

  const markSingleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (e) {
      console.warn('Failed to mark read:', e);
    }
  };

  const handleNotificationPress = (notif: Notification) => {
    markSingleRead(notif.id);

    // Navigate based on type
    switch (notif.type) {
      case 'sync':
        navigation.navigate('Matches');
        break;
      case 'match':
        if (notif.metadata?.buddyId) {
          navigation.navigate('Chat', { buddyId: notif.metadata.buddyId });
        } else {
          navigation.navigate('Matches');
        }
        break;
      case 'trip':
        if (notif.metadata?.tripId) {
          navigation.navigate('Matches');
        }
        break;
      case 'social':
        navigation.navigate('Community');
        break;
      default:
        break;
    }
  };

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#30AF5B" />
        </View>
      </SafeAreaView>
    );
  }

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
        <View className="flex-row items-center">
          <Text className="text-xl font-black text-hi-dark tracking-tight">Notifications</Text>
          {unread.length > 0 && (
            <View className="ml-2 bg-hi-green px-2 py-0.5 rounded-full">
              <Text className="text-white font-black text-[10px]">{unread.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={markAllRead}
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-hi-gray-10"
        >
          <Feather name="check-circle" size={18} color="#30AF5B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30AF5B" />
        }
      >
        {notifications.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-5 border border-hi-gray-10">
              <Ionicons name="notifications-off-outline" size={36} color="#A2A2A2" />
            </View>
            <Text className="text-xl font-black text-hi-dark">All caught up!</Text>
            <Text className="text-hi-gray-30 font-medium text-center mt-2 max-w-[220px]">
              You're all set. We'll notify you when something interesting happens.
            </Text>
          </View>
        ) : (
          <>
            {/* Unread Section */}
            {unread.length > 0 && (
              <>
                <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-3 ml-1 mt-2">
                  New
                </Text>
                {unread.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    activeOpacity={0.8}
                    onPress={() => handleNotificationPress(notif)}
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
                      <Text className="text-hi-gray-30 text-sm font-medium mt-0.5" numberOfLines={2}>
                        {notif.message}
                      </Text>
                      <Text className="text-hi-gray-20 text-xs font-bold mt-1.5">
                        {getTimeAgo(notif.created_at)}
                      </Text>
                    </View>
                    <View className="w-2.5 h-2.5 bg-hi-green rounded-full ml-2" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Earlier Section */}
            {read.length > 0 && (
              <>
                <Text className="text-hi-gray-20 font-bold uppercase text-[10px] tracking-widest mb-3 ml-1 mt-6">
                  Earlier
                </Text>
                {read.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    activeOpacity={0.8}
                    onPress={() => handleNotificationPress(notif)}
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
                      <Text className="text-hi-gray-20 text-sm font-medium mt-0.5" numberOfLines={2}>
                        {notif.message}
                      </Text>
                      <Text className="text-hi-gray-20 text-xs font-bold mt-1.5">
                        {getTimeAgo(notif.created_at)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
