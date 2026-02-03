'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { App } from '../components/App'
import { Toaster } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Get user from localStorage (set during login)
        const user = localStorage.getItem('user')
        
        if (!user) {
          router.push('/login')
          return
        }

        // User is authenticated, load dashboard
        setIsLoading(false)
      } catch (error) {
        console.error('Auth verification error:', error)
        router.push('/login')
      }
    }

    verifyAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <App />
      <Toaster position="top-right" />
    </>
  )
}
