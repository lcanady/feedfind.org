import {
  validateZipCode,
  calculateDistance,
  formatAddress,
  validateCoordinates,
  parseLocationQuery,
  isValidLatLng,
} from '@/lib/locationService'

describe('LocationService', () => {
  describe('validateZipCode', () => {
    it('should validate US ZIP codes correctly', () => {
      expect(validateZipCode('12345')).toBe(true)
      expect(validateZipCode('12345-6789')).toBe(true)
      expect(validateZipCode('90210')).toBe(true)
    })

    it('should reject invalid ZIP codes', () => {
      expect(validateZipCode('1234')).toBe(false) // Too short
      expect(validateZipCode('123456')).toBe(false) // Too long
      expect(validateZipCode('abcde')).toBe(false) // Not numeric
      expect(validateZipCode('12345-67890')).toBe(false) // Invalid extended format
      expect(validateZipCode('')).toBe(false) // Empty string
      expect(validateZipCode('12-345')).toBe(false) // Invalid format
    })

    it('should handle edge cases gracefully', () => {
      expect(validateZipCode('00000')).toBe(true) // Valid zeros
      expect(validateZipCode('99999')).toBe(true) // Valid high numbers
      expect(validateZipCode(' 12345 ')).toBe(false) // Whitespace
      expect(validateZipCode('12345 ')).toBe(false) // Trailing space
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between coordinates correctly', () => {
      // Distance between NYC and LA (approximately 2445 miles)
      const nyc = { lat: 40.7128, lng: -74.0060 }
      const la = { lat: 34.0522, lng: -118.2437 }
      
      const distance = calculateDistance(nyc, la)
      expect(distance).toBeGreaterThan(2400)
      expect(distance).toBeLessThan(2500)
    })

    it('should return 0 for identical coordinates', () => {
      const point = { lat: 40.7128, lng: -74.0060 }
      expect(calculateDistance(point, point)).toBe(0)
    })

    it('should handle coordinates across the international date line', () => {
      const point1 = { lat: 0, lng: 179 }
      const point2 = { lat: 0, lng: -179 }
      
      const distance = calculateDistance(point1, point2)
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(500) // Should be short distance, not halfway around world
    })

    it('should handle edge coordinates (poles, equator)', () => {
      const northPole = { lat: 90, lng: 0 }
      const southPole = { lat: -90, lng: 0 }
      const equator = { lat: 0, lng: 0 }
      
      expect(calculateDistance(northPole, southPole)).toBeGreaterThan(12000)
      expect(calculateDistance(northPole, equator)).toBeGreaterThan(6000)
    })
  })

  describe('formatAddress', () => {
    it('should format complete addresses correctly', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
      
      expect(formatAddress(address)).toBe('123 Main St, Anytown, CA 12345')
    })

    it('should handle missing optional fields', () => {
      const addressWithoutStreet2 = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
      
      expect(formatAddress(addressWithoutStreet2)).toBe('123 Main St, Anytown, CA 12345')
    })

    it('should include street2 when provided', () => {
      const address = {
        street: '123 Main St',
        street2: 'Apt 4B',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
      
      expect(formatAddress(address)).toBe('123 Main St, Apt 4B, Anytown, CA 12345')
    })

    it('should handle missing required fields gracefully', () => {
      const incompleteAddress = {
        street: '123 Main St',
        city: 'Anytown'
        // Missing state and zipCode
      }
      
      expect(() => formatAddress(incompleteAddress as any)).toThrow()
    })
  })

  describe('validateCoordinates', () => {
    it('should validate correct latitude and longitude ranges', () => {
      expect(validateCoordinates({ lat: 0, lng: 0 })).toBe(true)
      expect(validateCoordinates({ lat: 90, lng: 180 })).toBe(true)
      expect(validateCoordinates({ lat: -90, lng: -180 })).toBe(true)
      expect(validateCoordinates({ lat: 40.7128, lng: -74.0060 })).toBe(true)
    })

    it('should reject invalid latitude values', () => {
      expect(validateCoordinates({ lat: 91, lng: 0 })).toBe(false)
      expect(validateCoordinates({ lat: -91, lng: 0 })).toBe(false)
      expect(validateCoordinates({ lat: NaN, lng: 0 })).toBe(false)
      expect(validateCoordinates({ lat: Infinity, lng: 0 })).toBe(false)
    })

    it('should reject invalid longitude values', () => {
      expect(validateCoordinates({ lat: 0, lng: 181 })).toBe(false)
      expect(validateCoordinates({ lat: 0, lng: -181 })).toBe(false)
      expect(validateCoordinates({ lat: 0, lng: NaN })).toBe(false)
      expect(validateCoordinates({ lat: 0, lng: Infinity })).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateCoordinates({ lat: 90, lng: 180 })).toBe(true) // Valid edge values
      expect(validateCoordinates({ lat: -90, lng: -180 })).toBe(true) // Valid edge values
    })
  })

  describe('parseLocationQuery', () => {
    it('should parse ZIP codes correctly', () => {
      const result = parseLocationQuery('12345')
      expect(result.type).toBe('zipcode')
      expect(result.value).toBe('12345')
    })

    it('should parse coordinate strings correctly', () => {
      const result = parseLocationQuery('40.7128,-74.0060')
      expect(result.type).toBe('coordinates')
      expect(result.value).toEqual({ lat: 40.7128, lng: -74.0060 })
    })

    it('should handle city/state combinations', () => {
      const result = parseLocationQuery('New York, NY')
      expect(result.type).toBe('address')
      expect(result.value).toBe('New York, NY')
    })

    it('should handle invalid input gracefully', () => {
      const result = parseLocationQuery('')
      expect(result.type).toBe('invalid')
      expect(result.error).toBeTruthy()
    })

    it('should normalize whitespace', () => {
      const result = parseLocationQuery('  12345  ')
      expect(result.type).toBe('zipcode')
      expect(result.value).toBe('12345')
    })
  })

  describe('isValidLatLng', () => {
    it('should validate proper LatLng objects', () => {
      expect(isValidLatLng({ lat: 40.7128, lng: -74.0060 })).toBe(true)
      expect(isValidLatLng({ lat: 0, lng: 0 })).toBe(true)
    })

    it('should reject invalid objects', () => {
      expect(isValidLatLng(null)).toBe(false)
      expect(isValidLatLng(undefined)).toBe(false)
      expect(isValidLatLng({})).toBe(false)
      expect(isValidLatLng({ lat: 40.7128 })).toBe(false) // Missing lng
      expect(isValidLatLng({ lng: -74.0060 })).toBe(false) // Missing lat
      expect(isValidLatLng({ lat: 'invalid', lng: -74.0060 })).toBe(false)
    })
  })
}) 