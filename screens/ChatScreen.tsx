import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function ChatScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  
  const [messages, setMessages] = useState([
    { id: '1', text: "Hey! Saw we are both heading to Manali next month.", sender: 'them', time: '10:00 AM' },
    { id: '2', text: "That's awesome! Are you planning to trek or just chill?", sender: 'me', time: '10:05 AM' },
    { id: '3', text: "A bit of both! I want to do the Hampta Pass trek.", sender: 'them', time: '10:12 AM' },
  ]);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
          className="w-10 h-10 rounded-full border border-gray-200"
        />
        
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-900">Priya Patel</Text>
          <Text className="text-xs text-[#30AF5B] font-medium">Online</Text>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View className="items-center mb-6">
            <Text className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full overflow-hidden">
              Today
            </Text>
          </View>

          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
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
                  {msg.time}
                </Text>
              </View>
            );
          })}
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