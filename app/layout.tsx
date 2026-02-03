import type { Metadata } from 'next'
import './globals.css'
import { AuthProviderWrapper } from './components/AuthProviderWrapper'

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description: 'Sistem Manajemen Inventaris',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50">
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  )
}
