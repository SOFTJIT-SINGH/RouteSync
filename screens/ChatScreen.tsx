import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Image, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Mock conversation fallback if DB isn't ready
const INITIAL_MESSAGES = [
  { id: '1', text: "Hey! Saw you're also heading to Manali next month.", sender: 'them', time: '10:42 AM' },
  { id: '2', text: "Hey Priya! Yes, planning to do the Rohtang Pass trek. Are you driving up from Chandigarh?", sender: 'me', time: '10:45 AM' },
  { id: '3', text: "Exactly! I have space in my SUV if you want to split gas. We are a group of 2 right now.", sender: 'them', time: '10:47 AM' },
  { id: '4', text: "That sounds perfect! Let's connect this weekend to plan the itinerary. 🏔️", sender: 'me', time: '10:50 AM' },
];

export default function ChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [buddyProfile, setBuddyProfile] = useState<any>({
    name: 'Travel Buddy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
  });
  const flatListRef = useRef<FlatList>(null);
  
  // Create a unique, symmetric room ID between the two users
  const buddyId = route?.params?.buddyId;
  const [chatRoomId, setChatRoomId] = useState<string>('default-room');

  useEffect(() => {
    let channel: any;

    const setupChat = async () => {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      if (currentUserId) setUserId(currentUserId);

      // Generate symmetric chat room ID
      if (currentUserId && buddyId) {
        const generatedRoomId = [currentUserId, buddyId].sort().join('_');
        setChatRoomId(generatedRoomId);
      }

      // Fetch Buddy Profile
      if (buddyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, first_name, username, avatar_url')
          .eq('id', buddyId)
          .single();
        if (profile) {
          setBuddyProfile({
            name: profile.first_name || profile.full_name || profile.username || 'Travel Buddy',
            avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
          });
        }
      }

      // 2. Fetch existing messages from Supabase (graceful fallback if table missing)
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', chatRoomId)
          .order('created_at', { ascending: true });
          
        if (!error && data && data.length > 0) {
          const formatted = data.map(m => ({
            id: m.id,
            text: m.text,
            sender: m.sender_id === user?.id ? 'me' : 'them',
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formatted);
        }
      } catch (e) {
        console.log('Using mock messages. To persist, create a "messages" table in Supabase.');
      }

      // 3. Subscribe to Real-time Changes & Presence & Broadcast (Typing indicator)
      channel = supabase.channel(`chat:${chatRoomId}`);

      channel
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${chatRoomId}` }, 
          (payload: any) => {
            const newMsg = payload.new;
            // Ignore if we sent it (we add locally instantly for optimistic UI)
            if (newMsg.sender_id === user?.id) return;
            
            setMessages(prev => [...prev, {
              id: newMsg.id,
              text: newMsg.text,
              sender: 'them',
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
        )
        .on(
          'broadcast',
          { event: 'typing' },
          (payload: any) => {
            if (payload.payload.userId !== user?.id) {
              setIsTyping(payload.payload.isTyping);
            }
          }
        )
        .on(
          'presence',
          { event: 'sync' },
          () => {
            const state = channel.presenceState();
            // Check if anyone else is in the room
            const othersOnline = Object.keys(state).length > 1; // 1 is us
            setIsOnline(othersOnline);
          }
        )
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString(), user_id: user?.id });
          }
        });
    };

    setupChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  // Handle typing indicator broadcast
  useEffect(() => {
    const channel = supabase.channel(`chat:${chatRoomId}`);
    const typingTimeout = setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: false },
      });
    }, 1500);

    if (inputText.length > 0) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: true },
      });
    }

    return () => clearTimeout(typingTimeout);
  }, [inputText]);

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;
    
    const messageText = inputText;
    const optimisticId = Date.now().toString();
    
    // Optimistic insert
    const newMessage = {
      id: optimisticId,
      text: messageText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    Keyboard.dismiss();
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Save to DB
    if (userId) {
      await supabase.from('messages').insert({
        id: optimisticId, // We can reuse the optimistic ID
        room_id: chatRoomId,
        sender_id: userId,
        text: messageText
      });
    }
  };

// Note: Completely avoiding NativeWind `shadow-*` classes to prevent the "fake navigation crash" bug.
  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === 'me';
    const messageStatus = isOnline ? 'read' : 'sent';

    return (
      <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View 
          className={`p-4 ${
            isMe 
              ? 'bg-[#30AF5B] rounded-[24px] rounded-tr-sm'
              : 'bg-white border border-gray-100 rounded-[24px] rounded-tl-sm' 
          }`}
          style={{ shadowColor: isMe ? '#14532B' : '#9CA3AF', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }}
        >
          <Text className={`text-base font-medium leading-relaxed ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {item.text}
          </Text>
        </View>
        <View className={`flex-row items-center mt-1.5 ${isMe ? 'self-end mr-1' : 'self-start ml-1'}`}>
          <Text className="text-[10px] font-bold text-gray-400 mr-1.5">
            {item.time}
          </Text>
          {isMe && (
            <Ionicons 
              name={messageStatus === 'read' ? "checkmark-done" : "checkmark"} 
              size={12} 
              color={messageStatus === 'read' ? "#30AF5B" : "#9CA3AF"} 
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Sticky Header */}
      <View 
        style={{ paddingTop: insets.top, shadowColor: '#9CA3AF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }} 
        className="bg-white border-b border-gray-100 z-10"
      >
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center mr-2"
            >
              <Ionicons name="chevron-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center active:opacity-75"
              onPress={() => navigation.navigate('UserProfile', { userId: buddyId, profile: buddyProfile })}
            >
              <View className="relative">
                <Image 
                  source={{ uri: buddyProfile.avatar }} 
                  className="w-11 h-11 rounded-full bg-gray-200"
                />
                <View className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              </View>
              <View className="ml-3">
                <Text className="text-lg font-black text-gray-900 tracking-tight">{buddyProfile.name}</Text>
                <Text className={`text-xs font-bold ${isOnline ? 'text-[#30AF5B]' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 border border-gray-100">
              <Ionicons name="call" size={18} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 border border-gray-100">
              <Ionicons name="videocam" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Chat Feed */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}
          ListHeaderComponent={() => (
            <View className="items-center mb-6 mt-2">
              <View className="bg-gray-200/50 px-4 py-1.5 rounded-full border border-gray-200">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today</Text>
              </View>
              <Text className="text-xs text-gray-400 font-medium mt-4 text-center px-10 leading-relaxed">
                Messages are end-to-end encrypted. No one outside of this chat can read them.
              </Text>
            </View>
          )}
          ListFooterComponent={() => (
            isTyping ? (
              <View className="self-start bg-gray-100 px-4 py-3 rounded-full rounded-tl-sm mt-2 ml-1">
                <Text className="text-xs font-bold text-gray-500 tracking-widest">typing...</Text>
              </View>
            ) : <View style={{height: 10}}/>
          )}
        />

        {/* 3. Input Area */}
        <View 
          style={{ paddingBottom: Math.max(insets.bottom, 16) }} 
          className="bg-white border-t border-gray-100 px-4 pt-4 flex-row items-end"
        >
          <TouchableOpacity className="w-11 h-11 rounded-full items-center justify-center bg-[#F3F4F6] mb-1 mr-3 border border-gray-200">
            <Feather name="plus" size={22} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 bg-[#F9FAFB] border border-gray-200 rounded-3xl px-4 py-2.5 min-h-[46px] max-h-[120px] justify-center flex-row items-end overflow-hidden focus:border-[#30AF5B]">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              multiline
              className="flex-1 text-base font-medium text-gray-900 pt-1 pb-1"
            />
            <TouchableOpacity className="ml-2 mb-1 p-1">
              <Ionicons name="happy-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={sendMessage}
            disabled={inputText.trim().length === 0}
            className={`w-11 h-11 rounded-full items-center justify-center mb-1 ml-3 transition-colors ${
              inputText.trim().length > 0 ? 'bg-[#30AF5B]' : 'bg-gray-200'
            }`}
            style={inputText.trim().length > 0 ? { shadowColor: '#14532B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 } : undefined}
          >
            <Ionicons 
              name={inputText.trim().length > 0 ? "send" : "mic"} 
              size={18} 
              color={inputText.trim().length > 0 ? 'white' : '#6B7280'} 
              style={{ marginLeft: inputText.trim().length > 0 ? 2 : 0 }} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}