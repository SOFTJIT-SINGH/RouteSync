import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = ({ route }: any) => {
  const { matchId, buddyName } = route.params || { matchId: 'demo', buddyName: 'Buddy' };
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getUserId();
    fetchMessages();

    // --- REALTIME SUBSCRIPTION ---
    // This listens for new rows in the 'messages' table for this match
    const subscription = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [matchId]);

  const getUserId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const messageToSync = {
      match_id: matchId,
      sender_id: userId,
      content: newMessage.trim(),
    };

    const { error } = await supabase.from('messages').insert([messageToSync]);
    if (!error) setNewMessage('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. Use KeyboardAvoidingView as a wrapper for the WHOLE screen content after the header */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : -}
        style={{ flex: 1 }}
        // This offset is key. Adjust this number (e.g., 90 or 100) based on your header height
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Header */}
        <View className="flex-row items-center border-b border-rs-bg p-5">
          <Text className="text-xl font-bold text-rs-dark">{buddyName}</Text>
        </View>

        {/* 2. Messages List - Ensure it has flex-1 to shrink when keyboard opens */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              className={`m-2 max-w-[80%] rounded-2xl p-4 ${item.sender_id === userId ? 'self-end bg-rs-green' : 'self-start bg-rs-bg'}`}>
              <Text className={`${item.sender_id === userId ? 'text-white' : 'text-rs-dark'}`}>
                {item.content}
              </Text>
            </View>
          )}
        />

        {/* 3. Input Area */}
        <View className="flex-row items-center border-t border-rs-bg bg-white p-4">
          <TextInput
            placeholder="Type a message..."
            className="mr-3 flex-1 rounded-full bg-rs-bg p-4 text-rs-dark"
            value={newMessage}
            onChangeText={setNewMessage}
            // Important for UX
            multiline={false}
          />
          <TouchableOpacity onPress={sendMessage} className="rounded-full bg-rs-green p-4">
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
