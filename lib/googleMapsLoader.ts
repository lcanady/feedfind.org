/**
 * Google Maps API Loader
 * Handles loading the Google Maps JavaScript API with proper error handling
 */

interface GoogleMapsLoaderOptions {
  apiKey: string
  libraries?: string[]
  language?: string
  region?: string
}

interface GoogleMapsWindow extends Window {
  google?: {
    maps: typeof google.maps
  }
  initGoogleMaps?: () => void
}

declare const window: GoogleMapsWindow

let googleMapsPromise: Promise<void> | null = null
let isLoaded = false

/**
 * Load Google Maps JavaScript API
 */
export const loadGoogleMaps = async (options: GoogleMapsLoaderOptions): Promise<void> => {
  // Return immediately if already loaded
  if (isLoaded && window.google?.maps) {
    return Promise.resolve()
  }

  // Return existing promise if loading is in progress
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      isLoaded = true
      resolve()
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.type = 'text/javascript'

    // Build URL with parameters
    const params = new URLSearchParams({
      key: options.apiKey,
      libraries: (options.libraries || ['marker']).join(','),
      loading: 'async',
      callback: 'initGoogleMaps'
    })

    if (options.language) {
      params.set('language', options.language)
    }

    if (options.region) {
      params.set('region', options.region)
    }

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`

    // Set up callback
    window.initGoogleMaps = () => {
      isLoaded = true
      delete window.initGoogleMaps
      resolve()
    }

    // Handle errors
    script.onerror = (error) => {
      delete window.initGoogleMaps
      googleMapsPromise = null
      reject(new Error(`Failed to load Google Maps API: ${error}`))
    }

    // Add script to document
    document.head.appendChild(script)

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!isLoaded) {
        delete window.initGoogleMaps
        googleMapsPromise = null
        reject(new Error('Google Maps API loading timeout'))
      }
    }, 10000)
  })

  return googleMapsPromise
}

/**
 * Check if Google Maps API is loaded
 */
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && typeof window !== 'undefined' && Boolean(window.google?.maps)
}

/**
 * Get Google Maps API instance
 */
export const getGoogleMaps = (): typeof google.maps | null => {
  if (isGoogleMapsLoaded()) {
    return window.google!.maps
  }
  return null
}

/**
 * Reset loader state (useful for testing)
 */
export const resetGoogleMapsLoader = (): void => {
  googleMapsPromise = null
  isLoaded = false
  if (typeof window !== 'undefined') {
    delete window.initGoogleMaps
  }
} 