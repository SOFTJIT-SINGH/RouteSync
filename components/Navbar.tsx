import { View, Text, Image } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Navbar = () => {
  return (
    <View className='flex-row justify-between items-center my-4'>
      <View className="bg-white p-2 rounded-full shadow-sm border border-neutral-200">
        <FontAwesome6 name="bars-staggered" size={20} color="#1B3C15" />
      </View>
      <View className='flex flex-row items-center gap-2'>
        <Text className='font-bold text-xl tracking-tight text-rs-dark'>RouteSync</Text>
        <Image 
          source={require('../assets/logo.png')} 
          className='w-10 h-10 rounded-2xl border-2 border-rs-green'
        />
      </View>
    </View>
  );
};
export default Navbar;