'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useCommunityData } from '@/hooks/useCommunity'
import { AdSense, HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'

export default function CommunityPage() {
  const { 
    stats, 
    recentActivity, 
    recentPosts, 
    upcomingEvents, 
    featuredOpportunities, 
    popularResources, 
    loading 
  } = useCommunityData()
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Header Ad */}
      <HeaderAd />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FeedFind Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with others, share resources, volunteer your time, and build a stronger food assistance network in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/community/forums"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Join the Discussion
              </Link>
              <Link 
                href="/community/volunteer"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Find Volunteer Opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Community Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link 
            href="/community/forums"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Forums</h3>
            <p className="text-gray-600 text-sm">
              Share experiences, ask questions, and connect with others navigating food assistance resources.
            </p>
          </Link>

          <Link 
            href="/community/volunteer"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Volunteer Opportunities</h3>
            <p className="text-gray-600 text-sm">
              Find ways to give back to your community and help strengthen the food assistance network.
            </p>
          </Link>

          <Link 
            href="/community/resources"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Guides</h3>
            <p className="text-gray-600 text-sm">
              Access community-created guides and helpful resources for navigating food assistance.
            </p>
          </Link>

          <Link 
            href="/community/events"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Events</h3>
            <p className="text-gray-600 text-sm">
              Discover local food distributions, community meals, and other food assistance events.
            </p>
          </Link>
        </div>

        {/* Mid-page Ad */}
        <div className="mb-12">
          <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
          <AdSense
            adSlot="1234567898"
            adFormat="horizontal"
            className="text-center"
            style={{ minHeight: '90px', backgroundColor: '#f9fafb' }}
          />
        </div>

        {/* Community Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Community Impact</h2>
          {loading ? (
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-gray-300 rounded w-24 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalMembers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Community Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.volunteerHours.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Volunteer Hours</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalResources.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Resources Shared</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">{stats.totalEvents.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Active Events</div>
              </div>
            </div>
          )}
        </div>

        {/* Community Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Respectful Communication</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Treat everyone with dignity and respect
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Use inclusive and non-judgmental language
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Avoid sharing personal financial information
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Helpful Participation</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Share accurate and helpful information
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Respect privacy and confidentiality
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Report any concerning content to moderators
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Ad Container */}
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Recent Activity - takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Community Activity</h2>
              <div className="space-y-4">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-64"></div>
                        <div className="h-3 bg-gray-300 rounded w-20 mt-2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivity.map((activity) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'post': return { bg: 'bg-blue-100', text: 'text-blue-600', initials: activity.author.split(' ').map(n => n[0]).join('') }
                        case 'resource': return { bg: 'bg-purple-100', text: 'text-purple-600', initials: activity.author.split(' ').map(n => n[0]).join('') }
                        case 'event': return { bg: 'bg-amber-100', text: 'text-amber-600', initials: activity.author.split(' ').map(n => n[0]).join('') }
                        case 'opportunity': return { bg: 'bg-green-100', text: 'text-green-600', initials: activity.author.split(' ').map(n => n[0]).join('') }
                        default: return { bg: 'bg-gray-100', text: 'text-gray-600', initials: activity.author.split(' ').map(n => n[0]).join('') }
                      }
                    }
                    
                    const getActivityDescription = (type: string) => {
                      switch (type) {
                        case 'post': return 'posted in forum'
                        case 'resource': return 'shared a resource'
                        case 'event': return 'created an event'
                        case 'opportunity': return 'posted a volunteer opportunity'
                        default: return 'activity'
                      }
                    }

                    const icon = getActivityIcon(activity.type)
                    const timeAgo = Math.floor((Date.now() - activity.date.getTime()) / (1000 * 60 * 60))

                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 ${icon.bg} rounded-full flex items-center justify-center`}>
                          <span className={`text-sm font-medium ${icon.text}`}>{icon.initials}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-1">{activity.author} {getActivityDescription(activity.type)}</div>
                          <div className="text-gray-900 font-medium">"{activity.title}"</div>
                          <div className="text-xs text-gray-500 mt-1">{timeAgo} hours ago</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href="/community/forums"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar - takes 1 column */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Sidebar Ad */}
              <SidebarAd />
              
              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href="/community/forums"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Start a Discussion
                  </Link>
                  <Link 
                    href="/community/volunteer"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Find Volunteer Work
                  </Link>
                  <Link 
                    href="/community/events"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Post an Event
                  </Link>
                  <Link 
                    href="/community/resources"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    Share a Resource
                  </Link>
                </div>
              </div>

              {/* Another Sidebar Ad */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
                <AdSense
                  adSlot="1234567899"
                  adFormat="rectangle"
                  className="text-center"
                  style={{ minHeight: '200px', backgroundColor: '#f9fafb' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <FooterAd />

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