'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../hooks/useAuth'
import { ProviderDashboard } from '../../../components/provider/ProviderDashboard'
import { ProviderService } from '../../../lib/databaseService'
import Header from '../../../components/layout/Header'
import { HeaderAd, FooterAd } from '@/components/ui/AdSense'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import type { Provider } from '../../../types/database'

export default function ProviderPage() {
  const { user, loading: authLoading } = useAuth()
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const providerService = new ProviderService()

  useEffect(() => {
    const loadProviders = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError('')

        // Get all organizations managed by this user
        const allProviders = await providerService.getAllByUserId(user.uid)
        setProviders(allProviders)

        // If only one organization, select it automatically
        if (allProviders.length === 1) {
          const firstProvider = allProviders[0]
          if (firstProvider) {
            setSelectedProvider(firstProvider)
          }
        } else if (allProviders.length > 1) {
          // If multiple organizations, select the first approved one, or first one
          const approvedProvider = allProviders.find(p => p.status === 'approved')
          const providerToSelect = approvedProvider || allProviders[0]
          if (providerToSelect) {
            setSelectedProvider(providerToSelect)
          }
        }
      } catch (err) {
        console.error('Failed to load providers:', err)
        setError('Failed to load your organizations.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProviders()
    }
  }, [user])

  const providerId = selectedProvider?.id || ''

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <main id="main-content" className="min-h-screen bg-white">
          <Header />
          <div className="max-w-7xl mx-auto px-4">
            <HeaderAd />
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main id="main-content" className="min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* Header Ad */}
        <div className="max-w-7xl mx-auto px-4">
          <HeaderAd />
        </div>

        <div className="min-h-screen bg-gray-50">
          {providers.length > 0 && selectedProvider ? (
            <div>
              {/* Organization Selector for Multiple Organizations */}
              {providers.length > 1 && (
                <div className="bg-white border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Managing: {selectedProvider.organizationName}
                        </h2>
                        <p className="text-sm text-gray-600">
                          You manage {providers.length} organizations
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={selectedProvider.id}
                          onChange={(e) => {
                            const provider = providers.find(p => p.id === e.target.value)
                            if (provider) setSelectedProvider(provider)
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {providers.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.organizationName}
                            </option>
                          ))}
                        </select>
                        <Link
                          href="/add-organization"
                          className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          Add Organization
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Dashboard */}
              <div className="max-w-7xl mx-auto px-4 py-6">
                <ProviderDashboard 
                  providerId={providerId}
                  onLocationUpdate={(locationId, data) => {
                    console.log('Location updated:', locationId, data)
                  }}
                  onStatusUpdate={(locationId, status) => {
                    console.log('Status updated:', locationId, status)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-12">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 8h10M7 12h4m1 4h6" />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Your Provider Dashboard
                </h1>
                
                {error ? (
                  <div className="mb-6">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-purple-600 hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <p className="text-lg text-gray-600 mb-8">
                    You haven't registered any food assistance organizations yet.
                    Get started by adding your organization to help connect your community with food resources.
                  </p>
                )}
                
                <div className="space-y-4">
                  <Link
                    href="/add-organization"
                    className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Register Your Organization
                  </Link>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Link
                      href="/provider-resources"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      📚 Provider Resources & Guide
                    </Link>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <Link
                      href="/"
                      className="text-purple-600 hover:underline"
                    >
                      ← Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Footer Ad */}
            <FooterAd />
            
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
                  <li><a href="#" className="text-blue-600 hover:underline">bulk posting</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">find food</h3>
                <ul className="space-y-1">
                  <li><Link href="/search" className="text-blue-600 hover:underline">search locations</Link></li>
                  <li><Link href="/map" className="text-blue-600 hover:underline">browse map</Link></li>
                  <li><a href="#" className="text-blue-600 hover:underline">mobile app</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">text alerts</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">community</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-blue-600 hover:underline">volunteer</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">donate</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">partnerships</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">contact us</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
} 