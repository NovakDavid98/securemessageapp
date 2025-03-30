"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft, Lock, Key, AlertTriangle } from "lucide-react"
import { MatrixBackground } from "@/components/matrix-background"

export default function About() {
  return (
    <div className="min-h-screen bg-black/90 text-gray-300 flex flex-col items-center p-4 relative">
      <MatrixBackground />
      <div className="w-full max-w-4xl z-10 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-emerald-500 mr-2" />
            <h1 className="text-2xl font-bold text-emerald-500">Secure Message Exchange</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        <Card className="border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10 mb-8">
          <CardHeader>
            <CardTitle className="text-emerald-500">About This Application</CardTitle>
            <CardDescription>Secure, end-to-end encrypted message sharing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-emerald-400 mb-2">Overview</h2>
              <p className="text-gray-300 leading-relaxed">
                Secure Message Exchange is a privacy-focused application designed to share sensitive information
                securely. It uses military-grade encryption to ensure that your messages remain private and can only be
                accessed by those who have the correct password.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-emerald-400 mb-2">Key Features</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>End-to-end encryption using AES-GCM (Advanced Encryption Standard in Galois/Counter Mode)</li>
                <li>Client-side encryption - your messages are encrypted in your browser before being stored</li>
                <li>Password-protected messages - only those with the password can decrypt and view messages</li>
                <li>Self-destructing messages - each message can only be viewed once, then it's permanently deleted</li>
                <li>No password recovery - if the password is lost, the message cannot be recovered</li>
                <li>Shareable links - easily share encrypted messages via a simple link</li>
                <li>Custom Supabase integration - host your messages on your own database instance</li>
                <li>User accounts - manage your messages and settings</li>
              </ul>
            </div>

            <div className="bg-amber-900/10 p-4 rounded-md border border-amber-900/30 mb-4">
              <h3 className="text-amber-400 text-sm font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" /> Self-Destructing Messages
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                For maximum security, each message self-destructs after being viewed once. Once a message is decrypted
                with the correct password, it is permanently deleted from the database and cannot be accessed again,
                even with the same link and password. This ensures that sensitive information doesn't remain accessible
                indefinitely and provides an additional layer of security.
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
              <h2 className="text-lg font-medium text-emerald-400 mb-2">Security Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-emerald-300 text-sm font-medium mb-1 flex items-center">
                    <Lock className="h-4 w-4 mr-1" /> Encryption Algorithm
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We use AES-GCM (Advanced Encryption Standard in Galois/Counter Mode), a highly secure authenticated
                    encryption algorithm recommended by security experts and used by governments and financial
                    institutions worldwide. This provides both confidentiality and integrity protection.
                  </p>
                </div>

                <div>
                  <h3 className="text-emerald-300 text-sm font-medium mb-1 flex items-center">
                    <Key className="h-4 w-4 mr-1" /> Key Derivation
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Your password is never stored or transmitted. Instead, we use PBKDF2 (Password-Based Key Derivation
                    Function 2) with 100,000 iterations and SHA-256 to derive an encryption key from your password. This
                    makes brute force attacks computationally expensive and protects against rainbow table attacks.
                  </p>
                </div>

                <div>
                  <h3 className="text-emerald-300 text-sm font-medium mb-1">Client-Side Security</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    All encryption and decryption happens in your browser using the Web Crypto API, a secure and
                    standardized browser API for cryptographic operations. Your password and unencrypted message content
                    never leave your device.
                  </p>
                </div>

                <div>
                  <h3 className="text-emerald-300 text-sm font-medium mb-1">Database Storage</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Only encrypted data is stored in the database. Even if the database were compromised, the attacker
                    would only have access to encrypted content that cannot be decrypted without the correct password.
                    Additionally, messages are permanently deleted after being viewed once.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-emerald-400 mb-2">Host Your Own Messages</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For maximum privacy and control, you can host your messages on your own Supabase instance. This ensures
                that you have complete ownership over your data storage.
              </p>

              <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
                <h3 className="text-emerald-400 text-sm font-medium mb-2">Setting Up Your Own Supabase Instance</h3>
                <ol className="text-sm text-gray-400 space-y-2 list-decimal pl-4">
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
                      <li>viewed: boolean (default: false)</li>
                      <li>created_at: timestamp with time zone (default: now())</li>
                    </ul>
                  </li>
                  <li>
                    Create a table named "user_settings" with the following columns:
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>id: uuid (primary key)</li>
                      <li>user_id: uuid (foreign key to auth.users)</li>
                      <li>custom_supabase_url: text (nullable)</li>
                      <li>custom_supabase_key: text (nullable)</li>
                      <li>created_at: timestamp with time zone (default: now())</li>
                    </ul>
                  </li>
                  <li>Register for an account in the application</li>
                  <li>Go to Settings and enter your Supabase URL and API key</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

