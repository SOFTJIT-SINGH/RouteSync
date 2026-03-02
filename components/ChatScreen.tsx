import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';

const ChatScreen = () => {
  const [msg, setMsg] = useState('');

  const chatHistory = [
    { id: 1, text: "Hey Softjit! Saw we synced for the Manali Trek. 🏔️", sender: false },
    { id: 2, text: "Yeah! My sync score with you is 95%. Are you a pro hiker?", sender: true },
    { id: 3, text: "Third time! I have all the gear. Do you have a tent?", sender: false },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-rs-bg"
    >
      {/* 1. Chat Header */}
      <View className="bg-white p-6 pt-12 rounded-b-[40px] shadow-sm flex-row items-center justify-between border-b border-rs-green/10">
        <TouchableOpacity className="p-2 bg-rs-bg rounded-full">
          <Ionicons name="chevron-back" size={24} color="#30AF5B" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-rs-dark font-bold text-lg">Arjun Singh</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-rs-green mr-2" />
            <Text className="text-rs-gray text-xs">Active Now • 95% Match</Text>
          </View>
        </View>

        <TouchableOpacity className="p-2 bg-rs-bg rounded-full">
          <MaterialIcons name="more-vert" size={24} color="#7B7B7B" />
        </TouchableOpacity>
      </View>

      {/* 2. Message List */}
      <ScrollView className="flex-1 px-5 pt-6">
        {chatHistory.map((item) => (
          <View 
            key={item.id} 
            className={`mb-4 max-w-[80%] p-4 rounded-3xl ${
              item.sender 
                ? 'bg-rs-green self-end rounded-tr-none shadow-md shadow-green-900/20' 
                : 'bg-white self-start rounded-tl-none shadow-sm border border-rs-green/5'
            }`}
          >
            <Text className={`${item.sender ? 'text-white' : 'text-rs-dark'} text-sm leading-5`}>
              {item.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* 3. Input Bar */}
      <View className="p-6 pb-10 bg-white rounded-t-[40px] shadow-2xl flex-row items-center">
        <TouchableOpacity className="mr-3">
          <Ionicons name="add-circle" size={32} color="#30AF5B" />
        </TouchableOpacity>
        
        <View className="flex-1 bg-rs-bg px-5 py-3 rounded-2xl border border-rs-green/10">
          <TextInput 
            className="text-rs-dark text-sm" 
            placeholder="Plan the route..." 
            value={msg}
            onChangeText={setMsg}
          />
        </View>

        <TouchableOpacity className="ml-3 bg-rs-green p-4 rounded-2xl shadow-lg shadow-green-900/30">
          <FontAwesome6 name="paper-plane" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;