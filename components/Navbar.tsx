import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Sidebar from './Sidebar';

const Navbar = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="my-4 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        className="rounded-full border border-neutral-200 bg-white p-2 shadow-sm">
        <FontAwesome6 name="bars-staggered" size={20} color="#1B3C15" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')} // Navigates to Profile
        className="flex flex-row items-center gap-2">
        <Text className="text-xl font-bold text-rs-dark">RouteSync</Text>
        <Image
          source={require('../assets/logo.png')}
          className="h-10 w-10 rounded-2xl border-2 border-rs-green"
        />
      </TouchableOpacity>
    </View>
  );
};
export default Navbar;
