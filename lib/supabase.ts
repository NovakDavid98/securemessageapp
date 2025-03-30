import { createClient } from "@supabase/supabase-js"

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== "" && supabaseAnonKey !== ""
}

// Database schema:
// Table: encrypted_messages
// Columns:
// - id: uuid (primary key)
// - encrypted_content: text (the encrypted message)
// - iv: text (initialization vector for decryption)
// - salt: text (salt used for key derivation)
// - viewed: boolean (default: false)
// - created_at: timestamp with time zone (default: now())

// Save a message to the database
export const saveMessage = async (encryptedContent: string, iv: string) => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured, using preview mode")
      // In preview mode, return a fake ID
      return { id: Math.random().toString(36).substring(2, 10) }
    }

    const { data, error } = await supabase
      .from("encrypted_messages")
      .insert([{ encrypted_content: encryptedContent, iv, viewed: false }])
      .select("id")
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error saving message:", error)
    throw new Error("Failed to save message")
  }
}

// Get a message from the database
export const getMessage = async (id: string) => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured, using preview mode")
      // In preview mode, return fake data
      return {
        id,
        encrypted_content: "bQMMSgHNWl7S5KNIcVaj4ixJsTuzVSgcUhF3DpkUdVU=",
        iv: "I4WC1yyMh57CMKU0",
        viewed: false
      }
    }

    const { data, error } = await supabase
      .from("encrypted_messages")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting message:", error)
    throw new Error("Failed to retrieve message")
  }
}

// Mark a message as viewed
export const markMessageAsViewed = async (id: string) => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured, using preview mode")
      return true
    }

    const { error } = await supabase
      .from("encrypted_messages")
      .update({ viewed: true })
      .eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error marking message as viewed:", error)
    throw new Error("Failed to update message")
  }
}

// Delete a message
export const deleteMessage = async (id: string) => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured, using preview mode")
      return true
    }

    const { error } = await supabase
      .from("encrypted_messages")
      .delete()
      .eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting message:", error)
    throw new Error("Failed to delete message")
  }
}

