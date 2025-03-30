import { createClient } from "@supabase/supabase-js"
import { isPreviewMode } from "./supabase"

// Default Supabase credentials
const defaultSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const defaultSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a mock client for preview mode
const createMockClient = () => {
  return {
    from: () => ({
      insert: () => ({ select: () => ({ data: [{ id: "preview-id" }], error: null }) }),
      select: () => ({
        eq: () => ({
          single: () => ({ data: null, error: null }),
          data: null,
          error: null,
        }),
      }),
      delete: () => ({ eq: () => ({ error: null }) }),
    }),
  }
}

// Create a Supabase client with custom credentials
export const createCustomSupabaseClient = (customUrl?: string, customKey?: string) => {
  const url = customUrl || defaultSupabaseUrl
  const key = customKey || defaultSupabaseKey

  // If in preview mode or missing credentials, return a mock client
  if (isPreviewMode() || !url || !key) {
    return createMockClient()
  }

  return createClient(url, key)
}

