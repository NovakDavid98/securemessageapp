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
  const [message, setMessage] = useState("")
  const [password, setPassword] = useState("")
  const [accessPassword, setAccessPassword] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isViewingMode, setIsViewingMode] = useState(false)
  const [messageId, setMessageId] = useState<string | null>(null)
  const [decryptedMessage, setDecryptedMessage] = useState("")
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [encryptedData, setEncryptedData] = useState<{
    encryptedContent: string
    iv: string
    salt: string
    id: string
  } | null>(null)
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false)
  const [messageDestroyed, setMessageDestroyed] = useState(false)
  const { user, userSettings } = useAuth()

  // Check if there's a message ID in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")

    if (id) {
      setMessageId(id)
      setIsViewingMode(true)
      fetchEncryptedMessage(id)
    }
  }, [])

  // Fetch the encrypted message from the server
  const fetchEncryptedMessage = async (id: string) => {
    try {
      setLoading(true)

      // Build URL with custom Supabase credentials if available
      let url = `/api/messages?id=${id}`
      if (user && userSettings?.customSupabaseUrl && userSettings?.customSupabaseKey) {
        url += `&customSupabaseUrl=${encodeURIComponent(userSettings.customSupabaseUrl)}&customSupabaseKey=${encodeURIComponent(userSettings.customSupabaseKey)}`
      }

      const response = await fetch(url)

      if (response.status === 410) {
        // Message has already been viewed
        setMessageDestroyed(true)
        setError("This message has already been viewed and is no longer available.")
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch message")
      }

      const data = await response.json()
      setEncryptedData({
        encryptedContent: data.encryptedContent,
        iv: data.iv,
        salt: data.salt,
        id: data.id,
      })
    } catch (error) {
      console.error("Error fetching message:", error)
      setError(
        error instanceof Error ? error.message : "Failed to load the message. It may have been deleted or expired.",
      )
    } finally {
      setLoading(false)
    }
  }

  // Create and store a new encrypted message
  const handleCreateMessage = async () => {
    if (!message || !password) {
      setError("Please enter both a message and password")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Encrypt the message with the password
      const encrypted = await encryptMessage(message, password)

      // Add custom Supabase credentials if available
      if (user && userSettings?.customSupabaseUrl && userSettings?.customSupabaseKey) {
        encrypted.customSupabaseUrl = userSettings.customSupabaseUrl
        encrypted.customSupabaseKey = userSettings.customSupabaseKey
      }

      // Store the encrypted message in the database
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(encrypted),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to store message")
      }

      const { id } = await response.json()

      // Generate a link with the message ID
      const link = `${window.location.origin}?id=${id}`
      setGeneratedLink(link)
    } catch (error) {
      console.error("Error creating message:", error)
      setError(error instanceof Error ? error.message : "Failed to create and store the message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Decrypt a message with the provided password
  const handleAccessMessage = async () => {
    if (!encryptedData || !accessPassword) {
      setError("Please enter the password")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Decrypt the message with the password
      const decrypted = await decryptMessage(
        encryptedData.encryptedContent,
        encryptedData.iv,
        encryptedData.salt,
        accessPassword,
      )

      if (decrypted) {
        setDecryptedMessage(decrypted)
        setIsDecrypted(true)

        // Delete the message from the database after successful decryption
        await deleteMessage(encryptedData.id)
      } else {
        setError("Invalid password. Please try again.")
      }
    } catch (error) {
      console.error("Error decrypting message:", error)
      setError("Failed to decrypt the message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Delete the message from the database
  const deleteMessage = async (id: string) => {
    try {
      // Build URL with custom Supabase credentials if available
      let url = `/api/messages?id=${id}`
      if (user && userSettings?.customSupabaseUrl && userSettings?.customSupabaseKey) {
        url += `&customSupabaseUrl=${encodeURIComponent(userSettings.customSupabaseUrl)}&customSupabaseKey=${encodeURIComponent(userSettings.customSupabaseKey)}`
      }

      const response = await fetch(url, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error deleting message:", errorData.error)
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      // Don't show an error to the user, as they've already seen the message
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
  }

  const resetToCreate = () => {
    // Clear the URL parameters without refreshing the page
    window.history.pushState({}, "", window.location.pathname)
    setIsViewingMode(false)
    setMessageId(null)
    setIsDecrypted(false)
    setDecryptedMessage("")
    setAccessPassword("")
    setEncryptedData(null)
    setError("")
    setMessageDestroyed(false)
  }

  // Render the message viewing interface
  if (isViewingMode) {
    if (messageDestroyed) {
      // Show message destroyed notice
      return (
        <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center justify-center p-4 relative">
          <MatrixBackground />
          <div className="w-full max-w-md z-10">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                <Shield className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-500">Message Unavailable</h1>
            </div>

            <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm mb-6 shadow-lg shadow-red-500/10">
              <CardHeader>
                <CardTitle className="text-red-500">Message Self-Destructed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-800/90 rounded-md border border-gray-700 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-amber-400 font-medium mb-2">This message has already been viewed.</p>
                  <p className="text-gray-400">
                    For security reasons, each message can only be viewed once and is permanently deleted after viewing.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" onClick={resetToCreate}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Create New Message
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )
    }

    if (isDecrypted) {
      // Show only the decrypted message and disclaimer
      return (
        <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center justify-center p-4 relative">
          <MatrixBackground />
          <div className="w-full max-w-md z-10">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                <Shield className="h-12 w-12 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-500">Secure Message</h1>
            </div>

            <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm mb-6 shadow-lg shadow-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-emerald-500">Decrypted Message</CardTitle>
                <CardDescription className="text-amber-400 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> This message has been deleted and cannot be viewed again
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-800/90 rounded-md border border-gray-700">
                  <p className="whitespace-pre-wrap">{decryptedMessage}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" onClick={resetToCreate}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Create New Message
                </Button>
              </CardFooter>
            </Card>

            <footer className="mt-6 w-full max-w-2xl mx-auto">
              <div className="relative py-8 px-6 bg-gray-900/90 backdrop-blur-sm border border-emerald-900/40 rounded-lg shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/20 opacity-50"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-emerald-400 font-medium text-lg text-center">Disclaimer</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-gray-800/50 p-1 h-auto"
                      onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
                    >
                      {isDisclaimerExpanded ? "Hide" : "Show"}
                    </Button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isDisclaimerExpanded ? "max-h-96" : "max-h-12"}`}
                  >
                    <p className="text-gray-300 leading-relaxed text-center">
                      Crafted with honorable intent yet mysteriously unclaimed by the enigmatic FlowerSniffin, who
                      maintains blissful ignorance regarding this page's existence or purpose. Until further notice
                      (preferably from legal counsel), he'll be calmly observing from afar. Questions, issues, or
                      existential crises? Feel free—indeed, encouraged—to seek answers elsewhere without hesitation.
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-6 right-10 opacity-10">
                  <Shield className="h-24 w-24 text-emerald-500" />
                </div>
              </div>
            </footer>
          </div>
        </div>
      )
    }

    // Show password entry for encrypted message
    return (
      <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center justify-center p-4 relative">
        <MatrixBackground />
        <div className="w-full max-w-md z-10">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <Shield className="h-12 w-12 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-500">Secure Message Exchange</h1>
            <p className="text-gray-500 text-sm mt-1">Enter password to view message</p>
          </div>

          <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-emerald-500">Access Secure Message</CardTitle>
              <CardDescription>Enter the password to view this message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-900/20 border-amber-900 text-amber-400">
                <AlertDescription className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>This message will self-destruct after viewing and cannot be accessed again</span>
                </AlertDescription>
              </Alert>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              ) : (
                <>
                  {encryptedData ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter access password"
                          className="bg-gray-800/90 border-gray-700 pr-10 focus:border-emerald-500 focus:ring-emerald-500"
                          value={accessPassword}
                          onChange={(e) => setAccessPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Alert className="bg-amber-900/20 border-amber-900 text-amber-400">
                      <AlertDescription>Loading message data...</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAccessMessage}
                disabled={loading || !encryptedData}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-pulse mr-2">⋯</span> Processing
                  </span>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" /> Decrypt Message
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-700 text-gray-300"
                onClick={resetToCreate}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
              </Button>
            </CardFooter>
          </Card>

          <footer className="mt-12 w-full max-w-2xl mx-auto">
            <div className="relative py-8 px-6 bg-gray-900/90 backdrop-blur-sm border border-emerald-900/40 rounded-lg shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/20 opacity-50"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-emerald-400 font-medium text-lg text-center">Disclaimer</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-gray-800/50 p-1 h-auto"
                    onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
                  >
                    {isDisclaimerExpanded ? "Hide" : "Show"}
                  </Button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isDisclaimerExpanded ? "max-h-96" : "max-h-12"}`}
                >
                  <p className="text-gray-300 leading-relaxed text-center">
                    Crafted with honorable intent yet mysteriously unclaimed by the enigmatic FlowerSniffin, who
                    maintains blissful ignorance regarding this page's existence or purpose. Until further notice
                    (preferably from legal counsel), he'll be calmly observing from afar. Questions, issues, or
                    existential crises? Feel free—indeed, encouraged—to seek answers elsewhere without hesitation.
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-6 right-10 opacity-10">
                <Shield className="h-24 w-24 text-emerald-500" />
              </div>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  // Render the message creation interface
  return (
    <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center p-4 relative">
      <MatrixBackground />
      <div className="w-full max-w-md z-10">
        <NavHeader />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-500">Create Secure Message</h1>
          <p className="text-gray-500 text-sm mt-1">End-to-end encrypted messaging</p>
        </div>

        <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-emerald-500">Create Secure Message</CardTitle>
            <CardDescription>Enter your message and set a password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-900/20 border-amber-900 text-amber-400">
              <AlertDescription className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Messages self-destruct after being viewed once</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Textarea
                placeholder="Enter your secret message here..."
                className="min-h-[120px] bg-gray-800/90 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Set access password"
                  className="bg-gray-800/90 border-gray-700 pr-10 focus:border-emerald-500 focus:ring-emerald-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {generatedLink && (
              <div className="p-3 bg-gray-800/90 rounded border border-gray-700 break-all">
                <p className="text-xs text-gray-400 mb-1">Share this link:</p>
                <p className="text-sm text-emerald-400 font-mono">{generatedLink}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full border-gray-700 hover:bg-gray-700 text-emerald-500"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy Link
                </Button>
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCreateMessage}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-pulse mr-2">⋯</span> Processing
                </span>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" /> Generate Secure Link
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <footer className="mt-12 w-full max-w-2xl mx-auto">
          <div className="relative py-8 px-6 bg-gray-900/90 backdrop-blur-sm border border-emerald-900/40 rounded-lg shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/20 opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <p className="text-emerald-400 font-medium text-lg text-center">Disclaimer</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-gray-800/50 p-1 h-auto"
                  onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
                >
                  {isDisclaimerExpanded ? "Hide" : "Show"}
                </Button>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isDisclaimerExpanded ? "max-h-96" : "max-h-12"}`}
              >
                <p className="text-gray-300 leading-relaxed text-center">
                  Crafted with honorable intent yet mysteriously unclaimed by the enigmatic FlowerSniffin, who maintains
                  blissful ignorance regarding this page's existence or purpose. Until further notice (preferably from
                  legal counsel), he'll be calmly observing from afar. Questions, issues, or existential crises? Feel
                  free—indeed, encouraged—to seek answers elsewhere without hesitation.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 right-10 opacity-10">
              <Shield className="h-24 w-24 text-emerald-500" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

