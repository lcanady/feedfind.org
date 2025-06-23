import { LatLng, Address, LocationQueryResult } from '@/types/location'
import type { Coordinates, Location } from '@/types/database'

/**
 * Convert Coordinates (database type) to LatLng (location type)
 */
export function coordinatesToLatLng(coords: Coordinates): LatLng {
  return {
    lat: coords.latitude,
    lng: coords.longitude
  }
}

/**
 * Convert LatLng (location type) to Coordinates (database type)
 */
export function latLngToCoordinates(latLng: LatLng): Coordinates {
  return {
    latitude: latLng.lat,
    longitude: latLng.lng
  }
}

/**
 * Validates US ZIP code format (5 digits or 5-4 format)
 */
export function validateZipCode(zipCode: string): boolean {
  if (!zipCode || typeof zipCode !== 'string') {
    return false
  }

  // Don't trim - reject if there's any whitespace
  if (zipCode !== zipCode.trim()) {
    return false
  }
  
  // Valid formats: 12345 or 12345-6789
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  if (!isValidLatLng(point1) || !isValidLatLng(point2)) {
    throw new Error('Invalid coordinates provided')
  }
  
  // Return 0 for identical coordinates
  if (point1.lat === point2.lat && point1.lng === point2.lng) {
    return 0
  }

  const R = 3959 // Earth's radius in miles
  
  const lat1Rad = (point1.lat * Math.PI) / 180
  const lat2Rad = (point2.lat * Math.PI) / 180
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180

  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Format address object into a readable string
 */
export function formatAddress(address: Partial<Address>): string {
  if (!address.street || !address.city || !address.state || !address.zipCode) {
    throw new Error('Missing required address fields: street, city, state, zipCode')
  }

  const parts = [address.street]
  
  if (address.street2) {
    parts.push(address.street2)
  }
  
  parts.push(address.city)
  parts.push(`${address.state} ${address.zipCode}`)
  
  return parts.join(', ')
}

/**
 * Validate coordinate object has valid lat/lng values
 */
export function validateCoordinates(coords: LatLng): boolean {
  if (!coords || typeof coords !== 'object') {
    return false
  }
  
  const { lat, lng } = coords
  
  // Check if values are numbers and not NaN/Infinity
  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      isNaN(lat) || isNaN(lng) || 
      !isFinite(lat) || !isFinite(lng)) {
    return false
  }
  
  // Check valid ranges: lat -90 to 90, lng -180 to 180
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Parse location query string and determine type
 */
export function parseLocationQuery(query: string): LocationQueryResult {
  if (!query || typeof query !== 'string') {
    return {
      type: 'invalid',
      error: 'Empty or invalid query'
    }
  }
  
  const normalized = query.trim()
  
  if (!normalized) {
    return {
      type: 'invalid',  
      error: 'Empty query after normalization'
    }
  }
  
  // Check if it's a ZIP code
  if (validateZipCode(normalized)) {
    return {
      type: 'zipcode',
      value: normalized,
      normalized
    }
  }
  
  // Check if it looks like a ZIP code attempt (1-5 digits, possibly with dash)
  // This should be treated as invalid ZIP rather than address
  const zipAttemptRegex = /^\d{1,5}(-\d{0,4})?$/
  if (zipAttemptRegex.test(normalized)) {
    return {
      type: 'invalid',
      error: 'Please enter a valid 5-digit ZIP code'
    }
  }
  
  // Check if it's coordinates (lat,lng format)
  const coordMatch = normalized.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    const coords = { lat, lng }
    
    if (validateCoordinates(coords)) {
      return {
        type: 'coordinates',
        value: coords,
        normalized
      }
    }
  }
  
  // Assume it's an address
  return {
    type: 'address',
    value: normalized,
    normalized
  }
}

/**
 * Check if object is a valid LatLng
 */
export function isValidLatLng(obj: unknown): obj is LatLng {
  return obj !== null && 
         obj !== undefined && 
         typeof obj === 'object' &&
         typeof (obj as LatLng).lat === 'number' && 
         typeof (obj as LatLng).lng === 'number' &&
         !isNaN((obj as LatLng).lat) && 
         !isNaN((obj as LatLng).lng) &&
         isFinite((obj as LatLng).lat) && 
         isFinite((obj as LatLng).lng)
}

// Get coordinates from ZIP code (mock implementation - replace with actual geocoding service)
export const geocodeZipCode = async (zipCode: string): Promise<Coordinates | null> => {
  // This is a temporary mock implementation that returns coordinates for testing
  // In production, this should use a real geocoding service like Google Maps Geocoding API
  
  // Basic validation
  if (!validateZipCode(zipCode)) {
    return null
  }

  // Mock coordinates for testing - this simulates different locations for different ZIP codes
  // In production, replace with actual geocoding service
  const mockCoordinates: { [key: string]: Coordinates } = {
    '12345': { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
    '23456': { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
    '34567': { latitude: 40.7128, longitude: -74.0060 }, // New York
    '45678': { latitude: 41.8781, longitude: -87.6298 }, // Chicago
    '56789': { latitude: 29.7604, longitude: -95.3698 }  // Houston
  }

  // If we have mock coordinates for this ZIP code, return them
  if (mockCoordinates[zipCode]) {
    return mockCoordinates[zipCode]
  }

  // For any other ZIP code, generate deterministic but random-looking coordinates
  // This ensures the same ZIP code always gets the same coordinates
  const seed = zipCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const lat = 25 + (seed % 25) // Generates latitude between 25 and 50
  const lng = -125 + (seed % 50) // Generates longitude between -125 and -75

  return {
    latitude: lat,
    longitude: lng
  }
}

/**
 * Extract ZIP code from an address string
 * Returns null if no valid ZIP code is found
 */
export function extractZipCode(address: string): string | null {
  if (!address) return null

  // Try to find a 5-digit ZIP code, optionally followed by a 4-digit extension
  const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/)
  if (!zipMatch) return null

  const zipCode = zipMatch[0]
  return validateZipCode(zipCode) ? zipCode : null
}

// Filter locations by distance from ZIP code or address
export const filterLocationsByDistance = async (
  locations: Location[],
  query: string,
  maxDistance: number = 25 // Default to 25 miles
): Promise<Location[]> => {
  if (!query) {
    return [] // Return no locations if no query provided
  }

  // Parse the query to determine if it's a ZIP code or address
  const parsedQuery = parseLocationQuery(query)
  
  let zipCode: string | null = null
  
  if (parsedQuery.type === 'zipcode') {
    zipCode = parsedQuery.value as string
  } else if (parsedQuery.type === 'address') {
    // Try to extract ZIP code from address
    zipCode = extractZipCode(parsedQuery.value as string)
  }

  // If we couldn't get a ZIP code, return no results
  if (!zipCode) {
    return []
  }

  const coords = await geocodeZipCode(zipCode)
  if (!coords) {
    return [] // Return no locations if geocoding fails
  }

  return locations.filter(location => {
    if (!location.coordinates) return false
    
    const distance = calculateDistance(
      coordinatesToLatLng(coords),
      coordinatesToLatLng(location.coordinates)
    )
    
    return distance <= maxDistance
  })
} 