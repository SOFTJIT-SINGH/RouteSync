import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, 
  ScrollView, StatusBar 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditPostScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { post } = route.params;
  
  const [caption, setCaption] = useState(post.caption || '');
  const [location, setLocation] = useState(post.location || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async () => {
    if (!caption.trim()) {
      Alert.alert('Missing Info', 'Please add a caption.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          caption: caption.trim(),
          location: location.trim(),
          updated_at: new Date(),
        })
        .eq('id', post.id);

      if (error) throw error;
      Alert.alert('Success', 'Post updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to remove this memory?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          setDeleting(true);
          try {
            const { error } = await supabase.from('posts').delete().eq('id', post.id);
            if (error) throw error;
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setDeleting(false);
          }
        } 
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-hi-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-hi-gray-10 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-hi-bg rounded-full">
           <Ionicons name="close" size={24} color="#292C27" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-hi-dark tracking-tight">Edit Story</Text>
        <TouchableOpacity onPress={handleDelete} className="w-10 h-10 items-center justify-center bg-red-50 rounded-full">
           <Feather name="trash-2" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
           
           {/* Image Preview */}
           <View className="w-full aspect-square rounded-[32px] overflow-hidden shadow-xl shadow-gray-200 mb-10 border border-white">
              <Image source={{ uri: post.image_url }} className="w-full h-full" resizeMode="cover" />
              <View className="absolute top-4 right-4 bg-hi-dark/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                 <Text className="text-white text-[10px] font-black uppercase">Captured Memory</Text>
              </View>
           </View>

           {/* Form */}
           <View className="space-y-6 pb-40">
              <View>
                <Text className="text-hi-dark font-black text-sm mb-3 ml-1">Update Caption</Text>
                <View className="bg-white p-5 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-50 min-h-[120px]">
                  <TextInput 
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="Tell your story..."
                    placeholderTextColor="#A2A2A2"
                    multiline
                    textAlignVertical="top"
                    className="flex-1 text-base font-bold text-hi-dark leading-relaxed"
                  />
                </View>
              </View>

              <View>
                <Text className="text-hi-dark font-black text-sm mb-3 ml-1">Location</Text>
                <View className="bg-white p-5 rounded-3xl border border-hi-gray-10 shadow-sm shadow-gray-50 flex-row items-center">
                  <FontAwesome6 name="location-dot" size={16} color="#30AF5B" />
                  <TextInput 
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Where was this taken?"
                    placeholderTextColor="#A2A2A2"
                    className="flex-1 ml-4 text-base font-bold text-hi-dark"
                  />
                </View>
              </View>
           </View>
        </ScrollView>

        {/* Sticky Save Bar */}
        <View style={{ paddingBottom: insets.bottom + 20 }} className="absolute bottom-0 w-full p-6 bg-white border-t border-hi-gray-10">
           <TouchableOpacity 
             onPress={handleUpdate}
             disabled={saving || deleting}
             className="bg-hi-green h-16 rounded-full items-center justify-center shadow-lg shadow-green-900/20"
           >
              {saving ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-black text-lg tracking-wide uppercase">Save Updates</Text>
              )}
           </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
