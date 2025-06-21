'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { LocationSearchResult, Coordinates } from '../../types/database'

export interface LocationMapProps {
  locations: LocationSearchResult[]
  onLocationSelect: (location: LocationSearchResult) => void
  onMapLoad?: () => void
  userLocation?: Coordinates
  enableClustering?: boolean
  showMapTypeControl?: boolean
  showZoomControl?: boolean
  className?: string
  height?: string
}

// Map marker icons for different statuses
const getMarkerIcon = (status: string) => {
  const baseIcon = {
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32)
  }

  switch (status) {
    case 'open':
      return {
        ...baseIcon,
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#059669" stroke="#fff" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🍽</text>
          </svg>
        `)
      }
    case 'limited':
      return {
        ...baseIcon,
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#D97706" stroke="#fff" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">⚠</text>
          </svg>
        `)
      }
    case 'closed':
      return {
        ...baseIcon,
        url: 'data:image/svg+xml;base64=' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#DC2626" stroke="#fff" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">✕</text>
          </svg>
        `)
      }
    default:
      return {
        ...baseIcon,
        url: 'data:image/svg+xml;base64=' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#6B7280" stroke="#fff" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">?</text>
          </svg>
        `)
      }
  }
}

// Create info window content
const createInfoWindowContent = (location: LocationSearchResult, _onSelect: () => void): string => {
  const { location: loc, distance, currentStatus, rating, reviewCount } = location
  
  const statusText = currentStatus === 'open' ? '🟢 Open' :
                    currentStatus === 'limited' ? '🟡 Limited' :
                    currentStatus === 'closed' ? '🔴 Closed' : '❓ Unknown'

  return `
    <div class="info-window" style="max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">
        ${loc.name}
      </h3>
      
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 500; color: ${currentStatus === 'open' ? '#059669' : 
                                               currentStatus === 'limited' ? '#D97706' :
                                               currentStatus === 'closed' ? '#DC2626' : '#6B7280'};">
          ${statusText}
        </span>
      </div>
      
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
        📍 ${loc.address}
      </p>
      
      ${distance ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
        📏 ${distance.toFixed(1)} miles away
      </p>` : ''}
      
      ${loc.phone ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
        📞 <a href="tel:${loc.phone}" style="color: #2563EB; text-decoration: none;">${loc.phone}</a>
      </p>` : ''}
      
      ${rating && reviewCount ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #6B7280;">
        ⭐ ${rating.toFixed(1)} (${reviewCount} reviews)
      </p>` : ''}
      
      <button 
        onclick="window.selectLocation && window.selectLocation('${loc.id}')"
        style="
          background: #2563EB; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 14px; 
          font-weight: 500;
          width: 100%;
        "
        onmouseover="this.style.background='#1D4ED8'"
        onmouseout="this.style.background='#2563EB'"
      >
        View Details
      </button>
    </div>
  `
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  onLocationSelect,
  onMapLoad,
  userLocation,
  enableClustering = true,
  showMapTypeControl = false,
  showZoomControl = true,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  
  const [mapError, setMapError] = useState<string>('')
  const [showListView, setShowListView] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  
  // Check if Google Maps is available
  const isGoogleMapsAvailable = typeof window !== 'undefined' && window.google && window.google.maps

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear markers
    markersRef.current.forEach(marker => {
      marker.setMap(null)
    })
    markersRef.current = []
    
    // Clear clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers()
      clustererRef.current = null
    }
    
    // Clear info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
      infoWindowRef.current = null
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isGoogleMapsAvailable || !mapRef.current) {
      setMapError('Google Maps is not available. Please check your internet connection.')
      return
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: userLocation ? 
          { lat: userLocation.latitude, lng: userLocation.longitude } :
          { lat: 40.7484, lng: -73.9967 }, // Default to NYC
        mapTypeControl: showMapTypeControl,
        mapTypeControlOptions: showMapTypeControl ? {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: ['roadmap', 'satellite', 'terrain']
        } : undefined,
        zoomControl: showZoomControl,
        scrollwheel: true,
        gestureHandling: 'cooperative',
        fullscreenControl: false,
        streetViewControl: false,
        styles: prefersReducedMotion ? [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ visibility: 'simplified' }]
          }
        ] : undefined
      })

      mapInstanceRef.current = map
      setIsMapLoaded(true)
      onMapLoad?.()

      // Create info window
      infoWindowRef.current = new google.maps.InfoWindow()

      // Set up global callback for info window buttons
      ;(window as any).selectLocation = (locationId: string) => {
        const location = locations.find(loc => loc.location.id === locationId)
        if (location) {
          onLocationSelect(location)
        }
      }

    } catch (error) {
      console.error('Error initializing Google Maps:', error)
      setMapError('Map could not be loaded. Please try refreshing the page.')
    }

    return cleanup
  }, [isGoogleMapsAvailable, userLocation, showMapTypeControl, showZoomControl, prefersReducedMotion, onMapLoad, cleanup])

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    // Debounce marker updates for performance
    const timeoutId = setTimeout(() => {
      cleanup()

      if (locations.length === 0) {
        return
      }

      const bounds = new google.maps.LatLngBounds()
      const newMarkers: google.maps.Marker[] = []
      const validLocations: LocationSearchResult[] = []

      locations.forEach(location => {
        const { coordinates } = location.location
        
        // Validate coordinates
        if (isNaN(coordinates.latitude) || isNaN(coordinates.longitude)) {
          console.warn('Invalid coordinates for location:', location.location.name)
          return
        }

        validLocations.push(location)
        
        const position = new google.maps.LatLng(coordinates.latitude, coordinates.longitude)
        bounds.extend(position)

        const marker = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: location.location.name,
          icon: getMarkerIcon(location.currentStatus || 'unknown')
        })

        // Add click listener
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            const content = createInfoWindowContent(location, () => onLocationSelect(location))
            infoWindowRef.current.setContent(content)
            infoWindowRef.current.open(mapInstanceRef.current, marker)
          }
        })

        newMarkers.push(marker)
      })

      markersRef.current = newMarkers

      // Set up clustering if enabled and we have many markers
      if (enableClustering && newMarkers.length > 10) {
        clustererRef.current = new MarkerClusterer({
          map: mapInstanceRef.current,
          markers: newMarkers
        })
      }

      // Fit map to show all markers
      if (!bounds.isEmpty() && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds)
      }

      // Show warning if some locations couldn't be displayed
      if (validLocations.length < locations.length) {
        console.warn('Some locations could not be displayed due to invalid coordinates')
      }

    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [locations, isMapLoaded, enableClustering, onLocationSelect, cleanup])

  // Handle list view toggle
  const toggleView = () => {
    setShowListView(!showListView)
  }

  // Render error state
  if (mapError) {
    return (
      <div className={`${className}`} style={{ height }}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Map could not be loaded</h3>
          <p className="text-red-600 mb-4">{mapError}</p>
          <p className="text-sm text-red-500">Please try refreshing the page or check your internet connection.</p>
        </div>
        
        {/* Fallback list view */}
        <div className="mt-6">
          <LocationListFallback locations={locations} onLocationSelect={onLocationSelect} />
        </div>
      </div>
    )
  }

  // Render no locations state
  if (locations.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg`} style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-lg font-medium">No locations to display</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Accessibility instructions */}
      <div className="sr-only">
        <p>Interactive map showing food assistance locations. Use arrow keys to navigate and Enter to select markers.</p>
        <p>For keyboard navigation, use the list view toggle below.</p>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggleView}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          aria-label={showListView ? 'Switch to map view' : 'Switch to list view'}
        >
          {showListView ? (
            <>
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map View
            </>
          ) : (
            <>
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List View
            </>
          )}
        </button>
      </div>

      {/* Map container */}
      {!showListView && (
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg"
          role="application"
          aria-label="Interactive map showing food assistance locations"
        />
      )}

      {/* List view */}
      {showListView && (
        <div 
          className="w-full h-full overflow-y-auto bg-white rounded-lg border border-gray-200"
          role="region"
          aria-label="Map alternative - list of food assistance locations"
        >
          <LocationListFallback locations={locations} onLocationSelect={onLocationSelect} />
        </div>
      )}
    </div>
  )
}

// Fallback list component for accessibility
const LocationListFallback: React.FC<{
  locations: LocationSearchResult[]
  onLocationSelect: (location: LocationSearchResult) => void
}> = ({ locations, onLocationSelect }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Food Assistance Locations</h3>
      <ul role="list" aria-label="Food assistance locations" className="space-y-4">
        {locations.map((location) => (
          <li key={location.location.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <button
              onClick={() => onLocationSelect(location)}
              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{location.location.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  location.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                  location.currentStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                  location.currentStatus === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {location.currentStatus === 'open' ? '🟢 Open' :
                   location.currentStatus === 'limited' ? '🟡 Limited' :
                   location.currentStatus === 'closed' ? '🔴 Closed' : '❓ Unknown'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{location.location.address}</p>
              {location.distance && (
                <p className="text-sm text-gray-500">📏 {location.distance.toFixed(1)} miles away</p>
              )}
              {location.location.phone && (
                <p className="text-sm text-gray-500">📞 {location.location.phone}</p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LocationMap 