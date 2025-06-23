'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/layout/Header'
import { MainSearchForm } from '../../components/search/MainSearchForm'
import MapViewToggle from '../../components/search/MapViewToggle'
import type { LocationSearchResult } from '../../types/database'
import { useLocationSearch } from '../../hooks/useLocationSearch'
import { AdSense, HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'

function SearchPageContent() {
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showMap, setShowMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>()
  const searchParams = useSearchParams()
  const { searchLocations, loading: searchLoading, error: searchError, results: searchResults } = useLocationSearch()

  // Get initial query from URL parameters
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || undefined
  const initialStatus = searchParams.get('status') || undefined
  const initialRadius = searchParams.get('radius') ? parseInt(searchParams.get('radius') || '10') : 10

  // Execute initial search when component mounts
  useEffect(() => {
    if (initialQuery) {
      const executeSearch = async () => {
        setLoading(true)
        setError('')
        
        try {
          const searchQuery = {
            type: 'address' as const,
            value: initialQuery
          }
          
          const filters = {
            radius: initialRadius,
            ...(initialStatus && { currentStatus: [initialStatus] }),
            ...(initialType && { serviceTypes: [initialType] })
          }
          
          await searchLocations(searchQuery, filters)
        } catch (err: any) {
          setError(err.message || 'Failed to execute search')
        } finally {
          setLoading(false)
        }
      }
      
      executeSearch()
    }
  }, [initialQuery, initialType, initialStatus, initialRadius, searchLocations])

  // Update local results when search results change
  useEffect(() => {
    setResults(searchResults)
  }, [searchResults])

  // Update loading state
  useEffect(() => {
    setLoading(searchLoading)
  }, [searchLoading])

  // Update error state
  useEffect(() => {
    if (searchError) {
      setError(searchError)
    }
  }, [searchError])

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Could not get user location:', error)
        }
      )
    }
  }, [])

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location)
    // Navigate to location details page
    window.location.href = `/location/${location.location.id}`
  }

  const handleToggleMap = () => {
    setShowMap(!showMap)
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Ad */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <HeaderAd />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Find Food Assistance Near You
              </h1>
              <p className="text-lg text-gray-600">
                Search for food banks, pantries, and other food assistance locations in your area. 
                Get real-time availability information to ensure you don't make a wasted trip.
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <MainSearchForm />
            </div>

            {/* Results Section */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Searching for locations...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                {/* Map View Toggle */}
                <MapViewToggle
                  results={results}
                  showMap={showMap}
                  onToggleMap={handleToggleMap}
                  onLocationSelect={handleLocationSelect}
                  userLocation={userLocation}
                />
                
                {!showMap && (
                  <div className="grid gap-6">
                    {results.map((result, index) => (
                      <React.Fragment key={result.location.id || index}>
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {result.location.name}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                {result.location.address}
                              </p>
                              {result.distance && (
                                <p className="text-sm text-gray-500">
                                  {result.distance.toFixed(1)} miles away
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end">
                              {/* Status Badge */}
                              <span 
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                                  result.currentStatus === 'open' 
                                    ? 'bg-green-100 text-green-800'
                                    : result.currentStatus === 'limited'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {result.currentStatus === 'open' && '🟢 Open'}
                                {result.currentStatus === 'limited' && '🟡 Limited'}
                                {result.currentStatus === 'closed' && '🔴 Closed'}
                                {!result.currentStatus && '❓ Status Unknown'}
                              </span>
                              
                              {/* Rating */}
                              {result.rating && (
                                <div className="flex items-center">
                                  <span className="text-yellow-400 mr-1">★</span>
                                  <span className="text-sm text-gray-600">
                                    {result.rating.toFixed(1)} ({result.reviewCount || 0} reviews)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {result.location.description && (
                            <p className="text-gray-700 mb-4 text-sm">
                              {result.location.description}
                            </p>
                          )}

                          {/* View Details Button */}
                          <div className="mt-4">
                            <Link
                              href={`/location/${result.location.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>

                        {/* In-feed Ad */}
                        {(index + 1) % 3 === 0 && index < results.length - 1 && (
                          <div className="py-4">
                            <AdSense
                              adSlot="1234567890"
                              adFormat="horizontal"
                              className="text-center"
                              style={{ minHeight: '90px', backgroundColor: '#f9fafb' }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && !error && results.length === 0 && initialQuery && (
              <div className="text-center py-8">
                <p className="text-gray-600">No locations found matching your search criteria.</p>
              </div>
            )}

            {/* Footer Ad */}
            <div className="mt-8">
              <FooterAd />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Sidebar Ad */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <SidebarAd />
              </div>

              {/* Additional sidebar content can go here */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  If you need immediate food assistance or help finding resources, please call our support line.
                </p>
                <a
                  href="tel:1-800-555-0000"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  1-800-555-0000
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
} 