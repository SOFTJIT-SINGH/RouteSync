// App.tsx
import './global.css';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { NavigationContainer } from '@react-navigation/native'; 
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import AppNavigator from './navigation/MainStack';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}