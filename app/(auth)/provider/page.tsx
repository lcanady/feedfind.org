'use client'

import { useAuth } from '../../../hooks/useAuth'
import { ProviderDashboard } from '../../../components/provider/ProviderDashboard'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import Link from 'next/link'

export default function ProviderPage() {
  const { user, isProvider, isAdminOrSuperuser, loading } = useAuth()

  // For providers, use their own ID. For admins, we'll need to handle provider selection
  const providerId = user?.uid || ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireProvider={false}>
      <div className="min-h-screen bg-gray-50">
        {(isProvider || isAdminOrSuperuser) ? (
          <ProviderDashboard 
            providerId={providerId}
            onLocationUpdate={(locationId, data) => {
              console.log('Location updated:', locationId, data)
            }}
            onStatusUpdate={(locationId, status) => {
              console.log('Status updated:', locationId, status)
            }}
          />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md mx-auto text-center p-8">
              <div className="mb-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Access Required</h1>
                <p className="text-gray-600 mb-6">
                  You need to be a verified food provider to access this dashboard.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Are you a food provider?</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Register your organization to help connect people with food assistance in your community.
                  </p>
                  <Link 
                    href="/register" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register as Provider
                  </Link>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Already registered?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your provider account may still be pending approval. Contact support if you need assistance.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      <strong>Email:</strong> support@feedfind.org
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Phone:</strong> (555) 123-FEED
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link 
                    href="/" 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 