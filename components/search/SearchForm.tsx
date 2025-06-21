'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useLocationSearch, useGeolocation } from '../../hooks/useLocationSearch'
import { validateZipCode, parseLocationQuery } from '../../lib/locationService'
import type { SearchQuery, SearchFilters } from '../../hooks/useLocationSearch'

export interface SearchFormProps {
  onResults?: (results: any[]) => void
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
  initialQuery?: string
  placeholder?: string
  showFilters?: boolean
  autoFocus?: boolean
  className?: string
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onResults,
  onError,
  onLoading,
  initialQuery = '',
  placeholder = 'Enter ZIP code or address',
  showFilters = true,
  autoFocus = false,
  className = ''
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    radius: 10,
    status: [],
    currentStatus: [],
    serviceTypes: [],
    accessibility: [],
    languages: []
  })
  
  const { searchLocations, loading, error, results, clearResults, clearError } = useLocationSearch()
  const { getCurrentPosition, loading: gpsLoading, error: gpsError, clearError: clearGpsError } = useGeolocation()
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsAnnouncementRef = useRef<HTMLDivElement>(null)

  // Handle external prop changes
  useEffect(() => {
    if (onResults) onResults(results)
  }, [results, onResults])

  useEffect(() => {
    if (onError) onError(error || '')
  }, [error, onError])

  useEffect(() => {
    if (onLoading) onLoading(loading || gpsLoading)
  }, [loading, gpsLoading, onLoading])

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Clear errors when query changes
  useEffect(() => {
    if (error) clearError()
    if (gpsError) clearGpsError()
  }, [query, error, gpsError, clearError, clearGpsError])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Clear errors when user starts typing
    if (error) clearError()
    if (gpsError) clearGpsError()
    
    // Clear results when input is cleared
    if (!value.trim()) {
      clearResults()
    }
  }, [clearResults, error, gpsError, clearError, clearGpsError])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return
    }

    const parsedQuery = parseLocationQuery(trimmedQuery)
    
    if (parsedQuery.type === 'invalid') {
      clearError()
      setTimeout(() => {
        if (onError) onError(parsedQuery.error || 'Invalid search query')
      }, 0)
      return
    }

    let searchQuery: SearchQuery

    switch (parsedQuery.type) {
      case 'zipcode':
        if (!validateZipCode(parsedQuery.value as string)) {
          if (onError) onError('Please enter a valid 5-digit ZIP code')
          return
        }
        searchQuery = { type: 'zipcode', value: parsedQuery.value as string }
        break
      
      case 'coordinates':
        const latLng = parsedQuery.value as any
        searchQuery = { 
          type: 'coordinates', 
          value: { latitude: latLng.lat, longitude: latLng.lng } 
        }
        break
      
      case 'address':
        searchQuery = { type: 'address', value: parsedQuery.value as string }
        break
      
      default:
        if (onError) onError('Invalid search type')
        return
    }

    try {
      await searchLocations(searchQuery, filters)
      
      // Announce results to screen readers
      if (resultsAnnouncementRef.current) {
        resultsAnnouncementRef.current.textContent = results.length > 0 
          ? `Found ${results.length} locations`
          : 'No locations found'
      }
    } catch (err: any) {
      console.error('Search error:', err)
    }
  }, [query, filters, searchLocations, results.length, clearError, onError])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
    
    if (e.key === 'Escape') {
      clearResults()
      setQuery('')
      clearError()
      clearGpsError()
    }
  }, [handleSubmit, clearResults, clearError, clearGpsError])

  const handleUseCurrentLocation = useCallback(async () => {
    clearGpsError()
    
    try {
      const position = await getCurrentPosition()
      const searchQuery: SearchQuery = {
        type: 'coordinates',
        value: position
      }
      
      await searchLocations(searchQuery, filters)
      setQuery(`${position.latitude}, ${position.longitude}`)
      
      // Announce GPS success to screen readers
      if (resultsAnnouncementRef.current) {
        resultsAnnouncementRef.current.textContent = `Using your current location. Found ${results.length} locations nearby.`
      }
    } catch (err: any) {
      console.error('GPS error:', err)
    }
  }, [getCurrentPosition, searchLocations, filters, results.length, clearGpsError])

  const handleClearSearch = useCallback(() => {
    setQuery('')
    clearResults()
    clearError()
    clearGpsError()
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [clearResults, clearError, clearGpsError])

  const handleFilterChange = useCallback((filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }, [])

  const currentError = error || gpsError
  const isLoading = loading || gpsLoading

  return (
    <div className={`search-form ${className}`}>
      <form onSubmit={handleSubmit} role="search" aria-label="Search for food assistance locations">
        {/* Main search input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <label htmlFor="location-search" className="sr-only">
              Search by ZIP code or address
            </label>
            <input
              ref={inputRef}
              id="location-search"
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue focus:border-trust-blue text-lg"
              aria-describedby={currentError ? "search-error" : "search-help"}
              aria-invalid={!!currentError}
              disabled={isLoading}
              data-testid="search-input"
            />
            
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
                data-testid="clear-search"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-trust-blue text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-trust-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="search-button"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLoading}
              className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-trust-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Use my current location"
              data-testid="gps-button"
            >
              {gpsLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Help text */}
        <p id="search-help" className="text-sm text-gray-600 mb-4">
          Enter a ZIP code (e.g., 12345) or address to find nearby food assistance locations
        </p>

        {/* Error message */}
        {currentError && (
          <div 
            id="search-error" 
            role="alert" 
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            data-testid="error-message"
          >
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{currentError}</span>
            </div>
          </div>
        )}

        {/* Advanced filters toggle */}
        {showFilters && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-trust-blue hover:text-blue-700 font-medium flex items-center"
              aria-expanded={showAdvancedFilters}
              data-testid="filters-toggle"
            >
              <svg 
                className={`w-4 h-4 mr-1 transform transition-transform ${showAdvancedFilters ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        )}

        {/* Advanced filters panel */}
        {showFilters && showAdvancedFilters && (
          <div className="p-4 bg-gray-50 rounded-lg mb-4" data-testid="filters-panel">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filter Results</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search radius */}
              <div>
                <label htmlFor="radius-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius
                </label>
                <select
                  id="radius-filter"
                  value={filters.radius || 10}
                  onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-trust-blue focus:border-trust-blue"
                >
                  <option value={5}>5 miles</option>
                  <option value={10}>10 miles</option>
                  <option value={15}>15 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Status
                </label>
                <div className="space-y-1">
                  {['open', 'limited', 'by_appointment'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.currentStatus?.includes(status) || false}
                        onChange={(e) => {
                          const currentStatuses = filters.currentStatus || []
                          const newStatuses = e.target.checked
                            ? [...currentStatuses, status]
                            : currentStatuses.filter(s => s !== status)
                          handleFilterChange('currentStatus', newStatuses)
                        }}
                        className="mr-2 rounded border-gray-300 text-trust-blue focus:ring-trust-blue"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Screen reader announcements */}
      <div 
        ref={resultsAnnouncementRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        data-testid="results-announcement"
      />
    </div>
  )
}

export default SearchForm 