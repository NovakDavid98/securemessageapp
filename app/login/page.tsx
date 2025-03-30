"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft } from "lucide-react"
import { MatrixBackground } from "@/components/matrix-background"
import { useAuth } from "@/contexts/auth-context"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()

  useEffect(() => {
    // Check if user just registered
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setSuccess("Registration successful! Please log in.")
    }

    // Redirect if already logged in
    if (user) {
      router.push("/dashboard")
    }
  }, [searchParams, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center justify-center p-4 relative">
      <MatrixBackground />
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-500">Secure Message Exchange</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to your account</p>
        </div>

        <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-emerald-500">Login</CardTitle>
            <CardDescription>Access your secure messages</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {success && (
                <Alert className="bg-emerald-900/20 border-emerald-900 text-emerald-400">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  className="bg-gray-800/90 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-gray-800/90 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-pulse mr-2">⋯</span> Processing
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm mt-2">
                Don't have an account?{" "}
                <Link href="/register" className="text-emerald-400 hover:text-emerald-300">
                  Register
                </Link>
              </div>
              <Button
                variant="ghost"
                className="mt-4 text-gray-400 hover:text-gray-300"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

