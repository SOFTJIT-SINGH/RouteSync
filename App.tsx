import { StatusBar } from 'expo-status-bar';
import './global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Navbar from './components/Navbar';
import HeroButtons from './components/HeroButtons';
import ActiveSyncs from 'components/ActiveSyncs';
import BuddyMatch from 'components/BuddyMatch';
import AddItinerary from 'components/AddItinerary';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView className="bg-rs-bg mb-5 flex-1">
        <ScrollView className="px-5">
          <Navbar />

          <View className="my-8">
            <Text className="text-4xl font-bold leading-tight text-[#292C27]">
              Route<Text className="text-[#30AF5B]">Sync</Text>
            </Text>
            <Text className="mt-2 text-lg text-[#7B7B7B]">
              Find the perfect companion for your next adventure.
            </Text>
          </View>

          <HeroButtons />

          <ActiveSyncs />
          
          <AddItinerary />

          <BuddyMatch />
          {/* Featured Section inspired by JSM Video */}
          <View className="relative mt-10 overflow-hidden rounded-[40px] bg-[#30AF5B] p-8">
            <Text className="text-2xl font-bold text-white">Feeling Lost?</Text>
            <Text className="mt-2 text-sm leading-6 text-white/80">
              Our RouteSync engine matches you with travelers who know the way. Sync your itinerary
              now.
            </Text>
            <TouchableOpacity className="mt-6 self-start rounded-full bg-white px-6 py-3">
              <Text className="font-bold text-[#30AF5B]">Get Started</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
