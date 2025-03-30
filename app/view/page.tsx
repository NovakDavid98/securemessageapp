'use client'

import { useState, useEffect } from 'react'
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
  
  // In a real app, this data would come from an API
  // For demo purposes, we'll simulate having encrypted data
  const [messageData] = useState({
    encryptedContent: 'bQMMSgHNWl7S5KNIcVaj4ixJsTuzVSgcUhF3DpkUdVU=',
    iv: 'I4WC1yyMh57CMKU0',
    viewed: false
  })
  
  // Check if there's a message ID
  useEffect(() => {
    if (!messageId) {
      setError('No message ID provided')
    }
  }, [messageId])
  
  const handleDecrypt = async () => {
    if (!password) {
      setError('Please enter the password')
      return
    }
    
    try {
      setIsLoading(true)
      setError('')
      
      // Simulate delay for encryption process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, we would fetch the encrypted message from the server
      // For now, we'll use our dummy data
      const decrypted = await decryptMessage(
        messageData.encryptedContent,
        messageData.iv,
        password
      )
      
      if (decrypted) {
        setDecryptedMessage(decrypted)
        setIsDecrypted(true)
        
        // In a real app, we would mark the message as viewed on the server
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
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-green-400">
            {isDecrypted ? 'Secure Message' : 'Access Secure Message'}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter message password"
                />
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-900/50 border border-red-800 rounded-md text-red-300 text-sm">
                  {error}
                </div>
              )}
            </>
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
              disabled={isLoading || !messageId}
            >
              {isLoading ? 'Decrypting...' : 'Decrypt Message'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 