"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Settings, LogOut, MessageSquare, Plus } from "lucide-react"
import { MatrixBackground } from "@/components/matrix-background"
import { useAuth } from "@/contexts/auth-context"
import { createCustomSupabaseClient } from "@/lib/custom-supabase"

export default function Dashboard() {
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState("")
  const [customSupabaseKey, setCustomSupabaseKey] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const router = useRouter()
  const { user, userSettings, signOut, updateUserSettings } = useAuth()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    // Set form values from user settings
    if (userSettings) {
      setCustomSupabaseUrl(userSettings.customSupabaseUrl || "")
      setCustomSupabaseKey(userSettings.customSupabaseKey || "")
    }

    // Fetch user's messages
    fetchMessages()
  }, [user, userSettings, router])

  const fetchMessages = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Use custom Supabase client if settings are available
      const supabase =
        userSettings?.customSupabaseUrl && userSettings?.customSupabaseKey
          ? createCustomSupabaseClient(userSettings.customSupabaseUrl, userSettings.customSupabaseKey)
          : createCustomSupabaseClient()

      const { data, error } = await supabase
        .from("encrypted_messages")
        .select("id, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      setMessages(data || [])
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      // Validate inputs if provided
      if (customSupabaseUrl || customSupabaseKey) {
        if (!customSupabaseUrl || !customSupabaseKey) {
          setError("Both Supabase URL and API key are required")
          return
        }

        // Test the connection
        try {
          const testClient = createCustomSupabaseClient(customSupabaseUrl, customSupabaseKey)
          const { error } = await testClient.from("encrypted_messages").select("count", { count: "exact" }).limit(1)

          if (error) {
            setError("Failed to connect to Supabase with provided credentials")
            return
          }
        } catch (err) {
          setError("Invalid Supabase credentials")
          return
        }
      }

      await updateUserSettings({
        customSupabaseUrl: customSupabaseUrl || undefined,
        customSupabaseKey: customSupabaseKey || undefined,
      })

      setSuccess("Settings saved successfully")
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center p-4 relative">
      <MatrixBackground />
      <div className="w-full max-w-4xl z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-emerald-500 mr-2" />
            <h1 className="text-2xl font-bold text-emerald-500">Secure Message Exchange</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-gray-400 hover:text-gray-300" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-800/90">
            <TabsTrigger value="messages" className="data-[state=active]:bg-emerald-900/30">
              <MessageSquare className="h-4 w-4 mr-2" /> Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-900/30">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-0">
            <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-emerald-500">Your Messages</CardTitle>
                  <CardDescription>Manage your secure messages</CardDescription>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => router.push("/")}>
                  <Plus className="h-4 w-4 mr-2" /> New Message
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse flex space-x-4">
                      <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 bg-gray-800/90 rounded-md border border-gray-700 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm text-gray-400">Created: {formatDate(message.created_at)}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {message.id}</p>
                        </div>
                        <Link href={`/?id=${message.id}`} className="text-emerald-400 hover:text-emerald-300 text-sm">
                          View Message
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages found</p>
                    <p className="text-sm mt-2">Create your first secure message to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-emerald-500">Custom Supabase Settings</CardTitle>
                <CardDescription>Configure your own Supabase instance for message storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {success && (
                  <Alert className="bg-emerald-900/20 border-emerald-900 text-emerald-400">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Supabase URL</label>
                  <Input
                    placeholder="https://your-project.supabase.co"
                    className="bg-gray-800/90 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                    value={customSupabaseUrl}
                    onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Leave empty to use the default Supabase instance</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Supabase API Key</label>
                  <Input
                    type="password"
                    placeholder="Your Supabase anon/public key"
                    className="bg-gray-800/90 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                    value={customSupabaseKey}
                    onChange={(e) => setCustomSupabaseKey(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Use the anon/public key from your Supabase project</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700 mt-4">
                  <h3 className="text-emerald-400 text-sm font-medium mb-2">Setting Up Your Own Supabase Instance</h3>
                  <ol className="text-xs text-gray-400 space-y-2 list-decimal pl-4">
                    <li>
                      Create a free account at{" "}
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        supabase.com
                      </a>
                    </li>
                    <li>Create a new project and note your project URL</li>
                    <li>Get your anon/public key from the API settings</li>
                    <li>
                      Create a table named "encrypted_messages" with the following columns:
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>id: uuid (primary key)</li>
                        <li>encrypted_content: text</li>
                        <li>iv: text</li>
                        <li>salt: text</li>
                        <li>created_at: timestamp with time zone (default: now())</li>
                      </ul>
                    </li>
                    <li>Enter your Supabase URL and API key above</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-pulse mr-2">⋯</span> Processing
                    </span>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

