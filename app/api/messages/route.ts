import { NextRequest, NextResponse } from 'next/server'
import { saveMessage, getMessage, markMessageAsViewed, deleteMessage } from '@/lib/supabase'

// GET /api/messages?id={id}
// Retrieves an encrypted message by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }
    
    const message = await getMessage(id)
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    if (message.viewed) {
      return NextResponse.json({ error: 'This message has already been viewed' }, { status: 410 })
    }
    
    // Return the message without marking it as viewed yet
    // It will be marked as viewed when it's successfully decrypted
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error retrieving message:', error)
    return NextResponse.json({ error: 'Failed to retrieve message' }, { status: 500 })
  }
}

// POST /api/messages
// Stores a new encrypted message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.encryptedContent || !body.iv) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Save the message to the database
    const result = await saveMessage(body.encryptedContent, body.iv)
    
    // Return the message ID
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error storing message:', error)
    return NextResponse.json({ error: 'Failed to store message' }, { status: 500 })
  }
}

// DELETE /api/messages?id={id}
// Deletes a message after it has been viewed
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }
    
    // Mark the message as viewed first
    await markMessageAsViewed(id)
    
    // Then delete it
    await deleteMessage(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}

