"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Shield, LogIn, UserPlus, Info } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type NavLinkProps = {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
    >
      {children}
    </Link>
  )
}

export function NavHeader() {
  const { user } = useAuth()

  return (
    <header className="bg-gray-800 shadow-md mb-6">
    <div className="flex justify-between items-center mb-6 w-full">
      <div className="flex items-center">
        <Shield className="h-8 w-8 text-emerald-500 mr-2" />
        <h1 className="text-2xl font-bold text-emerald-500">Secure Message Exchange</h1>
      </div>
      <div className="flex gap-2">
        <Link href="/about">
          <Button variant="ghost" className="text-gray-400 hover:text-gray-300">
            <Info className="h-4 w-4 mr-2" /> About
          </Button>
        </Link>

        {user ? (
          <Link href="/dashboard">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-gray-400 hover:text-gray-300">
                <LogIn className="h-4 w-4 mr-2" /> Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" /> Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

