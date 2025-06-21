'use client'

import React, { useState } from 'react'
import AdminAuth from './AdminAuth'
import ContentModeration from './ContentModeration'
import Header from '../layout/Header'
import { useAuth } from '../../hooks/useAuth'

type AdminTab = 'overview' | 'moderation' | 'users' | 'providers' | 'analytics'

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
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">provider approval</h2>
        <p className="text-sm text-gray-600">review and approve new food assistance providers</p>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-sm text-gray-500">provider approval workflow coming soon...</p>
        <div className="mt-3 text-xs text-gray-500">
          <p>• review new provider applications</p>
          <p>• verify provider credentials and documentation</p>
          <p>• approve or reject provider requests</p>
          <p>• manage provider status and permissions</p>
        </div>
      </div>
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