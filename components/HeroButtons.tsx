import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const HeroButtons = () => {
  const hero = [
    {
      name: 'Find Buddy',
      icon: <FontAwesome6 name="user-group" size={20} color="#30AF5B" />,
    },
    {
      name: 'Sync Route',
      icon: <MaterialCommunityIcons name="map-marker-path" size={24} color="#30AF5B" />,
    },
    {
      name: 'Shared Gear',
      icon: <MaterialIcons name="handshake" size={24} color="#30AF5B" />,
    },
    {
      name: 'Messages',
      icon: <MaterialIcons name="chat-bubble-outline" size={24} color="#30AF5B" />,
    },
  ];

  return (
    <View className='flex-row justify-between mt-4'>
      {hero.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          activeOpacity={0.8}
          className='bg-white p-4 w-[23%] rounded-3xl items-center justify-center shadow-sm'
          style={{ shadowColor: '#30AF5B', shadowOpacity: 0.05, shadowRadius: 10 }}
        >
          <View className="bg-[#F0F9F0] p-3 rounded-full mb-2">
            {item.icon}
          </View>
          <Text className='font-bold text-[10px] text-[#292C27] text-center'>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HeroButtons;