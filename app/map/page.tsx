'use client'

import React, { useState, useEffect } from 'react'
import LocationMap from '../../components/map/LocationMap'
import SearchForm from '../../components/search/SearchForm'
import { useLocationSearch } from '../../hooks/useLocationSearch'
import type { LocationSearchResult } from '../../types/database'

export default function MapPage() {
  const { loading, error, results } = useLocationSearch()
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>()

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

  const handleResults = (_searchResults: LocationSearchResult[]) => {
    // Results are handled by the hook
  }

  const handleError = (_errorMessage: string) => {
    // Error is handled by the hook
  }

  const handleLoading = (_isLoading: boolean) => {
    // Loading is handled by the hook
  }

  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location)
  }

  const closeLocationDetails = () => {
    setSelectedLocation(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Food Assistance Map</h1>
              <p className="text-gray-600">Find food assistance locations near you</p>
            </div>
            
            {/* Search Form */}
            <div className="lg:w-96">
              <SearchForm
                onResults={handleResults}
                onError={handleError}
                onLoading={handleLoading}
                placeholder="Enter ZIP code or address"
                showFilters={false}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-700 text-sm">Searching for locations...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              <LocationMap
                locations={results}
                onLocationSelect={handleLocationSelect}
                userLocation={userLocation}
                enableClustering={true}
                showMapTypeControl={true}
                showZoomControl={true}
                height="600px"
                className="w-full"
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
                    onClick={closeLocationDetails}
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

                  {selectedLocation.location.website && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Website</h4>
                      <a 
                        href={selectedLocation.location.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Visit Website
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

                  {/* Operating Hours */}
                  {selectedLocation.location.operatingHours && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Operating Hours</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(selectedLocation.location.operatingHours).map(([day, hours]) => {
                          if (day === 'specialHours') return null
                          return (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize text-gray-600">{day}:</span>
                              <span className="text-gray-900">
                                {hours?.closed ? 'Closed' : `${hours?.open} - ${hours?.close}`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedLocation.location.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Directions
                      </a>
                      {selectedLocation.location.phone && (
                        <a
                          href={`tel:${selectedLocation.location.phone}`}
                          className="flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Instructions */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Use the Map</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <p>Use the search box above to find food assistance locations in your area</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <p>Click on map markers to see location details and current status</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <p>Use the list view toggle for keyboard navigation and screen reader accessibility</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Status Legend</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Open - Currently serving</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Limited - Limited availability</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Closed - Currently closed</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                      <span className="text-gray-600">Unknown - Status not available</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 