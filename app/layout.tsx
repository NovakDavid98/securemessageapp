import './globals.css'
import type { Metadata } from 'next'
import { NavHeader } from '@/components/nav-header'
import { MatrixBackground } from '@/components/matrix-background'

export const metadata: Metadata = {
  title: 'Secure Message Exchange',
  description: 'Exchange encrypted messages securely',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <MatrixBackground />
        <div className="relative z-10">
          <NavHeader />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}