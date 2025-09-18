import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, supabaseConfigured, type User, type Session } from '../config/supabase'
import type { AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getInitialSession = async () => {
      if (!supabaseConfigured) {
        // Skip auth calls when Supabase is not configured
        if (isMounted) setLoading(false)
        return
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (isMounted) {
          if (error) {
            console.error('Error getting session:', error.message)
          } else if (session) {
            setSession(session as Session)
            setUser(session.user as User)
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes (only when configured)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session) {
          setSession(session as Session)
          setUser(session.user as User)
        } else {
          setSession(null)
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      if (!supabaseConfigured) {
        return { error: { message: 'Supabase 未設定：請聯絡管理員或補上環境變數' } as any }
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      return { error }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      if (!supabaseConfigured) {
        return { error: null as any }
      }
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
