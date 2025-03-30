import { NextResponse } from "next/server"
import { supabase, isPreviewMode } from "@/lib/supabase"
import { createCustomSupabaseClient } from "@/lib/custom-supabase"

export async function POST(request: Request) {
  try {
    const { encryptedContent, iv, salt, customSupabaseUrl, customSupabaseKey } = await request.json()

    // If in preview mode, return a mock response
    if (isPreviewMode()) {
      return NextResponse.json({ id: "preview-id" })
    }

    // Use custom Supabase client if credentials are provided
    const client =
      customSupabaseUrl && customSupabaseKey
        ? createCustomSupabaseClient(customSupabaseUrl, customSupabaseKey)
        : supabase

    // Store the encrypted message in Supabase with viewed=false
    const { data, error } = await client
      .from("encrypted_messages")
      .insert([
        {
          encrypted_content: encryptedContent,
          iv,
          salt,
          viewed: false, // Add viewed flag, initially false
        },
      ])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to store message in database. Please try again." }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data returned from database" }, { status: 500 })
    }

    return NextResponse.json({ id: data[0].id })
  } catch (error) {
    console.error("Error storing message:", error)
    return NextResponse.json({ error: "Failed to store message" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const customSupabaseUrl = searchParams.get("customSupabaseUrl")
    const customSupabaseKey = searchParams.get("customSupabaseKey")

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // If in preview mode, return a mock response
    if (isPreviewMode()) {
      return NextResponse.json({
        encryptedContent: "preview-content",
        iv: "preview-iv",
        salt: "preview-salt",
        id: id,
      })
    }

    // Use custom Supabase client if credentials are provided
    const client =
      customSupabaseUrl && customSupabaseKey
        ? createCustomSupabaseClient(customSupabaseUrl, customSupabaseKey)
        : supabase

    // Retrieve the encrypted message from Supabase
    const { data, error } = await client
      .from("encrypted_messages")
      .select("encrypted_content, iv, salt, viewed")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Database error:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Message not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to retrieve message from database" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if message has already been viewed
    if (data.viewed) {
      return NextResponse.json(
        { error: "This message has already been viewed and is no longer available" },
        { status: 410 }, // Gone status code
      )
    }

    return NextResponse.json({
      encryptedContent: data.encrypted_content,
      iv: data.iv,
      salt: data.salt,
      id: id, // Return the ID so we can mark it as viewed later
    })
  } catch (error) {
    console.error("Error retrieving message:", error)
    return NextResponse.json({ error: "Failed to retrieve message" }, { status: 500 })
  }
}

// Add a new endpoint to mark a message as viewed and delete it
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const customSupabaseUrl = searchParams.get("customSupabaseUrl")
    const customSupabaseKey = searchParams.get("customSupabaseKey")

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // If in preview mode, return a mock success response
    if (isPreviewMode()) {
      return NextResponse.json({ success: true })
    }

    // Use custom Supabase client if credentials are provided
    const client =
      customSupabaseUrl && customSupabaseKey
        ? createCustomSupabaseClient(customSupabaseUrl, customSupabaseKey)
        : supabase

    // Delete the message from Supabase
    const { error } = await client.from("encrypted_messages").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete message from database" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

