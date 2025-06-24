'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { communityResourcesService } from '@/lib/communityService'
import { CreateCommunityResourceData, CommunityResourceCategory, CommunityResourceType } from '@/types/database'

interface ResourceSubmissionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const RESOURCE_CATEGORIES: { id: CommunityResourceCategory; name: string }[] = [
  { id: 'government', name: 'Government Programs' },
  { id: 'local', name: 'Local Resources' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'family', name: 'Family Services' },
  { id: 'national', name: 'National Programs' },
  { id: 'housing', name: 'Housing Assistance' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'education', name: 'Education & Training' }
]

const RESOURCE_TYPES: { id: CommunityResourceType; name: string }[] = [
  { id: 'guide', name: 'Guide or Tutorial' },
  { id: 'website', name: 'Website' },
  { id: 'document', name: 'Document' },
  { id: 'video', name: 'Video' },
  { id: 'contact', name: 'Contact Information' }
]

export default function ResourceSubmissionForm({ onSuccess, onCancel }: ResourceSubmissionFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<CreateCommunityResourceData>>({
    title: '',
    description: '',
    category: 'local',
    type: 'guide',
    tags: [],
    externalUrl: '',
    phoneNumber: ''
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
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={100}
          value={formData.title}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          maxLength={2000}
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {RESOURCE_CATEGORIES.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Resource Type
        </label>
        <select
          id="type"
          name="type"
          required
          value={formData.type}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {RESOURCE_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700">
          External URL (optional)
        </label>
        <input
          type="url"
          id="externalUrl"
          name="externalUrl"
          value={formData.externalUrl}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number (optional)
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          placeholder="e.g., food-banks, meals, assistance"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

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
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Resource'}
        </button>
      </div>
    </form>
  )
} 