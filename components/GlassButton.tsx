import React from 'react';
import { View, Text, Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassButtonProps extends PressableProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  bgIntensity?: number;
  bgTint?: 'light' | 'dark' | 'default';
  className?: string;
  textClassName?: string;
  loading?: boolean;
}

export default function GlassButton({
  label,
  onPress,
  icon,
  bgIntensity = 20,
  bgTint = 'light',
  className = '',
  textClassName = '',
  loading = false,
  ...props
}: GlassButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }}
      onPress={onPress}
      disabled={loading || props.disabled}
      style={[animatedStyle, { width: '100%' }]}
      {...props}
    >
      <BlurView
        intensity={bgIntensity}
        tint={bgTint}
        className={`rounded-2xl overflow-hidden border border-white/30 ${className}`}
      >
        <View className="px-5 py-4 flex-row justify-center items-center bg-white/20">
          {loading ? (
            <ActivityIndicator color={bgTint === 'dark' ? '#FFF' : '#059669'} />
          ) : (
            <>
              {icon && <View className="mr-2">{icon}</View>}
              <Text className={`font-black text-center text-base ${textClassName}`}>
                {label}
              </Text>
            </>
          )}
        </View>
      </BlurView>
    </AnimatedPressable>
  );
}
