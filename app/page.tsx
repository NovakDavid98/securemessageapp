"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-4 text-green-500">Secure Message Exchange</h1>
      <p className="text-xl mb-8 text-gray-300">
        Exchange encrypted messages securely.
      </p>
      
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-green-400">Secure Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Create encrypted messages that self-destruct after viewing.
            Perfect for sharing sensitive information.
          </p>
          <Button variant="primary" className="w-full">
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

