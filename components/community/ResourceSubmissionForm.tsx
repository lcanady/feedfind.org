'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { communityResourcesService } from '@/lib/communityService'
import { CreateCommunityResourceData } from '@/types/database'

interface ResourceSubmissionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ResourceSubmissionForm({ onSuccess, onCancel }: ResourceSubmissionFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<CreateCommunityResourceData>>({
    title: '',
    description: '',
    content: '',
    contentType: 'article',
    category: 'food_assistance',
    organization: '',
    tags: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to submit resources')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await communityResourcesService.create({
        ...formData,
        author: user.displayName || 'Anonymous',
        authorId: user.uid
      } as CreateCommunityResourceData)

      onSuccess?.()
    } catch (err) {
      setError('Failed to submit resource. Please try again.')
      console.error('Error submitting resource:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          value={formData.content}
          onChange={handleInputChange}
          rows={6}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
            Content Type
          </label>
          <select
            id="contentType"
            name="contentType"
            required
            value={formData.contentType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="article">Article</option>
            <option value="guide">Guide</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="food_assistance">Food Assistance</option>
            <option value="nutrition">Nutrition</option>
            <option value="cooking">Cooking</option>
            <option value="budgeting">Budgeting</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
          Organization (optional)
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags?.join(', ')}
          onChange={handleTagInput}
          placeholder="e.g., recipes, healthy, budget"
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Resource'}
        </button>
      </div>
    </form>
  )
} 