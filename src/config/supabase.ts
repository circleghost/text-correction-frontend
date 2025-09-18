import { createClient } from '@supabase/supabase-js'

// Supabase configuration (no defaults; must be provided via env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// Provide a safe fallback client when not configured (prevents runtime crashes)
const createFallbackClient = () => {
  const notConfigured = async () => ({ data: { session: null }, error: { message: 'Supabase not configured' } as any })
  const voidResult = async () => ({ error: { message: 'Supabase not configured' } as any })
  return {
    auth: {
      getSession: notConfigured,
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: voidResult,
      signOut: voidResult,
      refreshSession: notConfigured,
    }
  } as any
}

// Create Supabase client (or fallback)
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        storageKey: 'text-correction-auth',
        storage: window?.localStorage,
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createFallbackClient()

// Auth configuration for Google OAuth
export const authConfig = {
  providers: {
    google: {
      redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`,
    },
  },
}

// Types for user and session
export interface User {
  id: string
  email: string
  user_metadata: {
    name?: string
    picture?: string
    full_name?: string
  }
}

export interface Session {
  user: User
  access_token: string
  refresh_token: string
  expires_at?: number
}
