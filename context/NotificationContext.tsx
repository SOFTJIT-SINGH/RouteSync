import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';

interface NotificationContextType {
  showToast: (title: string, message: string, type?: 'message' | 'like' | 'comment' | 'system', onPress?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'message' | 'like' | 'comment' | 'system';
    onPress?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showToast = useCallback((title: string, message: string, type: any = 'system', onPress?: () => void) => {
    setToast({ visible: true, title, message, type, onPress });
  }, []);

  useEffect(() => {
    let messageChannel: any;
    let interactionChannel: any;

    const setupListeners = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Listen for new messages
      messageChannel = supabase
        .channel(`notifications:messages:${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `receiver_id=eq.${user.id}` 
        }, async (payload) => {
          const { data: sender } = await supabase.from('profiles').select('first_name').eq('id', payload.new.sender_id).single();
          showToast(
            sender?.first_name || 'New Message',
            payload.new.text,
            'message'
          );
        })
        .subscribe();

      // 2. Listen for likes/comments/follows (from notifications table)
      interactionChannel = supabase
        .channel(`notifications:interactions:${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        }, async (payload) => {
          const { data: actor } = await supabase.from('profiles').select('first_name').eq('id', payload.new.actor_id).single();
          const actorName = actor?.first_name || 'Someone';
          
          let title = 'Notification';
          let type: any = 'system';

          switch (payload.new.type) {
            case 'like': 
              title = `${actorName} liked your post`; 
              type = 'like';
              break;
            case 'comment': 
              title = `${actorName} commented`; 
              type = 'comment';
              break;
            case 'follow': 
              title = `${actorName} followed you`; 
              type = 'system';
              break;
            case 'sync_request': 
              title = `New Sync Request`; 
              type = 'system';
              break;
          }

          showToast(title, payload.new.content || 'Tap to view', type);
        })
        .subscribe();
    };

    setupListeners();

    return () => {
      if (messageChannel) supabase.removeChannel(messageChannel);
      if (interactionChannel) supabase.removeChannel(interactionChannel);
    };
  }, [showToast]);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onPress={toast.onPress}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
