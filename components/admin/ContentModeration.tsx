'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import * as moderationService from '../../lib/moderationService'
import type { 
  FlaggedContent, 
  ModerationStats, 
  ModerationFilters 
} from '../../lib/moderationService'

export default function ContentModeration() {
  const { user } = useAuth()
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState<ModerationFilters>({})
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null)
  const [moderatorNotes, setModeratorNotes] = useState('')

  // Load flagged content and stats
  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [contentData, statsData] = await Promise.all([
        moderationService.getFlaggedContent(filters),
        moderationService.getModerationStats()
      ])
      
      setFlaggedContent(contentData)
      setStats(statsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    if (!user) return

    try {
      await moderationService.approveContent(itemId, user.uid, 'Approved by moderator')
      await loadData() // Refresh data
    } catch (err: any) {
      setError(`Error during approval: ${err.message}`)
    }
  }

  const handleReject = async (itemId: string) => {
    setRejectingItemId(itemId)
    setShowRejectModal(true)
  }

  const confirmReject = async () => {
    if (!user || !rejectingItemId) return

    try {
      await moderationService.rejectContent(rejectingItemId, user.uid, moderatorNotes)
      setShowRejectModal(false)
      setRejectingItemId(null)
      setModeratorNotes('')
      await loadData() // Refresh data
    } catch (err: any) {
      setError(`Error during rejection: ${err.message}`)
    }
  }

  const handleBulkApprove = async () => {
    if (!user || selectedItems.length === 0) return

    try {
      await moderationService.bulkApproveContent(selectedItems, user.uid)
      setSelectedItems([])
      await loadData() // Refresh data
    } catch (err: any) {
      setError(`Error during bulk approval: ${err.message}`)
    }
  }

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleFilterChange = (key: keyof ModerationFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const retry = () => {
    setError(null)
    loadData()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">loading content moderation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">content moderation</h1>
        <p className="text-sm text-gray-600">review and moderate flagged content</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={retry}
              className="ml-3 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-lg font-medium text-gray-900">{stats.totalFlagged}</div>
            <div className="text-xs text-gray-500">total flagged</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-lg font-medium text-amber-600">{stats.pendingReview}</div>
            <div className="text-xs text-gray-500">pending review</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-lg font-medium text-green-600">{stats.approvedToday}</div>
            <div className="text-xs text-gray-500">approved today</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-lg font-medium text-red-600">{stats.rejectedToday}</div>
            <div className="text-xs text-gray-500">rejected today</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="content-type" className="block text-xs font-medium text-gray-700 mb-1">
              content type
            </label>
            <select
              id="content-type"
              name="content-type"
              aria-label="Content Type"
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">all types</option>
              <option value="review">reviews</option>
              <option value="location">locations</option>
              <option value="provider">providers</option>
              <option value="comment">comments</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
              status
            </label>
            <select
              id="status"
              name="status"
              aria-label="Status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Bulk Approve ({selectedItems.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {flaggedContent.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No flagged content found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {flaggedContent.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.type}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {item.flagReason.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Flagged {formatDate(item.flaggedAt)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-900 font-medium">{item.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div>
                        <span>By: {item.authorName}</span>
                        {item.locationName && (
                          <span className="ml-4">Location: {item.locationName}</span>
                        )}
                      </div>
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Content
              </h3>
              <div className="mb-4">
                <label htmlFor="moderator-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Moderation Notes *
                </label>
                <textarea
                  id="moderator-notes"
                  placeholder="Add moderation notes explaining why this content is being rejected..."
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectingItemId(null)
                    setModeratorNotes('')
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!moderatorNotes.trim()}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 