'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requireProvider?: boolean
  requireAdmin?: boolean
  loadingComponent?: ReactNode
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireProvider = false,
  requireAdmin = false,
  loadingComponent
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, isProvider, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Don't redirect while loading

    // Check authentication
    if (!isAuthenticated) {
      router.push(redirectTo as any)
      return
    }

    // Check provider role if required
    if (requireProvider && !isProvider) {
      router.push(redirectTo as any)
      return
    }

    // Check admin role if required
    if (requireAdmin && !isAdmin) {
      router.push(redirectTo as any)
      return
    }
  }, [loading, isAuthenticated, isProvider, isAdmin, requireProvider, requireAdmin, redirectTo, router])

  // Show loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or missing required roles
  if (!isAuthenticated) {
    return null
  }

  if (requireProvider && !isProvider) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  // Render protected content
  return <>{children}</>
} 