import { useState, useCallback, useRef } from 'react'
import { LocationService } from '../lib/databaseService'
import type { Location, Coordinates, LocationSearchResult } from '../types/database'
import { calculateDistance } from '../lib/locationService'
import type { LatLng } from '../types/location'

// Helper function to convert between coordinate types
function coordinatesToLatLng(coords: Coordinates): LatLng {
  return {
    lat: coords.latitude,
    lng: coords.longitude
  }
}

export interface SearchQuery {
  type: 'zipcode' | 'address' | 'coordinates'
  value: string | Coordinates
}

export interface SearchFilters {
  radius?: number
  status?: string[]
  currentStatus?: string[]
  serviceTypes?: string[]
  accessibility?: string[]
  languages?: string[]
}

export interface UseLocationSearchReturn {
  searchLocations: (query: SearchQuery, filters?: SearchFilters) => Promise<void>
  loading: boolean
  error: string | null
  results: LocationSearchResult[]
  clearResults: () => void
  clearError: () => void
  hasMore: boolean
  loadMore: () => Promise<void>
}

export const useLocationSearch = (): UseLocationSearchReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null)
  const [lastFilters, setLastFilters] = useState<SearchFilters | undefined>()
  
  const locationService = useRef(new LocationService())
  const abortController = useRef<AbortController | null>(null)

  const clearResults = useCallback(() => {
    setResults([])
    setHasMore(false)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const searchLocations = useCallback(async (
    query: SearchQuery, 
    filters: SearchFilters = {}
  ) => {
    // Cancel previous request if still running
    if (abortController.current) {
      abortController.current.abort()
    }
    
    abortController.current = new AbortController()
    
    setLoading(true)
    setError(null)
    setLastQuery(query)
    setLastFilters(filters)
    
    try {
      let searchResults: Location[] = []
      let searchCenter: Coordinates | null = null

      // Execute search based on query type
      switch (query.type) {
        case 'zipcode':
          searchResults = await locationService.current.searchByZipCode(query.value as string)
          // For ZIP code searches, we might need to geocode to get center point
          // This is a simplified implementation - in reality you'd use Google Geocoding API
          searchCenter = await geocodeZipCode(query.value as string)
          break

        case 'coordinates':
          const coords = query.value as Coordinates
          searchCenter = coords
          const radius = filters.radius || 10 // Default 10km radius
          const locationsWithDistance = await locationService.current.searchByCoordinates(coords, radius)
          // Extract locations from the distance results
          searchResults = locationsWithDistance.map(item => ({
            ...item,
            distance: undefined // Remove distance as we'll recalculate consistently
          })) as Location[]
          break

        case 'address':
          // In a real implementation, you'd use Google Geocoding API to convert address to coordinates
          const geocoded = await geocodeAddress(query.value as string)
          if (geocoded) {
            searchCenter = geocoded
            const addressRadius = filters.radius || 15 // Default 15km for address searches
            const addressResults = await locationService.current.searchByCoordinates(geocoded, addressRadius)
            searchResults = addressResults
          } else {
            throw new Error('Unable to find that address. Please try a different address or ZIP code.')
          }
          break

        default:
          throw new Error('Invalid search type')
      }

      // Apply additional filters
      if (filters.status && filters.status.length > 0) {
        searchResults = searchResults.filter(location => 
          filters.status!.includes(location.status)
        )
      }

      if (filters.currentStatus && filters.currentStatus.length > 0) {
        searchResults = searchResults.filter(location => 
          location.currentStatus && filters.currentStatus!.includes(location.currentStatus)
        )
      }

      // Calculate distances if we have a search center
      const resultsWithDistance = searchResults.map(location => {
        const distance = searchCenter 
          ? calculateDistance(coordinatesToLatLng(searchCenter), coordinatesToLatLng(location.coordinates))
          : undefined

        return {
          location,
          provider: { id: location.providerId } as any, // Will be populated in real implementation
          services: [], // Will be populated in real implementation
          distance,
          currentStatus: location.currentStatus,
          lastUpdated: location.lastStatusUpdate,
          rating: location.averageRating,
          reviewCount: location.reviewCount
        }
      })

      // Sort by distance if available, otherwise by name
      resultsWithDistance.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance
        }
        return a.location.name.localeCompare(b.location.name)
      })

      setResults(resultsWithDistance)
      setHasMore(resultsWithDistance.length >= 20) // Assume more results if we got 20+
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // Request was cancelled, don't update state
      }
      
      const errorMessage = formatSearchError(err)
      setError(errorMessage)
      setResults([])
      setHasMore(false)
    } finally {
      setLoading(false)
      abortController.current = null
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || !lastQuery || loading) {
      return
    }

    setLoading(true)
    
    try {
      // In a real implementation, this would load the next page of results
      // For now, we'll simulate it by not loading more
      setHasMore(false)
    } catch (err: any) {
      const errorMessage = formatSearchError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [hasMore, lastQuery, loading])

  return {
    searchLocations,
    loading,
    error,
    results,
    clearResults,
    clearError,
    hasMore,
    loadMore
  }
}

// Helper function to format search errors
function formatSearchError(error: any): string {
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error: Please check your internet connection and try again.'
  }
  
  if (error.code === 'PERMISSION_DENIED') {
    return 'Unable to access location data. Please try searching with a ZIP code.'
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

// Helper function to geocode ZIP codes
// In a real implementation, this would use Google Geocoding API
async function geocodeZipCode(zipCode: string): Promise<Coordinates | null> {
  // This is a mock implementation
  // In reality, you'd call Google Geocoding API
  const mockCoordinates: Record<string, Coordinates> = {
    '10001': { latitude: 40.7484, longitude: -73.9967 }, // NYC
    '90210': { latitude: 34.0901, longitude: -118.4065 }, // Beverly Hills
    '60601': { latitude: 41.8827, longitude: -87.6233 }, // Chicago
    '02101': { latitude: 42.3601, longitude: -71.0589 }, // Boston
    '94102': { latitude: 37.7749, longitude: -122.4194 } // San Francisco
  }
  
  return mockCoordinates[zipCode] || null
}

// Helper function to geocode addresses
// In a real implementation, this would use Google Geocoding API
async function geocodeAddress(address: string): Promise<Coordinates | null> {
  // This is a mock implementation
  // In reality, you'd call Google Geocoding API
  
  // Simple pattern matching for demo purposes
  if (address.toLowerCase().includes('new york')) {
    return { latitude: 40.7128, longitude: -74.0060 }
  }
  
  if (address.toLowerCase().includes('los angeles')) {
    return { latitude: 34.0522, longitude: -118.2437 }
  }
  
  if (address.toLowerCase().includes('chicago')) {
    return { latitude: 41.8781, longitude: -87.6298 }
  }
  
  return null
}

// Custom hook for geolocation
export const useGeolocation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }
      
      setLoading(true)
      setError(null)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          setLoading(false)
          let errorMessage: string
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enter a ZIP code manually.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable. Please try again or enter a ZIP code.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or enter a ZIP code.'
              break
            default:
              errorMessage = 'An error occurred while getting your location.'
              break
          }
          
          setError(errorMessage)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return {
    getCurrentPosition,
    loading,
    error,
    clearError
  }
} 