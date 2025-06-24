'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
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
  
  // Use Google Maps hook
  const { isLoaded: isGoogleMapsAvailable, isLoading: isMapsLoading, error: mapsLoadError } = useGoogleMaps({
    libraries: ['marker']
  })

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
    if (isMapsLoading) {
      // Still loading, don't show error yet
      setMapError('')
      return
    }

    if (mapsLoadError) {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setMapError('Google Maps API key is not configured. Please follow the setup instructions in MAPS_SETUP.md.')
      } else {
        setMapError('Failed to load Google Maps. Please check your internet connection.')
      }
      return
    }

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
  }, [isGoogleMapsAvailable, isMapsLoading, mapsLoadError, userLocation, showMapTypeControl, showZoomControl, prefersReducedMotion, onMapLoad, cleanup])

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

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading map...</span>
      </div>
    </div>
  )

  // Error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div className="max-w-md p-4 text-center">
        <p className="text-red-600 mb-2">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )

  return (
    <div 
      className={`relative ${className}`} 
      style={{ height: height || '400px', minHeight: '250px' }}
    >
      <div 
        ref={mapRef}
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{ opacity: isMapLoaded ? 1 : 0.4, transition: 'opacity 0.3s' }}
      />
      
      {isMapsLoading && <LoadingIndicator />}
      
      {(mapError || mapsLoadError) && (
        <ErrorDisplay message={mapError || mapsLoadError || 'Failed to load map'} />
      )}
      
      {!isGoogleMapsAvailable && !isMapsLoading && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <LocationListFallback 
            locations={locations} 
            onLocationSelect={onLocationSelect} 
          />
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