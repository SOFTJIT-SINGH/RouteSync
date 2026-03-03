import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import Sidebar from './Sidebar';

const Navbar = () => {
  const navigation = useNavigation<any>();
  return (
    <View className='flex-row justify-between items-center my-4'>
      <View className="bg-white p-2 rounded-full shadow-sm border border-neutral-200">
        {/* <FontAwesome6 name="bars-staggered" size={20} color="#1B3C15" /> */}
        <Sidebar />
      </View>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Profile')} // Navigates to Profile
        className='flex flex-row items-center gap-2'
      >
        <Text className='font-bold text-xl text-rs-dark'>RouteSync</Text>
        <Image 
          source={require('../assets/logo.png')} 
          className='w-10 h-10 rounded-2xl border-2 border-rs-green'
        />
      </TouchableOpacity>
    </View>
  );
};
export default Navbar;