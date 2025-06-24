'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd } from '@/components/ui/AdSense'
import { useCommunityResource } from '@/hooks/useCommunity'
import { useParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'

const formatDate = (date: Date | Timestamp) => {
  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'guide':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'website':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    case 'document':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'video':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    case 'contact':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    default:
      return null
  }
}

export default function ResourcePage() {
  const params = useParams()
  const resourceId = params.id as string
  const { resource, loading, error, likeResource, shareResource, viewResource, isLiked } = useCommunityResource(resourceId)
  const { user } = useAuth()
  const viewCountUpdated = useRef(false)

  // Increment view count once on mount
  useEffect(() => {
    if (resource && !viewCountUpdated.current) {
      viewCountUpdated.current = true
      viewResource()
    }
  }, [resource, viewResource])

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      // TODO: Show login prompt
      return
    }
    await likeResource(user.uid)
  }

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!resource) return

    try {
      await navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href
      })
      await shareResource()
    } catch (error) {
      // Handle share error or fallback
      console.error('Error sharing resource:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-red-800 font-medium">Error loading resource</h2>
            </div>
            <p className="mt-2 text-red-700">{error || 'Resource not found'}</p>
            <Link href="/community/resources" className="mt-4 inline-block text-red-600 hover:text-red-800">
              Return to resources
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Ad */}
        <div className="mb-8">
          <HeaderAd />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Resource Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-blue-600">
                      {getTypeIcon(resource.type)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>by {resource.authorName}</span>
                    <span>•</span>
                    <span>{formatDate(resource.createdAt)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLikeClick}
                    className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLiked(user?.uid)
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill={isLiked(user?.uid) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {resource.likes} Likes
                  </button>
                  
                  <button
                    onClick={handleShareClick}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>

              {/* Resource Content */}
              <div className="prose max-w-none">
                <p className="text-gray-600">{resource.description}</p>
                
                {resource.tags && resource.tags.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links & Contact */}
                <div className="mt-8 space-y-4">
                  {resource.externalUrl && (
                    <div>
                      <h2 className="text-sm font-medium text-gray-700 mb-2">External Link</h2>
                      <a
                        href={resource.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <span>{resource.externalUrl}</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {resource.phoneNumber && (
                    <div>
                      <h2 className="text-sm font-medium text-gray-700 mb-2">Contact</h2>
                      <a
                        href={`tel:${resource.phoneNumber}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {resource.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Resource Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">{resource.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium text-gray-900">{resource.likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shares</span>
                  <span className="font-medium text-gray-900">{resource.shares}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Ad */}
            <SidebarAd />
          </div>
        </div>
      </main>
    </div>
  )
} 