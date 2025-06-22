import { LatLng, Address, LocationQueryResult } from '@/types/location'
import type { Coordinates } from '@/types/database'

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