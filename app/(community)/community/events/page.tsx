'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Event {
  id: string
  title: string
  organization: string
  description: string
  date: string
  time: string
  location: string
  address: string
  type: 'distribution' | 'meal' | 'workshop' | 'fundraiser'
  capacity?: number
  registered?: number
  requirements?: string[]
  contact: string
  status: 'upcoming' | 'today' | 'ongoing'
}

export default function EventsPage() {
  const [filter, setFilter] = useState<string>('all')

  const events: Event[] = [
    {
      id: '1',
      title: 'Weekend Mobile Food Pantry',
      organization: 'Community Food Bank',
      description: 'Free groceries and fresh produce distribution. First come, first served. Bring your own bags.',
      date: '2025-01-18',
      time: '9:00 AM - 12:00 PM',
      location: 'Lincoln Park Community Center',
      address: '123 Main St, Los Angeles, CA 90012',
      type: 'distribution',
      capacity: 200,
      registered: 45,
      requirements: ['ID required', 'Proof of residence'],
      contact: 'volunteer@communityfoodbank.org',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Free Community Breakfast',
      organization: 'Hope Chapel',
      description: 'Hot breakfast served to anyone in need. No registration required. Family-friendly environment.',
      date: '2025-01-15',
      time: '7:00 AM - 9:30 AM',
      location: 'Hope Chapel Community Hall',
      address: '456 Oak Ave, Los Angeles, CA 90015',
      type: 'meal',
      contact: 'breakfast@hopechapel.org',
      status: 'today'
    },
    {
      id: '3',
      title: 'SNAP Benefits Information Workshop',
      organization: 'LA County Social Services',
      description: 'Learn how to apply for SNAP benefits, required documents, and get help with your application.',
      date: '2025-01-20',
      time: '2:00 PM - 4:00 PM',
      location: 'East LA Community Center',
      address: '789 Cesar Chavez Ave, Los Angeles, CA 90033',
      type: 'workshop',
      capacity: 50,
      registered: 32,
      requirements: ['Bring income documents', 'ID required'],
      contact: 'workshop@lacounty.gov',
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Holiday Food Drive Collection',
      organization: 'Santa Monica Community Center',
      description: 'Help us collect food donations for families in need during the holiday season.',
      date: '2025-01-25',
      time: '10:00 AM - 6:00 PM',
      location: 'Santa Monica Pier',
      address: '200 Santa Monica Pier, Santa Monica, CA 90401',
      type: 'fundraiser',
      contact: 'events@smcommunitycenter.org',
      status: 'upcoming'
    },
    {
      id: '5',
      title: 'Senior Nutrition Program Lunch',
      organization: 'Meals for Seniors',
      description: 'Nutritious lunch program for seniors 60+. Social interaction and community support.',
      date: '2025-01-15',
      time: '11:30 AM - 1:00 PM',
      location: 'Westside Senior Center',
      address: '321 Wilshire Blvd, Santa Monica, CA 90401',
      type: 'meal',
      requirements: ['Must be 60 or older', 'Call ahead to reserve'],
      contact: 'lunch@mealsforseniors.org',
      status: 'ongoing'
    }
  ]

  const filteredEvents = filter === 'all' 
    ? events 
    : filter === 'today'
    ? events.filter(event => event.status === 'today')
    : events.filter(event => event.type === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'today':
        return 'bg-red-100 text-red-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
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
      case 'meal':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      {/* Header */}
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
                  Today ({events.filter(e => e.status === 'today').length})
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
                  onClick={() => setFilter('meal')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'meal'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Community Meals ({events.filter(e => e.type === 'meal').length})
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
              </div>
            </div>

            {/* Submit Event */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Post an Event</h3>
              <p className="text-sm text-gray-600 mb-4">
                Hosting a food assistance event? Share it with the community.
              </p>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Post Event
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-blue-600">
                          {getTypeIcon(event.type)}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status === 'today' ? 'Today' : event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">by {event.organization}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{event.description}</p>

                  {/* Event Details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <div>{event.location}</div>
                          <div className="text-xs text-gray-500">{event.address}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity and Requirements */}
                  {(event.capacity || event.requirements) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      {event.capacity && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Capacity:</span>
                          <span className="text-sm text-gray-600">
                            {event.registered || 0} / {event.capacity} registered
                          </span>
                        </div>
                      )}
                      {event.requirements && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Requirements:</span>
                          <ul className="mt-1 text-sm text-gray-600">
                            {event.requirements.map((req, index) => (
                              <li key={index} className="flex items-center">
                                <span className="mr-2">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <a 
                        href={`mailto:${event.contact}?subject=Event Inquiry: ${event.title}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Contact Organizer
                      </a>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Get Directions
                      </button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="hover:text-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Share
                      </button>
                      <button className="hover:text-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Load more events
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