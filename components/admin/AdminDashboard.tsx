'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import AdminAuth from './AdminAuth'
import ContentModeration from './ContentModeration'
import Header from '../layout/Header'
import { useAuth } from '../../hooks/useAuth'
import { ProviderService, LocationService } from '../../lib/databaseService'
import type { QueryOptions, Provider, ProviderStatus, Location, LocationStatus } from '../../types/database'

type AdminTab = 'overview' | 'moderation' | 'users' | 'providers' | 'locations' | 'analytics'

interface AdminTabInfo {
  id: AdminTab
  label: string
  icon: React.ReactNode
  component: React.ReactNode
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const { user } = useAuth()

  const tabs: AdminTabInfo[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      component: <AdminOverview />
    },
    {
      id: 'moderation',
      label: 'Content Moderation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      component: <ContentModeration />
    },
    {
      id: 'users',
      label: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      component: <UserManagement />
    },
    {
      id: 'providers',
      label: 'Provider Approval',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      component: <ProviderApproval />
    },
    {
      id: 'locations',
      label: 'Location Approval',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: <LocationApproval />
    },
    {
      id: 'analytics',
      label: 'System Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      component: <SystemAnalytics />
    }
  ]

  return (
    <AdminAuth>
      <div className="min-h-screen bg-white">
        {/* Main Site Header */}
        <Header />
        
        {/* Admin Section Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">admin dashboard</h2>
                <span className="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {user?.role === 'superuser' ? 'superuser' : 'admin'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span>managing as {user?.displayName || user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-6" aria-label="Admin Tools">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'text-purple-600 font-medium'
                      : 'text-blue-600 hover:underline'
                  } py-3 text-sm flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span className="w-4 h-4">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </AdminAuth>
  )
}

// Placeholder components for other admin tools
function AdminOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">system overview</h2>
        <p className="text-sm text-gray-600">quick overview of system status and key metrics</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-lg">👥</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs text-gray-500">total users</div>
              <div className="text-lg font-medium text-gray-900">1,247</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-lg">📍</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs text-gray-500">active locations</div>
              <div className="text-lg font-medium text-gray-900">342</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-lg">⏳</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs text-gray-500">pending reviews</div>
              <div className="text-lg font-medium text-gray-900">23</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-lg">🚨</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs text-gray-500">system alerts</div>
              <div className="text-lg font-medium text-gray-900">5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold text-gray-900 mb-3">recent activity</h3>
        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <span className="text-green-600">✓</span> new provider <span className="font-medium text-gray-900">downtown food bank</span> approved
                </p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                2h ago
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600">👥</span> <span className="font-medium text-gray-900">15 new users</span> registered today
                </p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                4h ago
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <span className="text-amber-600">⚠</span> <span className="font-medium text-gray-900">3 content items</span> flagged for review
                </p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                6h ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserManagement() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">user management</h2>
        <p className="text-sm text-gray-600">manage user accounts, roles, and permissions</p>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-sm text-gray-500">user management features coming soon...</p>
        <div className="mt-3 text-xs text-gray-500">
          <p>• view and search all users</p>
          <p>• manage user roles and permissions</p>
          <p>• handle user account issues</p>
          <p>• export user data for reports</p>
        </div>
      </div>
    </div>
  )
}

function ProviderApproval() {
  const { user } = useAuth()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: 'pending' as ProviderStatus | 'all',
    sortBy: 'createdAt' as 'createdAt' | 'organizationName',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [reviewForm, setReviewForm] = useState({
    action: '' as 'approve' | 'reject',
    notes: '',
    isVerified: false
  })

  const providerService = useMemo(() => new ProviderService(), [])

  // Load providers
  const loadProviders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query options
      const queryOptions: QueryOptions = {
        orderBy: [{
          field: filters.sortBy === 'createdAt' ? 'createdAt' : 'organizationName',
          direction: filters.sortOrder
        }]
      }

      // Add status filter
      if (filters.status !== 'all') {
        queryOptions.where = [{
          field: 'status',
          operator: '==',
          value: filters.status
        }]
      }

      const results = await providerService.list('providers', queryOptions)
      const providersData = results.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Provider[]

      setProviders(providersData)
    } catch (err: any) {
      console.error('Error loading providers:', err)
      setError(`Failed to load providers: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [providerService, filters])

  // Load data on mount and filter changes
  useEffect(() => {
    loadProviders()
  }, [loadProviders])

  // Handle provider review
  const handleReview = (provider: Provider) => {
    setSelectedProvider(provider)
    setReviewForm({
      action: 'approve',
      notes: '',
      isVerified: false
    })
    setShowReviewModal(true)
  }

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!selectedProvider || !user || !reviewForm.action) return

    try {
      setActionLoading(selectedProvider.id)

      const approvalData = {
        status: reviewForm.action === 'approve' ? 'approved' as const : 'suspended' as const,
        isVerified: reviewForm.action === 'approve' ? reviewForm.isVerified : false,
        verificationNotes: reviewForm.notes,
        adminNotes: reviewForm.notes
      }

      await providerService.approve(selectedProvider.id, user.uid, approvalData)
      
      // Refresh data
      await loadProviders()
      
      // Close modal
      setShowReviewModal(false)
      setSelectedProvider(null)
      setReviewForm({ action: 'approve', notes: '', isVerified: false })
      
    } catch (err: any) {
      console.error('Error processing provider approval:', err)
      setError(`Error processing approval: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle bulk actions
  const handleBulkApprove = async () => {
    if (!user || bulkSelected.length === 0) return

    try {
      setActionLoading('bulk')

      // Process each provider
      for (const providerId of bulkSelected) {
        await providerService.approve(providerId, user.uid, {
          status: 'approved',
          isVerified: true,
          verificationNotes: 'Bulk approved by admin'
        })
      }

      // Refresh data
      await loadProviders()
      setBulkSelected([])
      
    } catch (err: any) {
      console.error('Error bulk approving providers:', err)
      setError(`Error bulk approving: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle bulk selection
  const handleBulkSelect = (providerId: string, checked: boolean) => {
    if (checked) {
      setBulkSelected([...bulkSelected, providerId])
    } else {
      setBulkSelected(bulkSelected.filter(id => id !== providerId))
    }
  }

  // Select all pending providers
  const handleSelectAll = () => {
    const pendingProviders = providers.filter(p => p.status === 'pending')
    setBulkSelected(pendingProviders.map(p => p.id))
  }

  // Format date
  const formatDate = (date: Date | any) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date.toMillis())
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Get stats
  const stats = useMemo(() => {
    const pending = providers.filter(p => p.status === 'pending').length
    const approved = providers.filter(p => p.status === 'approved').length
    const verified = providers.filter(p => p.isVerified).length
    const total = providers.length

    return { pending, approved, verified, total }
  }, [providers])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading provider approvals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Error Loading Provider Approvals</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null)
              loadProviders()
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Approval</h2>
        <p className="text-gray-600">Review and approve food assistance provider registrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-2a11.002 11.002 0 00-6.5-6.5m0 0a11.002 11.002 0 00-6.5 6.5" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="organizationName">Organization Name</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sort-order"
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {bulkSelected.length} provider(s) selected
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setBulkSelected([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading === 'bulk'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {actionLoading === 'bulk' ? 'Processing...' : 'Bulk Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Providers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {providers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg font-medium">No providers found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Header */}
            <div className="px-6 py-3 bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={bulkSelected.length === providers.filter(p => p.status === 'pending').length && providers.filter(p => p.status === 'pending').length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select All Pending
                </span>
              </div>
            </div>

            {/* Provider rows */}
            {providers.map((provider) => (
              <div key={provider.id} className="px-6 py-4">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(provider.id)}
                      onChange={(e) => handleBulkSelect(provider.id, e.target.checked)}
                      disabled={provider.status !== 'pending'}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {provider.organizationName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                            provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {provider.status}
                          </span>
                          {provider.isVerified && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(provider.createdAt)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Contact:</strong> {provider.contactPerson || 'Not provided'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {provider.email}
                        </p>
                        {provider.phone && (
                          <p className="text-sm text-gray-600">
                            <strong>Phone:</strong> {provider.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        {provider.address && (
                          <p className="text-sm text-gray-600">
                            <strong>Address:</strong> {provider.address}
                          </p>
                        )}
                        {provider.website && (
                          <p className="text-sm text-gray-600">
                            <strong>Website:</strong> 
                            <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                              {provider.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {provider.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Description:</strong> {provider.description}
                        </p>
                      </div>
                    )}

                    {provider.servicesOffered && provider.servicesOffered.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Services:</strong>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {provider.servicesOffered.map((service: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(provider.verificationNotes || provider.adminNotes) && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        {provider.verificationNotes && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Verification Notes:</strong> {provider.verificationNotes}
                          </p>
                        )}
                        {provider.adminNotes && (
                          <p className="text-sm text-gray-600">
                            <strong>Admin Notes:</strong> {provider.adminNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {provider.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleReview(provider)}
                          disabled={actionLoading === provider.id}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {actionLoading === provider.id ? 'Processing...' : 'Review'}
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

      {/* Review Modal */}
      {showReviewModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Provider: {selectedProvider.organizationName}
              </h3>
            </div>

            <div className="p-6">
              {/* Provider Details Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Provider Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Organization:</strong> {selectedProvider.organizationName}</p>
                    <p><strong>Contact:</strong> {selectedProvider.contactPerson || 'Not provided'}</p>
                    <p><strong>Email:</strong> {selectedProvider.email}</p>
                    {selectedProvider.phone && <p><strong>Phone:</strong> {selectedProvider.phone}</p>}
                  </div>
                  <div>
                    {selectedProvider.address && <p><strong>Address:</strong> {selectedProvider.address}</p>}
                    {selectedProvider.website && (
                      <p>
                        <strong>Website:</strong> 
                        <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {selectedProvider.website}
                        </a>
                      </p>
                    )}
                    <p><strong>Registered:</strong> {formatDate(selectedProvider.createdAt)}</p>
                  </div>
                </div>
                {selectedProvider.description && (
                  <div className="mt-3">
                    <p><strong>Description:</strong> {selectedProvider.description}</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="approve"
                        checked={reviewForm.action === 'approve'}
                        onChange={(e) => setReviewForm({...reviewForm, action: e.target.value as any})}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Approve Provider</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="reject"
                        checked={reviewForm.action === 'reject'}
                        onChange={(e) => setReviewForm({...reviewForm, action: e.target.value as any})}
                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Reject Provider</span>
                    </label>
                  </div>
                </div>

                {reviewForm.action === 'approve' && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reviewForm.isVerified}
                        onChange={(e) => setReviewForm({...reviewForm, isVerified: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Mark as Verified</span>
                    </label>
                  </div>
                )}

                <div>
                  <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes {reviewForm.action === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    id="review-notes"
                    value={reviewForm.notes}
                    onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder={reviewForm.action === 'approve' ? 'Optional approval notes...' : 'Required reason for rejection...'}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedProvider(null)
                  setReviewForm({ action: 'approve', notes: '', isVerified: false })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={!reviewForm.action || (reviewForm.action === 'reject' && !reviewForm.notes.trim()) || actionLoading === selectedProvider.id}
                className={`px-6 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  reviewForm.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {actionLoading === selectedProvider.id 
                  ? 'Processing...' 
                  : reviewForm.action === 'approve' 
                    ? 'Approve Provider' 
                    : 'Reject Provider'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LocationApproval() {
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: 'all' as LocationStatus | 'all',
    sortBy: 'createdAt' as 'createdAt' | 'name',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [reviewForm, setReviewForm] = useState({
    action: '' as 'approve' | 'reject',
    notes: '',
    isVerified: false
  })

  const locationService = useMemo(() => new LocationService(), [])

  // Load locations
  const loadLocations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query options
      const queryOptions: QueryOptions = {
        orderBy: [{
          field: filters.sortBy === 'createdAt' ? 'createdAt' : 'name',
          direction: filters.sortOrder
        }]
      }

      // Add status filter
      if (filters.status !== 'all') {
        queryOptions.where = [{
          field: 'status',
          operator: '==',
          value: filters.status
        }]
      }

      const results = await locationService.list('locations', queryOptions)
      const locationsData = results.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Location[]

      setLocations(locationsData)
    } catch (err: any) {
      console.error('Error loading locations:', err)
      setError(`Failed to load locations: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [locationService, filters])

  // Load data on mount and filter changes
  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  // Handle location review
  const handleReview = (location: Location) => {
    setSelectedLocation(location)
    setReviewForm({
      action: 'approve',
      notes: '',
      isVerified: false
    })
    setShowReviewModal(true)
  }

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!selectedLocation || !user || !reviewForm.action) return

    try {
      setActionLoading(selectedLocation.id)

      const approvalData = {
        status: reviewForm.action === 'approve' ? 'active' as const : 'suspended' as const,
        isVerified: reviewForm.action === 'approve' ? true : false, // Always set to true when approving
        verificationNotes: reviewForm.notes,
        adminNotes: reviewForm.notes,
        approvedBy: user.uid,
        approvedAt: new Date()
      }

      await locationService.update('locations', selectedLocation.id, approvalData)
      
      // Refresh data
      await loadLocations()
      
      // Close modal
      setShowReviewModal(false)
      setSelectedLocation(null)
      setReviewForm({ action: 'approve', notes: '', isVerified: false })
      
    } catch (err: any) {
      console.error('Error processing location approval:', err)
      setError(`Error processing approval: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle bulk actions
  const handleBulkApprove = async () => {
    if (!user || bulkSelected.length === 0) return

    try {
      setActionLoading('bulk')

      // Process each location
      for (const locationId of bulkSelected) {
        await locationService.update('locations', locationId, {
          status: 'active',
          isVerified: true, // Ensure verified status is set
          verificationNotes: 'Bulk approved by admin',
          approvedBy: user.uid,
          approvedAt: new Date()
        })
      }

      // Refresh data
      await loadLocations()
      setBulkSelected([])
      
    } catch (err: any) {
      console.error('Error bulk approving locations:', err)
      setError(`Error bulk approving: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle bulk selection
  const handleBulkSelect = (locationId: string, checked: boolean) => {
    if (checked) {
      setBulkSelected([...bulkSelected, locationId])
    } else {
      setBulkSelected(bulkSelected.filter(id => id !== locationId))
    }
  }

  // Select all pending locations
  const handleSelectAll = () => {
    const pendingLocations = locations.filter(l => l.status === 'pending')
    setBulkSelected(pendingLocations.map(l => l.id))
  }

  // Format date
  const formatDate = (date: Date | any) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date.toMillis())
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Get stats
  const stats = useMemo(() => {
    const pending = locations.filter(l => l.status === 'pending').length
    const active = locations.filter(l => l.status === 'active').length
    const verified = locations.filter(l => l.isVerified).length
    const total = locations.length

    return { pending, active, verified, total }
  }, [locations])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading location approvals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Error Loading Location Approvals</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null)
              loadLocations()
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Approval</h2>
        <p className="text-gray-600">Review and approve food assistance location registrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm font-medium text-blue-900">
                {bulkSelected.length} location{bulkSelected.length > 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setBulkSelected([])}
                className="text-sm text-blue-700 hover:text-blue-900 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading === 'bulk'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {actionLoading === 'bulk' ? 'Processing...' : 'Bulk Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Location Name</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sort-order"
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleSelectAll}
            className="text-sm text-purple-600 hover:text-purple-700 underline"
          >
            Select all pending
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setBulkSelected([])}
            className="text-sm text-gray-600 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500">No locations found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(location.id)}
                      onChange={(e) => handleBulkSelect(location.id, e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {location.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            location.status === 'active' ? 'bg-green-100 text-green-800' :
                            location.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            location.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {location.status}
                          </span>
                          {location.isVerified && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              ✓ Verified
                            </span>
                          )}
                          {location.currentStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              location.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                              location.currentStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {location.currentStatus}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(location.createdAt)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p><strong>Address:</strong> {location.address}</p>
                        {location.phone && <p><strong>Phone:</strong> {location.phone}</p>}
                        {location.email && <p><strong>Email:</strong> {location.email}</p>}
                        {location.website && (
                          <p>
                            <strong>Website:</strong> 
                            <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                              {location.website}
                            </a>
                          </p>
                        )}
                      </div>
                      <div>
                        <p><strong>Provider ID:</strong> {location.providerId}</p>
                        {location.capacity && <p><strong>Capacity:</strong> {location.capacity}</p>}
                        {location.services && location.services.length > 0 && (
                          <p><strong>Services:</strong> {location.services.join(', ')}</p>
                        )}
                      </div>
                    </div>

                    {location.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Description:</strong> {location.description}
                        </p>
                      </div>
                    )}

                    {(location.verificationNotes || location.adminNotes) && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        {location.verificationNotes && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Verification Notes:</strong> {location.verificationNotes}
                          </p>
                        )}
                        {location.adminNotes && (
                          <p className="text-sm text-gray-600">
                            <strong>Admin Notes:</strong> {location.adminNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {location.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleReview(location)}
                          disabled={actionLoading === location.id}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {actionLoading === location.id ? 'Processing...' : 'Review'}
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

      {/* Review Modal */}
      {showReviewModal && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Location: {selectedLocation.name}
              </h3>
            </div>

            <div className="p-6">
              {/* Location Details Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {selectedLocation.name}</p>
                    <p><strong>Address:</strong> {selectedLocation.address}</p>
                    {selectedLocation.phone && <p><strong>Phone:</strong> {selectedLocation.phone}</p>}
                    {selectedLocation.email && <p><strong>Email:</strong> {selectedLocation.email}</p>}
                  </div>
                  <div>
                    <p><strong>Provider ID:</strong> {selectedLocation.providerId}</p>
                    {selectedLocation.capacity && <p><strong>Capacity:</strong> {selectedLocation.capacity}</p>}
                    {selectedLocation.website && (
                      <p>
                        <strong>Website:</strong> 
                        <a href={selectedLocation.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {selectedLocation.website}
                        </a>
                      </p>
                    )}
                    <p><strong>Created:</strong> {formatDate(selectedLocation.createdAt)}</p>
                  </div>
                </div>
                {selectedLocation.description && (
                  <div className="mt-3">
                    <p><strong>Description:</strong> {selectedLocation.description}</p>
                  </div>
                )}
                {selectedLocation.services && selectedLocation.services.length > 0 && (
                  <div className="mt-3">
                    <p><strong>Services:</strong> {selectedLocation.services.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="approve"
                        checked={reviewForm.action === 'approve'}
                        onChange={(e) => setReviewForm({...reviewForm, action: e.target.value as any})}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Approve Location</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="reject"
                        checked={reviewForm.action === 'reject'}
                        onChange={(e) => setReviewForm({...reviewForm, action: e.target.value as any})}
                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Reject Location</span>
                    </label>
                  </div>
                </div>

                {reviewForm.action === 'approve' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      ✅ Approving this location will automatically mark it as verified and make it visible to users.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes {reviewForm.action === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    id="review-notes"
                    value={reviewForm.notes}
                    onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder={reviewForm.action === 'approve' ? 'Optional approval notes...' : 'Required reason for rejection...'}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedLocation(null)
                  setReviewForm({ action: 'approve', notes: '', isVerified: false })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={!reviewForm.action || (reviewForm.action === 'reject' && !reviewForm.notes.trim()) || actionLoading === selectedLocation.id}
                className={`px-6 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  reviewForm.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {actionLoading === selectedLocation.id 
                  ? 'Processing...' 
                  : reviewForm.action === 'approve' 
                    ? 'Approve Location' 
                    : 'Reject Location'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SystemAnalytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">system analytics</h2>
        <p className="text-sm text-gray-600">platform usage statistics and performance metrics</p>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-sm text-gray-500">analytics dashboard coming soon...</p>
        <div className="mt-3 text-xs text-gray-500">
          <p>• user registration and retention metrics</p>
          <p>• location search and usage patterns</p>
          <p>• provider activity and update frequency</p>
          <p>• system performance and uptime monitoring</p>
        </div>
      </div>
    </div>
  )
} 