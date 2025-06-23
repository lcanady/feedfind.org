import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { VolunteerOpportunity } from '@/types/database'
import { VolunteerService } from '@/lib/communityService'
import { Timestamp } from 'firebase/firestore'

interface VolunteerManagementProps {
  providerId: string
}

export const VolunteerManagement: React.FC<VolunteerManagementProps> = ({ providerId }) => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const volunteerService = useMemo(() => new VolunteerService(), [])

  useEffect(() => {
    const unsubscribe = volunteerService.subscribeToOpportunities((updatedOpportunities) => {
      // Filter opportunities for this provider
      const providerOpportunities = updatedOpportunities.filter(
        opp => opp.organizationId === providerId
      )
      setOpportunities(providerOpportunities)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [providerId, volunteerService])

  const handleApproveRegistration = async (opportunityId: string, userId: string) => {
    try {
      setActionLoading(`${opportunityId}-${userId}`)
      await volunteerService.updateRegistrationStatus(opportunityId, userId, 'approved')
    } catch (error) {
      console.error('Error approving registration:', error)
      setError(error instanceof Error ? error.message : 'Failed to approve registration')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeclineRegistration = async (opportunityId: string, userId: string) => {
    try {
      setActionLoading(`${opportunityId}-${userId}`)
      await volunteerService.updateRegistrationStatus(opportunityId, userId, 'declined')
    } catch (error) {
      console.error('Error declining registration:', error)
      setError(error instanceof Error ? error.message : 'Failed to decline registration')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading volunteer opportunities...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button
          onClick={() => setError(null)}
          className="text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No volunteer opportunities found.</p>
        <Link
          href="/community/volunteer/post"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          Create a Volunteer Opportunity
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Volunteer Management</h2>
        <p className="text-gray-600">Manage volunteer registrations for your opportunities</p>
      </div>

      <div className="space-y-6">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {opportunity.title}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>{opportunity.spotsRegistered || 0} of {opportunity.spotsTotal} spots filled</span>
                <span>•</span>
                <span>{opportunity.location}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Registrations</h4>
                
                {opportunity.registrations && Object.entries(opportunity.registrations).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(opportunity.registrations).map(([userId, registration]) => (
                      <div
                        key={userId}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">Volunteer #{userId.slice(-6)}</div>
                          <div className="text-sm text-gray-500">
                            Registered {new Date(registration.registeredAt instanceof Timestamp ? registration.registeredAt.toMillis() : registration.registeredAt).toLocaleDateString()}
                          </div>
                          <div className={`text-sm ${
                            registration.status === 'approved' ? 'text-green-600' :
                            registration.status === 'declined' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            Status: {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                          </div>
                        </div>

                        {registration.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveRegistration(opportunity.id, userId)}
                              disabled={actionLoading === `${opportunity.id}-${userId}`}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading === `${opportunity.id}-${userId}` ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleDeclineRegistration(opportunity.id, userId)}
                              disabled={actionLoading === `${opportunity.id}-${userId}`}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                              {actionLoading === `${opportunity.id}-${userId}` ? 'Processing...' : 'Decline'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No registrations yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 