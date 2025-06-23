'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useVolunteerOpportunities } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import { HeaderAd, SidebarAd, AdSense } from '@/components/ui/AdSense'
import { formatDistanceToNow } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export default function VolunteerPage() {
  const [filter, setFilter] = useState<string>('all')
  const { opportunities, loading, error, registerForOpportunity, cancelRegistration, isRegistered } = useVolunteerOpportunities(filter)
  const { user } = useAuth()
  const [registrationStatus, setRegistrationStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({})
  const [statusMessages, setStatusMessages] = useState<{[key: string]: string}>({})

  const handleRegistration = async (opportunityId: string) => {
    if (!user) {
      setStatusMessages(prev => ({
        ...prev,
        [opportunityId]: 'Please log in to register for this opportunity'
      }))
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'error'
      }))
      return
    }

    try {
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'loading'
      }))
      await registerForOpportunity(opportunityId)
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'success'
      }))
      setStatusMessages(prev => ({
        ...prev,
        [opportunityId]: 'Successfully registered!'
      }))
    } catch (error) {
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'error'
      }))
      setStatusMessages(prev => ({
        ...prev,
        [opportunityId]: error instanceof Error ? error.message : 'Failed to register'
      }))
    }
  }

  const handleCancelRegistration = async (opportunityId: string) => {
    if (!user) {
      setStatusMessages(prev => ({
        ...prev,
        [opportunityId]: 'Please log in to cancel your registration'
      }))
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'error'
      }))
      return
    }

    try {
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'loading'
      }))
      await cancelRegistration(opportunityId)
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'success'
      }))
      setStatusMessages(prev => ({
        ...prev,
        [opportunityId]: 'Registration cancelled'
      }))
    } catch (error) {
      setRegistrationStatus(prev => ({
        ...prev,
        [opportunityId]: 'error'
      }))
      setStatusMessages(prev => ({
        ...prev,
        [opportunityId]: error instanceof Error ? error.message : 'Failed to cancel registration'
      }))
    }
  }

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'Recently'
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    return formatDistanceToNow(date, { addSuffix: true })
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
    <main id="main-content" className="min-h-screen bg-white">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/community" className="hover:text-blue-600">Community</Link>
            <span className="mx-2">/</span>
            <span>Volunteer Opportunities</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Opportunities</h1>
          <p className="text-gray-600 max-w-3xl">
            Make a difference in your community by volunteering with local food assistance organizations. 
            Whether you have a few hours a week or want to help with special events, there's an opportunity for you.
          </p>
        </div>
        
        {/* Top Banner Ad */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <HeaderAd />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Opportunities</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Opportunities ({opportunities.length})
                </button>
                <button
                  onClick={() => setFilter('urgent')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Urgent Need ({opportunities.filter(o => o.urgency === 'urgent').length})
                </button>
                <button
                  onClick={() => setFilter('ongoing')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'ongoing'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Ongoing ({opportunities.filter(o => o.isOngoing).length})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'available'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Available Spots ({opportunities.filter(o => o.spotsAvailable && o.spotsAvailable > 0).length})
                </button>
                <button
                  onClick={() => setFilter('events')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'events'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Special Events ({opportunities.filter(o => o.category === 'events').length})
                </button>
              </div>
            </div>

            {/* Sidebar Ad */}
            <div className="mb-6">
              <SidebarAd />
            </div>

            {/* Volunteer Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Volunteer?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Make a direct impact in your community
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Meet like-minded people and build connections
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Gain valuable skills and experience
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Feel good about giving back
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Flexible schedules to fit your life
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading opportunities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">Error loading opportunities</div>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No opportunities found with the selected filter.</p>
              </div>
            ) : (
              <>
                {/* Call to Action for Organizations */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Post a Volunteer Opportunity</h3>
                      <p className="text-gray-600 mb-4">
                        Are you a food assistance organization looking for volunteers? Post your opportunities to reach motivated community members.
                      </p>
                      <Link
                        href="/community/volunteer/post"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Post Opportunity
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Opportunities List */}
                <div className="space-y-6">
                  {opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Status Message */}
                      {statusMessages[opportunity.id] && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                          registrationStatus[opportunity.id] === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {statusMessages[opportunity.id]}
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Link href={`/community/volunteer/${opportunity.id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{opportunity.title}</h3>
                            </Link>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(opportunity.urgency)}`}>
                              {getUrgencyLabel(opportunity.urgency)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {opportunity.organization}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {opportunity.location}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {opportunity.timeCommitment}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Posted {formatDate(opportunity.createdAt)}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{opportunity.description}</p>

                      {/* Skills */}
                      {opportunity.skills && opportunity.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills & Requirements:</h4>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.skills.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          {registrationStatus[opportunity.id] === 'loading' ? (
                            <div className="animate-pulse flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
                              <span className="text-gray-500">Processing...</span>
                            </div>
                          ) : isRegistered(opportunity) ? (
                            <button
                              onClick={() => handleCancelRegistration(opportunity.id)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Cancel Registration
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegistration(opportunity.id)}
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
                          <Link
                            href={`/community/volunteer/${opportunity.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {opportunity.spotsTotal && (
                            <span>
                              {opportunity.spotsAvailable || 0} of {opportunity.spotsTotal} spots available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Load more opportunities
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">about</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">help & FAQ</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">safety tips</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">terms of use</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">privacy policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
              <ul className="space-y-1">
                <li><Link href="/add-organization" className="text-blue-600 hover:underline">add your organization</Link></li>
                <li><Link href="/update-listing" className="text-blue-600 hover:underline">update your listing</Link></li>
                <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                <li><Link href="/bulkposting" className="text-blue-600 hover:underline">bulk posting</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">community</h3>
              <ul className="space-y-1">
                <li><Link href="/community/volunteer" className="text-blue-600 hover:underline">volunteer opportunities</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">donate to local organizations</a></li>
                <li><Link href="/community/forums" className="text-blue-600 hover:underline">community forums</Link></li>
                <li><Link href="/community/resources" className="text-blue-600 hover:underline">resource guides</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">contact</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">report an issue</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">suggest improvements</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">partnership inquiries</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2025 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </main>
  )
} 