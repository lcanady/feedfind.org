'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSetup } from '../../hooks/useSetup'
import { useAuth } from '../../hooks/useAuth'
import SetupScreen from './SetupScreen'

interface SetupWrapperProps {
  children: ReactNode
}

export default function SetupWrapper({ children }: SetupWrapperProps) {
  const { needsSetup, loading: setupLoading, error: setupError } = useSetup()
  const { loading: authLoading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Always show loading on first render (SSR) and while checking setup status
  if (!isClient || setupLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FeedFind...</p>
        </div>
      </div>
    )
  }

  // Show error state if setup check failed
  if (setupError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-red-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Setup Check Failed
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {setupError}
                </p>
                <p className="mt-2 text-sm text-red-700">
                  Please refresh the page or contact support if the problem persists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show setup screen if no users exist
  if (needsSetup) {
    return <SetupScreen />
  }

  // Show normal app
  return <>{children}</>
} 