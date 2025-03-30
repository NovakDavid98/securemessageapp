import { createClient } from "@supabase/supabase-js"

// These would come from environment variables in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if the required environment variables are set
const hasCredentials = !!(supabaseUrl && supabaseAnonKey)

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
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve(),
    },
  }
}

// Create the Supabase client or a mock client if credentials are missing
export const supabase = hasCredentials ? createClient(supabaseUrl, supabaseAnonKey) : createMockClient()

// Helper function to check if we're in preview mode
export const isPreviewMode = () => !hasCredentials

// Database schema:
// Table: encrypted_messages
// Columns:
// - id: uuid (primary key)
// - encrypted_content: text (the encrypted message)
// - iv: text (initialization vector for decryption)
// - salt: text (salt used for key derivation)
// - viewed: boolean (default: false)
// - created_at: timestamp

