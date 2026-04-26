import React from 'react';
import { View, Text, Image } from 'react-native';

const COLORS = [
  '#30AF5B', '#6366F1', '#EC4899', '#FF814C', '#F59E0B',
  '#14B8A6', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  rounded?: 'full' | 'xl' | '2xl';
  borderWidth?: number;
  borderColor?: string;
  className?: string;
};

export default function Avatar({ uri, name, size = 44, rounded = 'full', borderWidth = 0, borderColor = 'white', className = '' }: Props) {
  const initials = getInitials(name);
  const bgColor = getColor(name || '');
  const fontSize = Math.max(size * 0.38, 10);
  const borderRadius = rounded === 'full' ? size / 2 : rounded === '2xl' ? 16 : 12;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius,
          borderWidth,
          borderColor,
          backgroundColor: '#F3F4F6',
        }}
        className={className}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        borderWidth,
        borderColor,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      <Text style={{ color: 'white', fontSize, fontWeight: '900', letterSpacing: 0.5 }}>
        {initials}
      </Text>
    </View>
  );
}
