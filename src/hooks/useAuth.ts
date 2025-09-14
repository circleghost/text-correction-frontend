import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          setAuthState({
            user: null,
            loading: false,
            error: error.message
          });
          return;
        }

        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to get initial session:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to authenticate'
        });
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return false;
      }

      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      setAuthState(prev => ({
        ...prev,
        user: session?.user || null,
        error: null
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signOut,
    refreshSession
  };
};