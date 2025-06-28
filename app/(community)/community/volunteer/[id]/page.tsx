'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { useVolunteerOpportunity } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import { HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'

export default function VolunteerOpportunityPage() {
  const params = useParams()
  const opportunityId = params.id as string
  const { user } = useAuth()
  const {
    opportunity,
    loading,
    error,
    register,
    cancelRegistration,
    isRegistered
  } = useVolunteerOpportunity(opportunityId)

  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleRegistration = async () => {
    if (!user) {
      setStatusMessage('Please log in to register for this opportunity')
      setRegistrationStatus('error')
      return
    }

    try {
      setRegistrationStatus('loading')
      await register()
      setRegistrationStatus('success')
      setStatusMessage('Successfully registered!')
    } catch (error) {
      setRegistrationStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Failed to register')
    }
  }

  const handleCancelRegistration = async () => {
    if (!user) {
      setStatusMessage('Please log in to cancel your registration')
      setRegistrationStatus('error')
      return
    }

    try {
      setRegistrationStatus('loading')
      await cancelRegistration()
      setRegistrationStatus('success')
      setStatusMessage('Registration cancelled')
    } catch (error) {
      setRegistrationStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Failed to cancel registration')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <HeaderAd />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading opportunity details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <HeaderAd />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading opportunity</div>
            <p className="text-gray-600">{error || 'Opportunity not found'}</p>
            <Link href="/community/volunteer" className="mt-4 inline-block text-blue-600 hover:underline">
              Return to opportunities
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const formatTimeAgo = (date: Date | any) => {
    if (!date) return 'Unknown'
    const actualDate = date instanceof Date ? date : date.toDate()
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks === 1) return '1 week ago'
    return `${diffInWeeks} weeks ago`
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'Urgent Need'
      case 'high':
        return 'High Priority'
      case 'normal':
        return 'Normal'
      case 'low':
        return 'Low Priority'
      default:
        return urgency
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Top Banner Ad */}
      <HeaderAd />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <main>
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-500 mb-6">
                <Link href="/community" className="hover:text-blue-600">Community</Link>
                <span className="mx-2">/</span>
                <Link href="/community/volunteer" className="hover:text-blue-600">Volunteer Opportunities</Link>
                <span className="mx-2">/</span>
                <span>{opportunity.title}</span>
              </nav>

              {/* Status Message */}
              {statusMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  registrationStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {statusMessage}
                </div>
              )}

              {/* Opportunity Details */}
              <article className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(opportunity.urgency)}`}>
                      {getUrgencyLabel(opportunity.urgency)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {opportunity.category.replace('_', ' ')}
                    </span>
                    {opportunity.isOngoing && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Ongoing Opportunity
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{opportunity.title}</h1>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium text-gray-900">{opportunity.organization}</div>
                        <div className="text-sm text-gray-500">
                          Posted {formatTimeAgo(opportunity.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Show edit button if user is the creator or manages the organization */}
                      {user && opportunity.createdBy === user.uid && (
                        <Link
                          href={`/community/volunteer/edit/${opportunity.id}`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Opportunity
                        </Link>
                      )}
                      <div className="text-right">
                        {opportunity.spotsTotal && (
                          <div className="text-sm text-gray-500">
                            {opportunity.spotsAvailable || 0} of {opportunity.spotsTotal} spots available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Location</div>
                        <div className="text-gray-600">{opportunity.location}</div>
                        {opportunity.isRemote && (
                          <div className="text-sm text-green-600">Remote opportunity available</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Time Commitment</div>
                        <div className="text-gray-600">{opportunity.timeCommitment}</div>
                        {opportunity.schedule && (
                          <div className="text-sm text-gray-500">{opportunity.schedule}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a3 3 0 110-6 3 3 0 010 6zm-7 4a7 7 0 1114 0H3z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Requirements</div>
                        <div className="text-gray-600">
                          {opportunity.backgroundCheckRequired && (
                            <div className="text-sm">Background check required</div>
                          )}
                          {opportunity.trainingRequired && (
                            <div className="text-sm">Training provided</div>
                          )}
                          {opportunity.ageRestriction && (
                            <div className="text-sm">Age requirement: {opportunity.ageRestriction}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Contact</div>
                        <div className="text-gray-600">{opportunity.contactEmail}</div>
                        {opportunity.contactPhone && (
                          <div className="text-gray-600">{opportunity.contactPhone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Opportunity</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>

                {/* Skills & Requirements */}
                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Qualifications</h2>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {opportunity.requirements && opportunity.requirements.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {opportunity.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Registration Section */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Ready to Help?</h2>
                      <p className="text-gray-600 mt-1">
                        {isRegistered
                          ? 'You are registered for this opportunity'
                          : 'Register now to make a difference in your community'}
                      </p>
                    </div>
                    
                    {registrationStatus === 'loading' ? (
                      <div className="animate-pulse flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
                        <span className="text-gray-500">Processing...</span>
                      </div>
                    ) : isRegistered ? (
                      <button
                        onClick={handleCancelRegistration}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel Registration
                      </button>
                    ) : (
                      <button
                        onClick={handleRegistration}
                        disabled={!opportunity.spotsAvailable || opportunity.spotsAvailable <= 0}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                          opportunity.spotsAvailable && opportunity.spotsAvailable > 0
                            ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {opportunity.spotsAvailable && opportunity.spotsAvailable > 0
                          ? 'Register Now'
                          : 'No Spots Available'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
              
              {/* Bottom Banner Ad */}
              <FooterAd />
            </main>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Sidebar Ad */}
              <SidebarAd />
              
              {/* Additional sidebar content can go here */}
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/community/volunteer" className="text-blue-600 hover:text-blue-800">
                      Browse More Opportunities
                    </Link>
                  </li>
                  <li>
                    <Link href="/community/volunteer/post" className="text-blue-600 hover:text-blue-800">
                      Post an Opportunity
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 