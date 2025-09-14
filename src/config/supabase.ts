import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qcmamgtwharlsiwjzikc.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bdQ8wZOg0GBuLXRSJPH6uw_Mp5p7ocd'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'text-correction-auth',
    storage: window?.localStorage,
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Auth configuration for Google OAuth
export const authConfig = {
  providers: {
    google: {
      redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/callback`
    }
  }
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