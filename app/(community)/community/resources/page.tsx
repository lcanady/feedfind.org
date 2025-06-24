'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd, AdSense } from '@/components/ui/AdSense'
import { useCommunityResources } from '@/hooks/useCommunity'
import type { CommunityResource, CommunityResourceType } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import ResourceSubmissionForm from '@/components/community/ResourceSubmissionForm'
import { useAuth } from '@/hooks/useAuth'

const RESOURCE_CATEGORIES = [
    { id: 'all', name: 'All Resources' },
  { id: 'government', name: 'Government Programs' },
  { id: 'local', name: 'Local Resources' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'family', name: 'Family Services' },
  { id: 'national', name: 'National Programs' },
  { id: 'housing', name: 'Housing Assistance' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'education', name: 'Education & Training' }
  ]

const getTypeIcon = (type: CommunityResourceType) => {
    switch (type) {
      case 'guide':
        return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
    case 'website':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    case 'document':
        return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'video':
        return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
    case 'contact':
        return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )
    }
  }

const formatDate = (date: Date | Timestamp) => {
  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
  }

export default function ResourcesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const { resources, loading, error, likeResource, shareResource, isLiked } = useCommunityResources(selectedCategory === 'all' ? undefined : selectedCategory)
  const { user } = useAuth()

  const handleResourceClick = (resource: CommunityResource) => {
    router.push(`/community/resources/${resource.id}`)
  }

  const handleExternalUrlClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleLikeClick = async (e: React.MouseEvent, resourceId: string) => {
    e.preventDefault() // Prevent navigation to detail page
    if (!user) {
      // TODO: Show login prompt
      return
    }
    await likeResource(resourceId, user.uid)
  }

  const handleShareClick = async (e: React.MouseEvent, resource: CommunityResource) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.share({
        title: resource.title,
        text: resource.description,
        url: `${window.location.origin}/community/resources/${resource.id}`
      })
      await shareResource(resource.id)
    } catch (error) {
      // Handle share error or fallback
      console.error('Error sharing resource:', error)
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
            <span>Resource Guides</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Resource Guides</h1>
          <p className="text-gray-600 max-w-3xl">
            Access helpful guides, websites, and resources shared by community members to help you navigate food assistance programs and services.
          </p>
        </div>

        {/* Top Banner Ad */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <HeaderAd />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                <nav className="space-y-2">
                {RESOURCE_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </nav>
              </div>

            {/* Submit Resource CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Share Your Knowledge</h2>
                <p className="text-blue-700 text-sm mb-4">
                  Help others by sharing useful resources and guides with the community.
                </p>
                <button
                  onClick={() => setShowSubmissionForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Submit a Resource
                </button>
            </div>
          </div>

          {/* Resource List */}
          <div className="lg:col-span-3">
            {showSubmissionForm ? (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit a New Resource</h2>
                <ResourceSubmissionForm
                  onSuccess={() => setShowSubmissionForm(false)}
                  onCancel={() => setShowSubmissionForm(false)}
                />
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading resources...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">Error loading resources</div>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No resources found in this category.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {resources.map((resource, index) => (
                  <React.Fragment key={resource.id}>
                    <div 
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center text-blue-600">
                              {getTypeIcon(resource.type)}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {RESOURCE_CATEGORIES.find(c => c.id === resource.category)?.name || resource.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{resource.description}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>by {resource.authorName}</span>
                            <span>•</span>
                            <span>{resource.views} views</span>
                            <span>•</span>
                            <span>{resource.likes} likes</span>
                            <span>•</span>
                            <span>{formatDate(resource.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => handleLikeClick(e, resource.id)}
                            className={`inline-flex items-center space-x-1 text-sm font-medium ${
                              isLiked(resource, user?.uid) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={isLiked(resource, user?.uid) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Like</span>
                          </button>

                          <button
                            onClick={(e) => handleShareClick(e, resource)}
                            className="inline-flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-blue-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>Share</span>
                          </button>
                        </div>

                        {resource.externalUrl && (
                          <a
                            href={resource.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={(e) => handleExternalUrlClick(e, resource.externalUrl!)}
                          >
                            Visit Resource
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* In-feed Ad */}
                    {(index + 1) % 3 === 0 && index < resources.length - 1 && (
                      <div className="py-4">
                        <AdSense
                          adSlot="1234567898"
                          adFormat="horizontal"
                          className="text-center"
                          style={{ minHeight: '90px', backgroundColor: '#f9fafb' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 