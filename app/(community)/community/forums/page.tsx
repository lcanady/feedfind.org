'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useForumPosts } from '@/hooks/useCommunity'
import { SidebarAd, HeaderAd } from '@/components/ui/AdSense'
import type { ForumPost } from '@/types/database'

interface ForumCategory {
  id: string
  name: string
  description: string
  posts: number
  lastPost?: {
    title: string
    author: string
    time: string
  }
}

export default function CommunityForumsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { posts, loading, error } = useForumPosts(selectedCategory === 'all' ? undefined : selectedCategory)

  const categories: ForumCategory[] = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General conversation about food assistance and community support',
      posts: 234,
      lastPost: {
        title: 'Tips for first-time food pantry visits',
        author: 'Sarah M.',
        time: '2 hours ago'
      }
    },
    {
      id: 'resources',
      name: 'Resource Sharing',
      description: 'Share helpful resources, guides, and information',
      posts: 156,
      lastPost: {
        title: 'Updated SNAP benefits guide for 2025',
        author: 'Community Team',
        time: '1 day ago'
      }
    },
    {
      id: 'local',
      name: 'Local Communities',
      description: 'Connect with others in your local area',
      posts: 89,
      lastPost: {
        title: 'Los Angeles area mobile pantry schedule',
        author: 'Maria R.',
        time: '3 hours ago'
      }
    },
    {
      id: 'support',
      name: 'Support & Encouragement',
      description: 'A safe space for emotional support and encouragement',
      posts: 145,
      lastPost: {
        title: 'Celebrating small victories',
        author: 'David H.',
        time: '5 hours ago'
      }
    },
    {
      id: 'providers',
      name: 'Provider Discussion',
      description: 'For food assistance providers to share best practices',
      posts: 67,
      lastPost: {
        title: 'Managing volunteer schedules effectively',
        author: 'FoodBank Admin',
        time: '1 day ago'
      }
    }
  ]

  // Use actual posts from Firebase
  const displayPosts = posts
  
  // Filter posts based on selected category
  const filteredPosts = displayPosts.filter(post => 
    selectedCategory === 'all' || post.category === selectedCategory
  )

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'general': return 'General Discussion'
      case 'resources': return 'Resource Sharing'
      case 'local': return 'Local Communities'
      case 'support': return 'Support & Encouragement'
      case 'providers': return 'Provider Discussion'
      default: return category
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <Link href="/community" className="hover:text-blue-600">Community</Link>
                <span className="mx-2">/</span>
                <span>Forums</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">Community Forums</h1>
              <p className="text-gray-600 mt-2">
                Connect, share, and support each other in your food assistance journey
              </p>
            </div>
            <Link href="/community/forums/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Ad */}
        <HeaderAd />
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Discussions
                </button>
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
                    <span className="text-xs text-gray-500 block">{category.posts} posts</span>
                  </button>
                ))}
              </nav>

              {/* Community Guidelines */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Community Guidelines</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>• Be respectful and supportive</li>
                  <li>• No personal financial information</li>
                  <li>• Keep posts relevant to food assistance</li>
                  <li>• Report inappropriate content</li>
                </ul>
                <span className="text-xs text-gray-400 mt-2 block">
                  Read full guidelines →
                </span>
              </div>
            </div>

            {/* Sidebar Ad */}
            <SidebarAd />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Description */}
            {selectedCategory !== 'all' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                {(() => {
                  const category = categories.find(c => c.id === selectedCategory)
                  return category ? (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h2>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  ) : null
                })()}
              </div>
            )}

            {/* Posts List */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCategory === 'all' ? 'Recent Discussions' : 'Category Posts'}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {filteredPosts.length} posts
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading forum posts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-600 mb-2">Error loading forum posts</div>
                    <p className="text-gray-600">{error}</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No posts found in this category.</p>
                    <Link href="/community/forums/new" className="mt-4 inline-block text-blue-600 hover:underline">
                      Create the first post
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredPosts.map((post) => (
                      <article key={post.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <Link href={`/community/forums/${post.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                              {post.title}
                            </Link>
                            <div className="text-sm text-gray-500 mt-1">
                              Posted by {post.authorName} • {formatTimeAgo(post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate())}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="inline-flex items-center mr-4">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              {post.replies} replies
                            </span>
                            <span className="inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {post.views} views
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 line-clamp-2">{post.content}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              post.category === selectedCategory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {getCategoryDisplayName(post.category)}
                            </span>
                            {post.tags?.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Link href={`/community/forums/${post.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                            Read more →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Load More - only show if we have posts and not loading */}
              {!loading && !error && filteredPosts.length > 0 && (
                <div className="p-6 border-t border-gray-200 text-center">
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    Load more posts
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
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
                <li><Link href="/help" className="text-blue-600 hover:underline">help & FAQ</Link></li>
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