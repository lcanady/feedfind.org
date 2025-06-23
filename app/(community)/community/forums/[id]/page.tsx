'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import MarkdownRenderer from '@/components/community/MarkdownRenderer'
import MarkdownHelp from '@/components/community/MarkdownHelp'
import { useAuth } from '@/hooks/useAuth'
import { forumService } from '@/lib/forumService'
import { ForumPostAd, ForumSidebarAd, ForumReplyAd, ForumFooterAd } from '@/components/ui/AdSense'
import type { ForumPost, ForumReply } from '@/types/database'

export default function ForumPostPage() {
  const params = useParams()
  const postId = params.id as string
  const { user } = useAuth()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postData = await forumService.getForumPost(postId)
        setPost(postData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading post:', err)
        setError('Failed to load post')
        setLoading(false)
      }
    }

    loadPost()
  }, [postId])

  useEffect(() => {
    if (!postId) return

    const unsubscribe = forumService.subscribeToReplies(postId, (updatedReplies) => {
      setReplies(updatedReplies)
    })

    return () => unsubscribe()
  }, [postId])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !user || !post) return
    
    setIsReplying(true)
    try {
      await forumService.createReply({
        postId,
        content: replyText,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        status: 'active'
      })
      setReplyText('')
    } catch (error) {
      console.error('Error submitting reply:', error)
      setError('Failed to submit reply')
    } finally {
      setIsReplying(false)
    }
  }

  const formatTimeAgo = (date: Date | any) => {
    if (!date) return 'Unknown'
    const actualDate = date instanceof Date ? date : date.toDate()
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - actualDate.getTime()) / (1000 * 60 * 60))
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading forum post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Post</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/community/forums" className="text-blue-600 hover:underline">
              ← Back to Forums
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The forum post you're looking for doesn't exist or has been removed.</p>
            <Link href="/community/forums" className="text-blue-600 hover:underline">
              ← Back to Forums
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/community" className="hover:text-blue-600">Community</Link>
          <span className="mx-2">/</span>
          <Link href="/community/forums" className="hover:text-blue-600">Forums</Link>
          <span className="mx-2">/</span>
          <span>{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Post Content */}
            <article className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              {/* Post Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {post.isPinned && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2.586l-1.707 1.707A1 1 0 006.586 12H8v6a1 1 0 001 1h2a1 1 0 001-1v-6h1.414a1 1 0 00.707-1.707L12.414 9H15a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
                      </svg>
                      Pinned
                    </span>
                  )}
                  {post.isLocked && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Locked
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {getCategoryDisplayName(post.category)}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {post.authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{post.authorName}</div>
                      <div className="text-sm text-gray-500">
                        Posted {formatTimeAgo(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views} views
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes} likes
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {replies.length} replies
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <MarkdownRenderer content={post.content} />
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button className="inline-flex items-center text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Like
                  </button>
                  <button className="inline-flex items-center text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button className="inline-flex items-center text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </article>

            {/* Ad Placement - After Post Content */}
            <ForumPostAd />

            {/* Replies Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Replies ({replies.length})
              </h2>

              {/* Reply Form */}
              {!post.isLocked && (
                <form onSubmit={handleReply} className="mb-8">
                  <div className="mb-4">
                    <label htmlFor="reply" className="sr-only">Your reply</label>
                    <textarea
                      id="reply"
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Write your reply..."
                      required
                    />
                    <MarkdownHelp className="mt-2" />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isReplying || !replyText.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isReplying ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </form>
              )}

              {/* Replies List */}
              <div className="space-y-6">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {reply.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{reply.authorName}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <MarkdownRenderer content={reply.content} />
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <button className="text-sm text-gray-500 hover:text-blue-600">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {reply.likes} likes
                        </button>
                        <button className="text-sm text-gray-500 hover:text-blue-600">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Author Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">About the Author</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {post.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.authorName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Member since {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Ad */}
              <ForumSidebarAd />

              {/* Community Guidelines */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Community Guidelines</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>• Be respectful and supportive</li>
                  <li>• No personal financial information</li>
                  <li>• Keep posts relevant to food assistance</li>
                  <li>• Report inappropriate content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Ad */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ForumFooterAd />
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
    </div>
  )
} 