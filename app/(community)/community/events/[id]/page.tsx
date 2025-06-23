'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'
import { CommunityEventsService } from '@/lib/communityService'
import { useAuth } from '@/hooks/useAuth'
import type { CommunityEvent } from '@/types/database'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default function EventDetailPage({ params }: Props) {
  const { id: eventId } = React.use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<CommunityEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventsService = new CommunityEventsService()
        const eventData = await eventsService.getEvent(eventId)
        if (!eventData) {
          setError('Event not found')
          return
        }
        setEvent(eventData)
      } catch (err) {
        console.error('Error loading event:', err)
        setError('Failed to load event details')
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const handleDelete = async () => {
    if (!event || !confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setDeleteLoading(true)
    try {
      const eventsService = new CommunityEventsService()
      await eventsService.delete(event.id)
      router.push('/community/events')
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <HeaderAd />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-gray-200 h-32 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <HeaderAd />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-red-600 text-xl font-semibold mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Event not found'}</p>
            <Link
              href="/community/events"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <HeaderAd />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/community/events" className="hover:text-gray-700">
                Events
              </Link>
            </li>
            <li>•</li>
            <li className="truncate">{event.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.eventStatus === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.eventStatus === 'ongoing' ? 'bg-green-100 text-green-800' :
                      event.eventStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.eventStatus}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}>
                      {event.type}
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-600">{event.description}</p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Date & Time</h2>
                    <p className="text-gray-600">
                      {formatDate(event.startDate)}<br />
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Location</h2>
                    <p className="text-gray-600">
                      {event.location}<br />
                      {event.address}
                      {event.isVirtual && <span className="ml-2 text-blue-600">(Virtual Event)</span>}
                    </p>
                  </div>
                </div>

                {event.registrationRequired && (
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Registration</h2>
                    {event.registrationUrl ? (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Register Now
                      </a>
                    ) : (
                      <p className="text-gray-600">Registration is required for this event. Please contact the organizer for details.</p>
                    )}
                  </div>
                )}

                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Organizer</h2>
                  <p className="text-gray-600">
                    {event.organization}<br />
                    {event.contactEmail && (
                      <a href={`mailto:${event.contactEmail}`} className="text-blue-600 hover:text-blue-800">
                        {event.contactEmail}
                      </a>
                    )}
                    {event.contactPhone && (
                      <>
                        <br />
                        <a href={`tel:${event.contactPhone}`} className="text-blue-600 hover:text-blue-800">
                          {event.contactPhone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Action Buttons */}
            {user && event.createdBy === user.uid && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Manage Event</h3>
                <div className="space-y-3">
                  <Link
                    href={`/community/events/edit/${event.id}`}
                    prefetch={false}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Event
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </div>
            )}

            {/* Share Event */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share Event</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const url = window.location.href
                    navigator.clipboard.writeText(url)
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Share on Twitter
                </a>
              </div>
            </div>

            {/* Sidebar Ad */}
            <div className="mt-6">
              <SidebarAd />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <FooterAd />
    </main>
  )
} 