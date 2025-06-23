'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/layout/Header'
import { MarkdownHelp } from '@/components/community/MarkdownHelp'
import { MarkdownRenderer } from '@/components/community/MarkdownRenderer'
import { forumService } from '@/lib/forumService'

const categories = [
  { id: 'general', name: 'General Discussion' },
  { id: 'resources', name: 'Resource Sharing' },
  { id: 'local', name: 'Local Communities' },
  { id: 'support', name: 'Support & Encouragement' },
  { id: 'providers', name: 'Provider Discussion' }
]

export default function NewForumPostPage() {
  const { user } = useAuth()
  const [isPreview, setIsPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    content: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      const loginPath = `/auth/login?redirect=${encodeURIComponent('/community/forums/new')}`
      window.location.href = loginPath
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!user) {
        throw new Error('You must be logged in to create a post')
      }

      await forumService.createForumPost({
        ...formData,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous'
      })
      
      window.location.href = '/community/forums'
    } catch (err) {
      setError('Failed to create post. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null // Prevent flash of form before redirect
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/community/forums" className="hover:text-blue-600">Forums</Link>
          <span className="mx-2">/</span>
          <span>New Post</span>
        </nav>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={100}
                  placeholder="Enter your post title"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsPreview(false)}
                      className={`text-sm ${!isPreview ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className={`text-sm ${isPreview ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {isPreview ? (
                  <div className="min-h-[200px] p-4 border border-gray-300 rounded-md prose prose-sm max-w-none">
                    <MarkdownRenderer content={formData.content} />
                  </div>
                ) : (
                  <>
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={8}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Write your post content here... Markdown is supported"
                    />
                    <MarkdownHelp className="mt-2" />
                  </>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  href="/community/forums"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.content}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 