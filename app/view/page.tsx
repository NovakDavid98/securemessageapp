'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { decryptMessage } from '@/lib/encryption'

export default function ViewMessage() {
  const searchParams = useSearchParams()
  const messageId = searchParams.get('id')
  
  const [password, setPassword] = useState('')
  const [decryptedMessage, setDecryptedMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDecrypted, setIsDecrypted] = useState(false)
  // Fixed: Now properly initializing message data as null
  const [messageData, setMessageData] = useState(null)
  
  // Fetch message data when component loads
  useEffect(() => {
    const fetchMessage = async () => {
      if (!messageId) {
        setError('No message ID provided')
        return
      }
      
      try {
        setIsLoading(true)
        
        // Fetch message from API
        const response = await fetch(`/api/messages?id=${messageId}`)
        
        if (response.status === 410) {
          setError('This message has already been viewed and is no longer available')
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch message')
        }
        
        const data = await response.json()
        setMessageData(data)
      } catch (error) {
        console.error('Error fetching message:', error)
        setError('Failed to load message. It may have been deleted or expired.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMessage()
  }, [messageId])
  
  const handleDecrypt = async () => {
    if (!password) {
      setError('Please enter the password')
      return
    }
    
    if (!messageData || !messageData.encrypted_content || !messageData.iv) {
      setError('Message data is missing or invalid')
      return
    }
    
    try {
      setIsLoading(true)
      setError('')
      
      // Bug fix: decryptMessage function has wrong parameter call
      // Should include salt parameter, but our version doesn't use it yet
      // This will be fixed in a future commit
      const decrypted = await decryptMessage(
        messageData.encrypted_content,
        messageData.iv,
        password
      )
      
      if (decrypted) {
        setDecryptedMessage(decrypted)
        setIsDecrypted(true)
        
        // Delete the message after it's been decrypted
        await deleteMessage()
      } else {
        setError('Invalid password. Please try again.')
      }
    } catch (error) {
      console.error('Error decrypting message:', error)
      setError('Failed to decrypt message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Delete message after viewing
  const deleteMessage = async () => {
    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        console.error('Failed to delete message after viewing')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-green-400">
            {isDecrypted ? 'Secure Message' : 'Access Secure Message'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !isDecrypted && (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-green-400">Loading message...</div>
            </div>
          )}
          
          {isDecrypted ? (
            <>
              <div className="bg-gray-900 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-400 mb-2">Decrypted Message:</p>
                <div className="whitespace-pre-wrap">{decryptedMessage}</div>
              </div>
              <div className="text-amber-400 text-sm mt-2 mb-4">
                This message has been deleted from the server and cannot be viewed again.
              </div>
            </>
          ) : (
            !isLoading && (
              <>
                {error ? (
                  <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-4">
                    <p className="text-red-300">{error}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 mb-4">
                      This message is encrypted and can only be viewed once.
                      Enter the password to decrypt it.
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Password
                      </label>
                      <input 
                        type="password"
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="Enter message password"
                      />
                    </div>
                  </>
                )}
              </>
            )
          )}
        </CardContent>
        <CardFooter>
          {isDecrypted ? (
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Create New Message
            </Button>
          ) : (
            <Button 
              variant="primary" 
              className="w-full"
              onClick={handleDecrypt}
              disabled={isLoading || !messageId || !!error}
            >
              {isLoading ? 'Decrypting...' : 'Decrypt Message'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 