// screens/ChatScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Ensure this import is specific
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 bg-rs-bg rounded-full mr-4"
        >
          <Ionicons name="chevron-back" size={24} color="#30AF5B" />
        </TouchableOpacity>
        
        <View>
          <Text className="text-rs-dark font-bold text-lg">Arjun Singh</Text>
          <Text className="text-rs-green text-xs font-bold">95% Match</Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-10">
        <Text className="text-rs-gray text-center leading-6">
          "The best way to travel is with a friend." {"\n"} 
          "Start planning your Manali trek!"
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;