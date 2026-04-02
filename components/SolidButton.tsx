import React from 'react';
import { View, Text, Pressable, PressableProps, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'green' | 'dark' | 'white' | 'outline';

interface SolidButtonProps extends PressableProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  full?: boolean;
  className?: string;
  textClassName?: string;
  loading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  green: {
    bg: 'bg-hi-green',
    text: 'text-white',
    border: 'border-hi-green',
  },
  dark: {
    bg: 'bg-hi-dark',
    text: 'text-white',
    border: 'border-hi-dark',
  },
  white: {
    bg: 'bg-white',
    text: 'text-hi-dark',
    border: 'border-hi-gray-10',
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-hi-dark',
    border: 'border-hi-gray-20',
  },
};

export default function SolidButton({
  label,
  onPress,
  icon,
  variant = 'green',
  full = true,
  className = '',
  textClassName = '',
  loading = false,
  ...props
}: SolidButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = VARIANT_STYLES[variant];

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
      style={[animatedStyle, full ? { width: '100%' } : undefined]}
      {...props}
    >
      <View
        className={`rounded-full border px-6 py-4 flex-row justify-center items-center ${styles.bg} ${styles.border} ${className}`}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'white' ? '#292C27' : '#FFFFFF'} />
        ) : (
          <>
            {icon && <View className="mr-2.5">{icon}</View>}
            <Text className={`font-bold text-center text-base ${styles.text} ${textClassName}`}>
              {label}
            </Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}
