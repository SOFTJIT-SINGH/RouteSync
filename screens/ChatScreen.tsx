import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ChatScreen({ route, navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const receiverId = route.params?.receiverId || 'placeholder-id';
  const receiverName = route.params?.receiverName || 'Travel Buddy';
  const receiverAvatar = route.params?.receiverAvatar || 'https://i.pravatar.cc/150';

  useEffect(() => {
    setupChat();
  }, []);

  const setupChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    await fetchMessages(user.id);
    subscribeToNewMessages(user.id);
  };

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
  };

  const subscribeToNewMessages = (userId: string) => {
    supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, (payload) => {
        if (payload.new.sender_id === receiverId) {
          setMessages((current) => [...current, payload.new]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
      })
      .subscribe();
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || !currentUserId || receiverId === 'placeholder-id') return;

    const messageText = inputText.trim();
    setInputText(''); 

    const tempMessage = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: receiverId,
      text: messageText,
      created_at: new Date().toISOString(),
    };
    
    setMessages((current) => [...current, tempMessage]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: currentUserId,
        receiver_id: receiverId,
        text: messageText
      }
    ]);

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: receiverAvatar }} 
          className="w-10 h-10 rounded-full border border-gray-200"
        />
        
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-900">{receiverName}</Text>
          <Text className="text-xs text-[#30AF5B] font-medium">Online</Text>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#30AF5B" className="mt-4" />
          ) : messages.length === 0 ? (
            <View className="items-center mt-10">
              <Text className="text-gray-400 text-sm">Send a message to start syncing!</Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              const date = new Date(msg.created_at);
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <View 
                  key={msg.id} 
                  className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}
                >
                  <View 
                    className={`p-4 rounded-3xl ${
                      isMe 
                        ? 'bg-[#30AF5B] rounded-tr-sm' 
                        : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {timeString}
                  </Text>
                </View>
              );
            })
          )}
          <View className="h-4" />
        </ScrollView>

        <View className="px-4 py-3 bg-white border-t border-gray-200 flex-row items-center pb-6">
          <TouchableOpacity className="p-2 mr-1">
            <FontAwesome name="plus" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <TextInput
              className="flex-1 text-base text-gray-900 max-h-24 pt-2 pb-2"
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
          </View>

          <TouchableOpacity 
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
            className={`ml-3 w-12 h-12 rounded-full items-center justify-center shadow-sm ${
              inputText.trim() === '' ? 'bg-gray-200' : 'bg-[#30AF5B]'
            }`}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={inputText.trim() === '' ? '#9CA3AF' : 'white'} 
              style={{ marginLeft: 4 }} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}