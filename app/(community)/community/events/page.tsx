'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'
import { CommunityEventsService } from '@/lib/communityService'
import { CommunityEvent } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const eventsService = new CommunityEventsService()
    
    // Subscribe to events with real-time updates
    const unsubscribe = eventsService.subscribeToEvents((updatedEvents) => {
      // Sort events by start date
      const sortedEvents = [...updatedEvents].sort((a, b) => {
        const dateA = a.startDate instanceof Date ? a.startDate : a.startDate.toDate()
        const dateB = b.startDate instanceof Date ? b.startDate : b.startDate.toDate()
        return dateA.getTime() - dateB.getTime()
      })
      
      setEvents(sortedEvents)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const getEventStatus = (event: CommunityEvent): 'upcoming' | 'today' | 'ongoing' | 'completed' => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()
    const nowInUserTz = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }))
    
    const startDate = event.startDate instanceof Date ? event.startDate : event.startDate.toDate()
    const endDate = event.endDate instanceof Date ? event.endDate : event.endDate.toDate()
    
    const startInUserTz = new Date(startDate.toLocaleString('en-US', { timeZone: userTimezone }))
    const endInUserTz = new Date(endDate.toLocaleString('en-US', { timeZone: userTimezone }))

    // Check if the event is today
    const isToday = startInUserTz.getDate() === nowInUserTz.getDate() &&
      startInUserTz.getMonth() === nowInUserTz.getMonth() &&
      startInUserTz.getFullYear() === nowInUserTz.getFullYear()

    if (isToday) {
      return 'today'
    } else if (startInUserTz > nowInUserTz) {
      return 'upcoming'
    } else if (endInUserTz > nowInUserTz) {
      return 'ongoing'
    }
    
    return 'completed'
  }

  const filteredEvents = filter === 'all' 
    ? events 
    : filter === 'today'
    ? events.filter(event => getEventStatus(event) === 'today')
    : filter === 'completed'
    ? events.filter(event => getEventStatus(event) === 'completed')
    : events.filter(event => event.type === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'today':
        return 'bg-red-100 text-red-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distribution':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'workshop':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'fundraiser':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const dateObj = date instanceof Date ? date : date.toDate()
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (date: Date | { toDate: () => Date }) => {
    const dateObj = date instanceof Date ? date : date.toDate()
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleEventClick = (eventId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on a link inside the card
    if ((e.target as HTMLElement).closest('a')) {
      return
    }
    router.push(`/community/events/${eventId}`)
  }

  if (loading) {
    return (
      <main id="main-content" className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main id="main-content" className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Events</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/community" className="hover:text-blue-600">Community</Link>
            <span className="mx-2">/</span>
            <span>Events</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Events</h1>
          <p className="text-gray-600 max-w-3xl">
            Discover local food assistance events, community meals, workshops, and opportunities to help in your area.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Events</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Events ({events.length})
                </button>
                <button
                  onClick={() => setFilter('today')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'today'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Today ({events.filter(e => getEventStatus(e) === 'today').length})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Completed ({events.filter(e => getEventStatus(e) === 'completed').length})
                </button>
                <button
                  onClick={() => setFilter('distribution')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'distribution'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Food Distributions ({events.filter(e => e.type === 'distribution').length})
                </button>
                <button
                  onClick={() => setFilter('workshop')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'workshop'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Workshops ({events.filter(e => e.type === 'workshop').length})
                </button>
                <button
                  onClick={() => setFilter('fundraiser')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'fundraiser'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Fundraisers ({events.filter(e => e.type === 'fundraiser').length})
                </button>
              </div>
            </div>

            {/* Submit Event */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Post an Event</h3>
              <p className="text-sm text-gray-600 mb-4">
                Hosting a food assistance event? Share it with the community.
              </p>
              <Link
                href={user 
                  ? { pathname: '/community/events/new' }
                  : { pathname: '/login', query: { redirect: '/community/events/new' } }
                }
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Post Event
              </Link>
            </div>

            {/* Sidebar Ad */}
            <div className="mt-6">
              <SidebarAd />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Top Banner Ad */}
            <HeaderAd />

            {/* Events List */}
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={(e) => handleEventClick(event.id, e)}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/community/events/${event.id}`)
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(getEventStatus(event))
                        }`}>
                          {getEventStatus(event)}
                        </span>
                        <span className="inline-flex items-center text-gray-500">
                          {getTypeIcon(event.type)}
                          <span className="ml-1 text-sm capitalize">{event.type}</span>
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">{event.title}</h3>
                      <p className="mt-1 text-gray-600">{event.description}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(event.startDate)}<br />
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </p>
                        </div>
                        {!event.isVirtual && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Location</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {event.location}
                              {event.address && <br />}
                              {event.address}
                            </p>
                          </div>
                        )}
                        {event.isVirtual && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Event Type</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              Virtual Event
                            </p>
                          </div>
                        )}
                      </div>

                      {event.registrationRequired && (
                        <div className="mt-4">
                          <span className="text-sm text-gray-500">Registration required</span>
                          {event.registrationUrl && (
                            <a 
                              href={event.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-3 text-sm text-blue-600 hover:text-blue-800"
                            >
                              Register here →
                            </a>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>Organized by {event.organization}</span>
                        {event.contactEmail && (
                          <>
                            <span className="mx-2">•</span>
                            <a 
                              href={`mailto:${event.contactEmail}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Contact organizer
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? 'There are no upcoming events at this time.'
                      : `There are no ${filter} events at this time.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Banner Ad */}
            <FooterAd />
          </div>
        </div>
      </div>
    </main>
  )
} 