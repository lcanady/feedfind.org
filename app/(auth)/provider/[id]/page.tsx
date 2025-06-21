'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '../../../../hooks/useAuth'
import { ProviderDashboard } from '../../../../components/provider/ProviderDashboard'
import ProtectedRoute from '../../../../components/auth/ProtectedRoute'

export default function ProviderByIdPage() {
  const params = useParams()
  const providerId = params.id as string
  const { user, isProvider, isAdminOrSuperuser } = useAuth()

  // Check if user has access to view this provider's dashboard
  const hasAccess = () => {
    if (!user) return false
    
    // Providers can only view their own dashboard
    if (isProvider && user.uid === providerId) return true
    
    // Admins and superusers can view any provider dashboard
    if (isAdminOrSuperuser) return true
    
    return false
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {hasAccess() ? (
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
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to view this provider's dashboard.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Providers can only view their own dashboard.
                </p>
                <p className="text-sm text-gray-500">
                  Administrators can view any provider dashboard.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 