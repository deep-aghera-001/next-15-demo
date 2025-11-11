'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuthStatus } from '@/actions/auth'

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await checkAuthStatus()
      
      if (!isAuthenticated) {
        router.push(redirectTo)
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <>{children}</>
}