'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import LocationMap from '@/components/map/LocationMap'
import MapControls from '@/components/map/MapControls'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import type { LocationSearchResult } from '@/types/database'

// Sample data for demo - Salem, Oregon area
const sampleLocations: LocationSearchResult[] = [
  {
    location: {
      id: 'demo-1',
      name: 'Marion-Polk Food Share',
      address: '1660 Salem Industrial Dr NE, Salem, OR 97301',
      coordinates: { latitude: 44.9526, longitude: -123.0351 },
      phone: '(555) 123-4567',
      website: 'https://example.com',
      description: 'Serving the community with fresh food and pantry items.',
      providerId: 'demo-provider-1',
      status: 'active' as const,
      createdAt: new Date(),
      operatingHours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
                 saturday: { open: '10:00', close: '14:00' },
         sunday: { open: '', close: '', closed: true }
      }
    },
    currentStatus: 'open' as const,
    distance: 0.5,
    rating: 4.5,
    reviewCount: 23
  },
  {
    location: {
      id: 'demo-2',
      name: 'Union Gospel Mission',
      address: '3045 Commercial St SE, Salem, OR 97302',
      coordinates: { latitude: 44.9311, longitude: -123.0262 },
      phone: '(555) 987-6543',
      description: 'Hot meals served daily to those in need.',
      operatingHours: {
        monday: { open: '11:00', close: '15:00' },
        tuesday: { open: '11:00', close: '15:00' },
        wednesday: { open: '11:00', close: '15:00' },
        thursday: { open: '11:00', close: '15:00' },
        friday: { open: '11:00', close: '15:00' },
        saturday: { closed: true },
        sunday: { open: '12:00', close: '16:00' }
      }
    },
    currentStatus: 'limited' as const,
    distance: 0.8,
    rating: 4.2,
    reviewCount: 18
  },
  {
    location: {
      id: 'demo-3',
      name: 'Salem Harvest',
      address: '1234 Center St NE, Salem, OR 97301',
      coordinates: { latitude: 44.9429, longitude: -123.0307 },
      phone: '(555) 456-7890',
      description: 'Emergency food assistance available by appointment.',
      operatingHours: {
        monday: { closed: true },
        tuesday: { open: '14:00', close: '18:00' },
        wednesday: { open: '14:00', close: '18:00' },
        thursday: { open: '14:00', close: '18:00' },
        friday: { closed: true },
        saturday: { open: '09:00', close: '12:00' },
        sunday: { closed: true }
      }
    },
    currentStatus: 'closed' as const,
    distance: 1.2,
    rating: 4.0,
    reviewCount: 12
  }
]

export default function MapsDemoPage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>()
  const { isLoaded, isLoading, error, reload } = useGoogleMaps()

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
          // Default to NYC for demo
          setUserLocation({
            latitude: 40.7484,
            longitude: -73.9967
          })
        }
      )
    } else {
      // Default to NYC for demo
      setUserLocation({
        latitude: 40.7484,
        longitude: -73.9967
      })
    }
  }, [])

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location)
  }

  const handleRecenter = () => {
    if (userLocation) {
      // This would trigger map recenter - implemented in LocationMap component
      console.log('Recentering to user location:', userLocation)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Maps Integration Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Interactive map showing food assistance locations with real-time status indicators, 
            clustering, and accessibility features.
          </p>
        </div>

        {/* Maps Status */}
        <div className="mb-6">
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 text-sm">Loading Google Maps...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
                <button
                  onClick={reload}
                  className="text-red-600 hover:text-red-800 text-sm underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {isLoaded && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 text-sm">Google Maps loaded successfully</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
              <LocationMap
                locations={sampleLocations}
                onLocationSelect={handleLocationSelect}
                userLocation={userLocation}
                enableClustering={true}
                showMapTypeControl={true}
                showZoomControl={true}
                height="600px"
                className="w-full"
              />
              
              {/* Map Controls */}
              <MapControls
                onRecenter={handleRecenter}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {selectedLocation ? (
              /* Location Details */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label="Close location details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedLocation.location.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLocation.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                        selectedLocation.currentStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        selectedLocation.currentStatus === 'closed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLocation.currentStatus === 'open' ? '🟢 Open' :
                         selectedLocation.currentStatus === 'limited' ? '🟡 Limited' :
                         selectedLocation.currentStatus === 'closed' ? '🔴 Closed' : '❓ Unknown'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 text-sm">{selectedLocation.location.address}</p>
                    {selectedLocation.distance && (
                      <p className="text-gray-500 text-sm mt-1">📏 {selectedLocation.distance.toFixed(1)} miles away</p>
                    )}
                  </div>

                  {selectedLocation.location.phone && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
                      <a 
                        href={`tel:${selectedLocation.location.phone}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedLocation.location.phone}
                      </a>
                    </div>
                  )}

                  {selectedLocation.location.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-gray-600 text-sm">{selectedLocation.location.description}</p>
                    </div>
                  )}

                  {selectedLocation.rating && selectedLocation.reviewCount && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Rating</h4>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-sm text-gray-600">
                          {selectedLocation.rating.toFixed(1)} ({selectedLocation.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Instructions */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Click on any marker to see location details</p>
                  <p>• Use map controls to recenter on your location</p>
                  <p>• Green markers = Open locations</p>
                  <p>• Yellow markers = Limited availability</p>
                  <p>• Red markers = Closed locations</p>
                  <p>• Markers are clustered when zoomed out</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Demo Locations ({sampleLocations.length})</h3>
                  <div className="space-y-2">
                    {sampleLocations.map((location) => (
                      <button
                        key={location.location.id}
                        onClick={() => setSelectedLocation(location)}
                        className="w-full text-left p-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <div className="text-sm font-medium text-gray-900">{location.location.name}</div>
                        <div className="text-xs text-gray-500">{location.distance?.toFixed(1)} miles</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Map Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Markers</h3>
              <p className="text-sm text-gray-600">Status-based markers with detailed info windows</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">User Location</h3>
              <p className="text-sm text-gray-600">GPS-based location detection and centering</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clustering</h3>
              <p className="text-sm text-gray-600">Smart marker grouping for better performance</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Responsive</h3>
              <p className="text-sm text-gray-600">Optimized for all screen sizes and devices</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 