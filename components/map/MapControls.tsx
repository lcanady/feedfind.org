'use client'

import React from 'react'

interface MapControlsProps {
  onToggleView?: () => void
  onRecenter?: () => void
  onFullscreen?: () => void
  showListView?: boolean
  isLoading?: boolean
  className?: string
}

export const MapControls: React.FC<MapControlsProps> = ({
  onToggleView,
  onRecenter,
  onFullscreen,
  showListView = false,
  isLoading = false,
  className = ''
}) => {
  return (
    <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 ${className}`}>
      {/* View Toggle */}
      {onToggleView && (
        <button
          onClick={onToggleView}
          disabled={isLoading}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={showListView ? 'Show map view' : 'Show list view'}
          title={showListView ? 'Show map view' : 'Show list view'}
        >
          {showListView ? (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Recenter Button */}
      {onRecenter && (
        <button
          onClick={onRecenter}
          disabled={isLoading}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Recenter map on your location"
          title="Recenter map on your location"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      )}

      {/* Fullscreen Button */}
      {onFullscreen && (
        <button
          onClick={onFullscreen}
          disabled={isLoading}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Toggle fullscreen"
          title="Toggle fullscreen"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default MapControls 