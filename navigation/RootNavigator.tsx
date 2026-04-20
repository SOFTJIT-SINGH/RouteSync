import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function RootNavigator() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'PASSWORD_RECOVERY') {
        setTimeout(() => {
          const { navigate } = require('./navigationRef');
          navigate('ResetPassword');
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#30AF5B" />
      </View>
    );
  }

  // Notice: No <NavigationContainer> here anymore! Just the pure stacks.
  return session ? <MainStack /> : <AuthStack />;
}