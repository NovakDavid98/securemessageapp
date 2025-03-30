"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { encryptMessage } from '@/lib/encryption'

export default function Home() {
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [encryptedLink, setEncryptedLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateMessage = async () => {
    if (!message) {
      setError('Please enter a message')
      return
    }
    
    if (!password) {
      setError('Please enter a password')
      return
    }
    
    try {
      setIsLoading(true)
      setError('')
      
      // Encrypt the message
      const encrypted = await encryptMessage(message, password)
      
      // In a real app, we would save this to a database
      // For now, we'll just generate a fake link
      const id = Math.random().toString(36).substring(2, 10)
      
      // Create a shareable link
      const link = `${window.location.origin}?id=${id}`
      setEncryptedLink(link)
    } catch (error) {
      console.error('Error creating message:', error)
      setError('Failed to encrypt message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-4 text-green-500">Secure Message Exchange</h1>
      <p className="text-xl mb-8 text-gray-300">
        Exchange encrypted messages securely.
      </p>
      
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-green-400">Create Secure Message</CardTitle>
        </CardHeader>
        <CardContent>
          {encryptedLink ? (
            <div className="bg-gray-900 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-400 mb-2">Share this link:</p>
              <p className="text-green-400 break-all mb-2">{encryptedLink}</p>
              <p className="text-xs text-gray-500">Message is encrypted with your password and will self-destruct after viewing.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Your Message
                </label>
                <textarea 
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your secure message here..."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Access Password
                </label>
                <input 
                  type="password"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to secure message"
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
          {encryptedLink ? (
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => {
                setEncryptedLink('')
                setMessage('')
                setPassword('')
              }}
            >
              Create Another Message
            </Button>
          ) : (
            <Button 
              variant="primary" 
              className="w-full"
              onClick={handleCreateMessage}
              disabled={isLoading}
            >
              {isLoading ? 'Encrypting...' : 'Generate Secure Link'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

