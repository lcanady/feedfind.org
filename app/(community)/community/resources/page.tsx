'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd, AdSense } from '@/components/ui/AdSense'
import { useCommunityResources } from '@/hooks/useCommunity'
import type { CommunityResource } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { resources, loading, error } = useCommunityResources(selectedCategory)

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'government', name: 'Government Benefits' },
    { id: 'local', name: 'Local Resources' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'family', name: 'Family Support' },
    { id: 'national', name: 'National Resources' },
    { id: 'housing', name: 'Housing' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'education', name: 'Education' }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'website':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m9-9v18" />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V17M9 10v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4a1 1 0 011-1h2M9 10V7a1 1 0 011-1h2a1 1 0 011 1v3" />
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
                <Link
                  href="/community/resources"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Submit a Resource
                </Link>
              </div>
            </div>
          </div>

          {/* Resource List */}
          <div className="lg:col-span-3">
            {loading ? (
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
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center text-blue-600">
                              {getTypeIcon(resource.type)}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {categories.find(c => c.id === resource.category)?.name || resource.category}
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
                      {resource.tags && (
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
                          {resource.url ? (
                            <a 
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Visit Resource
                              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              View Resource
                            </button>
                          )}
                        </div>
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