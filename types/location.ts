// Core coordinate interface
export interface LatLng {
  lat: number
  lng: number
}

// Address information
export interface Address {
  street: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country?: string
}

// Location query parsing result
export interface LocationQueryResult {
  type: 'zipcode' | 'coordinates' | 'address' | 'invalid'
  value?: string | LatLng
  error?: string
  normalized?: string
}

// Distance calculation units
export type DistanceUnit = 'miles' | 'kilometers'

// Location status for food assistance locations  
export type LocationStatus = 'open' | 'closed' | 'limited' | 'unknown'

// Food assistance location interface
export interface FoodLocation {
  id: string
  name: string
  address: Address
  coordinates: LatLng
  status: LocationStatus
  phone?: string
  website?: string
  hours?: string
  services?: string[]
  lastUpdated: Date
  providerId: string
}

// Search parameters
export interface LocationSearchParams {
  query: string
  center?: LatLng
  radius?: number // in miles
  status?: LocationStatus[]
  services?: string[]
  limit?: number
  offset?: number
}

// Search result with distance
export interface LocationSearchResult extends FoodLocation {
  distance?: number // in miles from search center
}

// Geolocation API result
export interface GeolocationResult {
  coordinates: LatLng
  accuracy: number
  timestamp: number
}

// Error types for location services
export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_QUERY' | 'API_ERROR'
  message: string
  details?: any
} 