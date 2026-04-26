import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ToastProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'message' | 'like' | 'comment' | 'system';
  onClose: () => void;
  onPress?: () => void;
}

export default function Toast({ visible, title, message, type = 'system', onClose, onPress }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: insets.top + 10,
        useNativeDriver: true,
        bounciness: 12,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'message': return { name: 'chatbubble-ellipses', color: '#30AF5B', bg: '#30AF5B15' };
      case 'like': return { name: 'heart', color: '#EF4444', bg: '#EF444415' };
      case 'comment': return { name: 'chatbubbles', color: '#3B82F6', bg: '#3B82F615' };
      default: return { name: 'notifications', color: '#1F2937', bg: '#F3F4F6' };
    }
  };

  const iconData = getIcon();

  if (!visible && translateY._value === -150) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        transform: [{ translateY }],
        zIndex: 9999,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (onPress) onPress();
          hide();
        }}
        className="bg-white/95 backdrop-blur-md rounded-[28px] p-4 flex-row items-center border border-gray-100 shadow-2xl shadow-black/10"
      >
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: iconData.bg }}
        >
          <Ionicons name={iconData.name as any} size={22} color={iconData.color} />
        </View>
        
        <View className="flex-1">
          <Text className="text-gray-900 font-black text-sm tracking-tight">{title}</Text>
          <Text className="text-gray-500 font-bold text-xs mt-0.5" numberOfLines={1}>{message}</Text>
        </View>

        <TouchableOpacity onPress={hide} className="ml-2 p-2">
          <Feather name="x" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}
