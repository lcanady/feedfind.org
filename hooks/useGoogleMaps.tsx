'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/googleMapsLoader'

interface UseGoogleMapsOptions {
  libraries?: string[]
  language?: string
  region?: string
}

interface UseGoogleMapsReturn {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  loadError: boolean
  reload: () => Promise<void>
}

/**
 * Hook for loading and managing Google Maps API
 */
export const useGoogleMaps = (options: UseGoogleMapsOptions = {}): UseGoogleMapsReturn => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const load = useCallback(async () => {
    // Check if API key is available
    if (!apiKey) {
      const errorMsg = 'Google Maps API key is not configured'
      setError(errorMsg)
      setLoadError(true)
      return
    }

    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true)
      setIsLoading(false)
      setError(null)
      setLoadError(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setLoadError(false)

    try {
      await loadGoogleMaps({
        apiKey,
        libraries: options.libraries || ['marker'],
        language: options.language,
        region: options.region
      })

      setIsLoaded(true)
      setError(null)
      setLoadError(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load Google Maps'
      setError(errorMsg)
      setLoadError(true)
      setIsLoaded(false)
      console.error('Google Maps loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, options.libraries, options.language, options.region])

  // Load maps on mount and when options change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      load()
    }
  }, [load])

  // Reload function for manual retry
  const reload = useCallback(async () => {
    await load()
  }, [load])

  return {
    isLoaded,
    isLoading,
    error,
    loadError,
    reload
  }
}

/**
 * Hook for geocoding addresses with Google Maps
 */
export const useGeocoding = () => {
  const { isLoaded, error: mapsError } = useGoogleMaps()
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)

  const geocodeAddress = useCallback(async (address: string) => {
    if (!isLoaded || !window.google?.maps) {
      throw new Error('Google Maps is not loaded')
    }

    setIsGeocoding(true)
    setGeocodingError(null)

    try {
      const geocoder = new google.maps.Geocoder()
      
      return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          setIsGeocoding(false)
          
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results)
          } else {
            const error = `Geocoding failed: ${status}`
            setGeocodingError(error)
            reject(new Error(error))
          }
        })
      })
    } catch (err) {
      setIsGeocoding(false)
      const errorMsg = err instanceof Error ? err.message : 'Geocoding failed'
      setGeocodingError(errorMsg)
      throw err
    }
  }, [isLoaded])

  return {
    geocodeAddress,
    isGeocoding,
    geocodingError,
    isLoaded,
    mapsError
  }
}

/**
 * Hook for reverse geocoding coordinates
 */
export const useReverseGeocoding = () => {
  const { isLoaded, error: mapsError } = useGoogleMaps()
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [reverseGeocodingError, setReverseGeocodingError] = useState<string | null>(null)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!isLoaded || !window.google?.maps) {
      throw new Error('Google Maps is not loaded')
    }

    setIsReverseGeocoding(true)
    setReverseGeocodingError(null)

    try {
      const geocoder = new google.maps.Geocoder()
      const latLng = { lat, lng }
      
      return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: latLng }, (results, status) => {
          setIsReverseGeocoding(false)
          
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results)
          } else {
            const error = `Reverse geocoding failed: ${status}`
            setReverseGeocodingError(error)
            reject(new Error(error))
          }
        })
      })
    } catch (err) {
      setIsReverseGeocoding(false)
      const errorMsg = err instanceof Error ? err.message : 'Reverse geocoding failed'
      setReverseGeocodingError(errorMsg)
      throw err
    }
  }, [isLoaded])

  return {
    reverseGeocode,
    isReverseGeocoding,
    reverseGeocodingError,
    isLoaded,
    mapsError
  }
} 