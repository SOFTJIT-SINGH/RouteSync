import React, { useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, Image, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

// Mock conversation data
const INITIAL_MESSAGES = [
  { id: '1', text: "Hey! Saw you're also heading to Manali next month.", sender: 'them', time: '10:42 AM' },
  { id: '2', text: "Hey Priya! Yes, planning to do the Rohtang Pass trek. Are you driving up from Chandigarh?", sender: 'me', time: '10:45 AM' },
  { id: '3', text: "Exactly! I have space in my SUV if you want to split gas. We are a group of 2 right now.", sender: 'them', time: '10:47 AM' },
  { id: '4', text: "That sounds perfect! Let's connect this weekend to plan the itinerary. 🏔️", sender: 'me', time: '10:50 AM' },
];

export default function ChatScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Auto-scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === 'me';

    return (
      <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View 
          className={`p-4 ${
            isMe 
              ? 'bg-[#30AF5B] rounded-[24px] rounded-tr-sm' // Green bubble with sharp top-right corner
              : 'bg-white border border-gray-100 shadow-sm shadow-gray-100 rounded-[24px] rounded-tl-sm' // White bubble with sharp top-left corner
          }`}
        >
          <Text className={`text-base font-medium leading-relaxed ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {item.text}
          </Text>
        </View>
        <Text className={`text-[10px] font-bold text-gray-400 mt-1.5 ${isMe ? 'self-end mr-1' : 'self-start ml-1'}`}>
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-hi-bg">
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Sticky Header */}
      <View 
        style={{ paddingTop: insets.top }} 
        className="bg-white border-b border-hi-gray-10 z-10 shadow-sm shadow-gray-100/50"
      >
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center mr-2"
            >
              <Ionicons name="chevron-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            {/* Buddy Info */}
            <TouchableOpacity className="flex-row items-center">
              <View className="relative">
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }} 
                  className="w-11 h-11 rounded-full bg-gray-200"
                />
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </View>
              <View className="ml-3">
                <Text className="text-lg font-black text-gray-900 tracking-tight">Priya Patel</Text>
                <Text className="text-xs font-bold text-[#30AF5B]">Online</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Icons */}
          <View className="flex-row items-center gap-1">
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-50">
              <Ionicons name="call" size={20} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-50">
              <Ionicons name="ellipsis-vertical" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Chat Feed & Keyboard Handling */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}
          // Center date pill
          ListHeaderComponent={() => (
            <View className="items-center mb-6">
              <View className="bg-gray-200/50 px-3 py-1 rounded-full">
                <Text className="text-xs font-bold text-gray-500">Today</Text>
              </View>
            </View>
          )}
        />

        {/* 3. Input Area */}
        <View 
          style={{ paddingBottom: Math.max(insets.bottom, 16) }} 
          className="bg-white border-t border-gray-100 px-4 pt-4 flex-row items-end"
        >
          {/* Attachment Button */}
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 mb-1 mr-2">
            <Feather name="plus" size={22} color="#6B7280" />
          </TouchableOpacity>

          {/* Text Input Pill */}
          <View className="flex-1 bg-[#F8FAFC] border border-gray-100 rounded-[24px] px-4 py-2.5 min-h-[44px] max-h-[120px] justify-center flex-row items-end">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              className="flex-1 text-base font-medium text-gray-900 pt-1 pb-1"
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={inputText.trim().length === 0}
            className={`w-11 h-11 rounded-full items-center justify-center mb-0.5 ml-2 transition-all ${
              inputText.trim().length > 0 ? 'bg-[#30AF5B] shadow-sm shadow-green-900/20' : 'bg-gray-100'
            }`}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={inputText.trim().length > 0 ? 'white' : '#9CA3AF'} 
              style={{ marginLeft: 2 }} // Visually centers the send icon
            />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}