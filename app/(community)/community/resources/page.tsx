'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd, AdSense } from '@/components/ui/AdSense'
import { useCommunityResources } from '@/hooks/useCommunity'
import type { CommunityResource } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import ResourceSubmissionForm from '@/components/community/ResourceSubmissionForm'
import { useAuth } from '@/hooks/useAuth'

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const { resources, loading, error, likeResource, shareResource, viewResource, isLiked } = useCommunityResources(selectedCategory)
  const { user } = useAuth()

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'food_assistance', name: 'Food Assistance' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'budgeting', name: 'Budgeting' },
    { id: 'other', name: 'Other Resources' }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'article':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'link':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'Recently'
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const handleResourceClick = async (resource: CommunityResource) => {
    await viewResource(resource.id)
  }

  const handleLikeClick = async (e: React.MouseEvent, resource: CommunityResource) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      // TODO: Show login prompt
      return
    }
    await likeResource(resource.id)
  }

  const handleShareClick = async (e: React.MouseEvent, resource: CommunityResource) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href
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
            <div className="sticky top-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                      <span className="float-right text-gray-400">
                        {resources.filter(r => category.id === 'all' ? true : r.category === category.id).length}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Sidebar Ad */}
              <div className="mb-6">
                <SidebarAd />
              </div>

              {/* Submit Resource */}
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
                              {getTypeIcon(resource.contentType)}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {categories.find(c => c.id === resource.category)?.name || resource.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{resource.description}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>by {resource.author}</span>
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
                            onClick={(e) => handleLikeClick(e, resource)}
                            className={`inline-flex items-center space-x-1 text-sm font-medium ${
                              isLiked(resource) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={isLiked(resource) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
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
                            onClick={(e) => e.stopPropagation()}
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