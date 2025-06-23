'use client'

import React from 'react'
import LocationMap from '../map/LocationMap'
import type { LocationSearchResult } from '../../types/database'

interface MapViewToggleProps {
  results: LocationSearchResult[]
  showMap: boolean
  onToggleMap: () => void
  onLocationSelect: (location: LocationSearchResult) => void
  userLocation?: { latitude: number; longitude: number }
}

export const MapViewToggle: React.FC<MapViewToggleProps> = ({
  results,
  showMap,
  onToggleMap,
  onLocationSelect,
  userLocation
}) => {
  if (results.length === 0) return null

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Found {results.length} location{results.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={onToggleMap}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showMap ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Show List
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Show Map
            </>
          )}
        </button>
      </div>

      {/* Map View */}
      {showMap && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <LocationMap
            locations={results}
            onLocationSelect={onLocationSelect}
            userLocation={userLocation}
            enableClustering={true}
            showMapTypeControl={true}
            showZoomControl={true}
            height="500px"
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}

export default MapViewToggle 