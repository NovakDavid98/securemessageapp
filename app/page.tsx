"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Copy, Eye, EyeOff, KeyRound, ArrowLeft, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MatrixBackground } from "@/components/matrix-background"
import { NavHeader } from "@/components/nav-header"
import { encryptMessage, decryptMessage } from "@/lib/encryption"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Secure Message Exchange</h1>
      <p className="text-xl mb-8">
        A platform for exchanging encrypted messages securely.
      </p>
      <div className="p-4 border border-gray-300 rounded-md">
        <p>Coming soon! Check back for updates.</p>
      </div>
    </div>
  )
}

