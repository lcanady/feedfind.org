'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Resource {
  id: string
  title: string
  description: string
  category: string
  type: 'guide' | 'website' | 'document' | 'video'
  url?: string
  author: string
  dateAdded: string
  tags: string[]
  views: number
  likes: number
}

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Complete Guide to SNAP Benefits Application',
      description: 'Step-by-step instructions for applying for SNAP benefits, including required documents, eligibility requirements, and common mistakes to avoid.',
      category: 'Government Benefits',
      type: 'guide',
      author: 'Maria R.',
      dateAdded: '2 days ago',
      tags: ['SNAP', 'application', 'benefits', 'eligibility'],
      views: 342,
      likes: 28
    },
    {
      id: '2',
      title: 'LA County Food Bank Locations',
      description: 'Comprehensive list of all food bank locations in LA County with addresses, hours, contact information, and special requirements.',
      category: 'Local Resources',
      type: 'guide',
      author: 'Community Team',
      dateAdded: '1 week ago',
      tags: ['LA County', 'food banks', 'directory'],
      views: 156,
      likes: 15
    },
    {
      id: '3',
      title: 'Transportation Resources for Food Access',
      description: 'Information about free and low-cost transportation options to reach food assistance locations, including bus passes and rideshare programs.',
      category: 'Transportation',
      type: 'guide',
      author: 'Alex K.',
      dateAdded: '3 days ago',
      tags: ['transportation', 'bus passes', 'accessibility'],
      views: 89,
      likes: 12
    },
    {
      id: '4',
      title: 'Feeding America - Find Food Resources',
      description: 'National database to find food pantries, soup kitchens, and other food assistance programs across the United States.',
      category: 'National Resources',
      type: 'website',
      url: 'https://www.feedingamerica.org/find-your-local-foodbank',
      author: 'Sarah M.',
      dateAdded: '5 days ago',
      tags: ['national', 'database', 'food pantries'],
      views: 234,
      likes: 19
    },
    {
      id: '5',
      title: 'How to Talk to Kids About Food Insecurity',
      description: 'Tips and strategies for parents to discuss food assistance with children in an age-appropriate and positive way.',
      category: 'Family Support',
      type: 'guide',
      author: 'Dr. Jennifer L.',
      dateAdded: '1 week ago',
      tags: ['families', 'children', 'communication'],
      views: 67,
      likes: 8
    }
  ]

  const categories = [
    { id: 'all', name: 'All Resources', count: resources.length },
    { id: 'government-benefits', name: 'Government Benefits', count: resources.filter(r => r.category === 'Government Benefits').length },
    { id: 'local-resources', name: 'Local Resources', count: resources.filter(r => r.category === 'Local Resources').length },
    { id: 'transportation', name: 'Transportation', count: resources.filter(r => r.category === 'Transportation').length },
    { id: 'family-support', name: 'Family Support', count: resources.filter(r => r.category === 'Family Support').length },
    { id: 'national-resources', name: 'National Resources', count: resources.filter(r => r.category === 'National Resources').length }
  ]

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => 
        resource.category.toLowerCase().replace(' ', '-') === selectedCategory
      )

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
            <span>Resource Guides</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Resource Guides</h1>
          <p className="text-gray-600 max-w-3xl">
            Access helpful guides, websites, and resources shared by community members to help you navigate food assistance programs and services.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                    <span className="text-xs text-gray-500 block">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Resource */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Share a Resource</h3>
              <p className="text-sm text-gray-600 mb-4">
                Know of a helpful resource? Share it with the community to help others.
              </p>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Submit Resource
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center text-blue-600">
                          {getTypeIcon(resource.type)}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {resource.category}
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
                        <span>{resource.dateAdded}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

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
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="hover:text-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Like
                      </button>
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
                Load more resources
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