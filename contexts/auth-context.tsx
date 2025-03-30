"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, isPreviewMode } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type UserSettings = {
  customSupabaseUrl?: string
  customSupabaseKey?: string
}

type AuthContextType = {
  user: User | null
  userSettings: UserSettings | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateUserSettings: (settings: UserSettings) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Skip Supabase auth in preview mode
        if (isPreviewMode()) {
          setLoading(false)
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await fetchUserSettings(session.user.id)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Skip auth subscription in preview mode
    if (isPreviewMode()) {
      return
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchUserSettings(session.user.id)
      } else {
        setUser(null)
        setUserSettings(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserSettings = async (userId: string) => {
    try {
      // Skip in preview mode
      if (isPreviewMode()) {
        return
      }

      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("Error fetching user settings:", error)
        return
      }

      if (data) {
        setUserSettings({
          customSupabaseUrl: data.custom_supabase_url,
          customSupabaseKey: data.custom_supabase_key,
        })
      }
    } catch (error) {
      console.error("Error fetching user settings:", error)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      // Mock signup in preview mode
      if (isPreviewMode()) {
        return { error: null }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (!error && data.user) {
        // Create user settings record
        await supabase.from("user_settings").insert([{ user_id: data.user.id }])
      }

      return { error }
    } catch (error) {
      console.error("Error during sign up:", error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Mock signin in preview mode
      if (isPreviewMode()) {
        return { error: null }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Error during sign in:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Mock signout in preview mode
      if (isPreviewMode()) {
        setUser(null)
        setUserSettings(null)
        return
      }

      await supabase.auth.signOut()
      setUser(null)
      setUserSettings(null)
    } catch (error) {
      console.error("Error during sign out:", error)
    }
  }

  const updateUserSettings = async (settings: UserSettings) => {
    if (!user) return

    try {
      // Mock update in preview mode
      if (isPreviewMode()) {
        setUserSettings(settings)
        return
      }

      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        custom_supabase_url: settings.customSupabaseUrl,
        custom_supabase_key: settings.customSupabaseKey,
      })

      if (error) {
        console.error("Error updating user settings:", error)
        return
      }

      setUserSettings(settings)
    } catch (error) {
      console.error("Error updating user settings:", error)
    }
  }

  const value = {
    user,
    userSettings,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserSettings,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

