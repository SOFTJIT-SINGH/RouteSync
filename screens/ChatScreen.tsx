import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, Image, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';

// Generate a unique ID without requiring crypto.randomUUID (which isn't available in all RN environments)
const generateId = () => {
  return 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
};

// Mock conversation fallback if DB isn't ready
// ];

export default function ChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [buddyProfile, setBuddyProfile] = useState<any>({ name: 'Travel Buddy' });
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [tripInfo, setTripInfo] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<any>(null);
  
  const buddyId = route?.params?.buddyId;
  const tripId = route?.params?.tripId;
  const isGroup = !!tripId && !buddyId;

  useEffect(() => {
    const setupChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      if (currentUserId) setUserId(currentUserId);

      const roomId = isGroup 
        ? `group_${tripId}`
        : (currentUserId && buddyId) ? [currentUserId, buddyId].sort().join('_') : 'default-room';

      if (isGroup && currentUserId) {
        // 1. Auto-join trip group
        await supabase.from('trip_members').upsert({ trip_id: tripId, user_id: currentUserId });
        
        // 2. Fetch Trip Info
        const { data: trip } = await supabase.from('trips').select('*').eq('id', tripId).single();
        setTripInfo(trip);

        // 3. Fetch Group Members
        const { data: members } = await supabase
          .from('trip_members')
          .select('profiles(id, first_name, full_name, avatar_url)')
          .eq('trip_id', tripId);
        
        if (members) {
          setGroupMembers(members.map((m: any) => m.profiles));
        }
      } else if (buddyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', buddyId)
          .single();
        if (profile) setBuddyProfile(profile);
      }

      // Fetch messages
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (first_name, full_name)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          text: m.text,
          senderId: m.sender_id,
          senderName: m.profiles?.first_name || m.profiles?.full_name || 'Traveler',
          sender: m.sender_id === currentUserId ? 'me' : 'them',
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }

      const channel = supabase.channel(`chat:${roomId}`);
      channelRef.current = channel;

      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, 
          async (payload: any) => {
            const newMsg = payload.new;
            if (newMsg.sender_id === currentUserId) return;
            
            // Fetch sender info for real-time msg
            const { data: sender } = await supabase.from('profiles').select('first_name, full_name').eq('id', newMsg.sender_id).single();

            setMessages(prev => [...prev, {
              id: newMsg.id,
              text: newMsg.text,
              senderId: newMsg.sender_id,
              senderName: sender?.first_name || 'Traveler',
              sender: 'them',
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
        )
        .on('broadcast', { event: 'typing' }, (payload: any) => {
          if (payload.payload.userId !== currentUserId) setIsTyping(payload.payload.isTyping);
        })
        .subscribe();
    };

    setupChat();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [buddyId, tripId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !userId) return;
    const messageText = inputText;
    const roomId = isGroup ? `group_${tripId}` : [userId, buddyId].sort().join('_');
    
    setMessages(prev => [...prev, {
      id: generateId(),
      text: messageText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
    Keyboard.dismiss();

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: userId,
      receiver_id: isGroup ? null : buddyId,
      text: messageText
    });
    
    if (error) console.error('DB Error:', error.message);
  };

  const SharedPostCard = ({ postId }: { postId: string }) => {
    const [post, setPost] = useState<any>(null);
    useEffect(() => {
      const fetchPost = async () => {
        const { data } = await supabase.from('posts').select('*, profiles(full_name, avatar_url)').eq('id', postId).single();
        if (data) setPost(data);
      };
      fetchPost();
    }, [postId]);

    if (!post) return <ActivityIndicator size="small" color="#30AF5B" />;

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('TripDetail', { tripId: post.id })} // Or a post detail screen
        className="bg-white rounded-2xl overflow-hidden border border-hi-gray-10 shadow-sm"
        style={{ width: 220 }}
      >
        <Image source={{ uri: post.image_url }} className="w-full h-28" />
        <View className="p-3">
           <Text className="text-[10px] font-black text-hi-green uppercase tracking-widest mb-1">{post.location}</Text>
           <Text className="text-xs font-bold text-hi-dark" numberOfLines={2}>{post.caption}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === 'me';
    const isSharedPost = item.text?.startsWith('shared_post:');
    const postId = isSharedPost ? item.text.split(':')[1] : null;

    return (
      <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        {!isMe && isGroup && (
          <Text className="text-[10px] font-bold text-gray-500 mb-1 ml-2">{item.senderName}</Text>
        )}
        <View 
          className={`overflow-hidden ${isSharedPost ? '' : (isMe ? 'bg-[#30AF5B] p-4 rounded-[24px] rounded-tr-sm' : 'bg-white p-4 border border-gray-100 rounded-[24px] rounded-tl-sm') }`}
          style={isSharedPost ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
        >
          {isSharedPost ? (
            <SharedPostCard postId={postId!} />
          ) : (
            <Text className={`text-[15px] font-medium leading-5 ${isMe ? 'text-white' : 'text-gray-800'}`}>
              {item.text}
            </Text>
          )}
        </View>
        <Text className={`text-[10px] font-bold mt-1.5 uppercase tracking-tighter ${isMe ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
          {item.time} {isMe && <Ionicons name="checkmark-done" size={10} color="#30AF5B" />}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-gray-100">
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2"><Ionicons name="chevron-back" size={28} color="#1F2937" /></TouchableOpacity>
            <View className="flex-row items-center">
              <View className="relative">
                {isGroup ? (
                  <View className="w-11 h-11 rounded-2xl bg-hi-green items-center justify-center">
                    <FontAwesome6 name="users-line" size={20} color="white" />
                  </View>
                ) : (
                  <Avatar uri={buddyProfile?.avatar_url} name={buddyProfile?.first_name || 'Traveler'} size={44} />
                )}
              </View>
              <View className="ml-3">
                <Text className="text-lg font-black text-gray-900 tracking-tight" numberOfLines={1}>
                  {isGroup ? `${tripInfo?.destination || 'Trip Group'}` : buddyProfile?.first_name || 'Traveler'}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xs font-bold text-[#30AF5B]">
                    {isGroup ? `${groupMembers.length} Members` : 'Online'}
                  </Text>
                  {isGroup && (
                    <View className="flex-row ml-2">
                      {groupMembers.slice(0, 3).map((m, i) => (
                        <Avatar key={m.id} uri={m.avatar_url} name={m.first_name || m.full_name} size={16} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25} className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="bg-white border-t border-gray-100 px-4 pt-4 flex-row items-end">
          <View className="flex-1 bg-[#F9FAFB] border border-gray-200 rounded-3xl px-4 py-2.5 flex-row items-end">
            <TextInput value={inputText} onChangeText={setInputText} placeholder="Message..." multiline className="flex-1 text-base font-medium text-gray-900 pt-1 pb-1" />
          </View>
          <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()} className={`w-11 h-11 rounded-full items-center justify-center mb-1 ml-3 ${inputText.trim() ? 'bg-[#30AF5B]' : 'bg-gray-200'}`}>
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}