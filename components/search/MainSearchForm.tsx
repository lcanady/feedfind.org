'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parseLocationQuery } from '../../lib/locationService'
import { useLocationSearch } from '../../hooks/useLocationSearch'
import type { LocationSearchResult } from '../../types/database'

interface DynamicSearchResultsProps {
  results: LocationSearchResult[]
  isOpen: boolean
  onSelect: (result: LocationSearchResult) => void
  loading: boolean
}

const DynamicSearchResults: React.FC<DynamicSearchResultsProps> = ({
  results,
  isOpen,
  onSelect,
  loading
}) => {
  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {loading && (
        <div className="p-4 text-center text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span>Searching...</span>
          </div>
        </div>
      )}
      
      {!loading && results.length === 0 && (
        <div className="p-4 text-gray-500 text-center">
          No results found. Try a different location or ZIP code.
        </div>
      )}
      
      {!loading && results.length > 0 && (
        <ul>
          {results.slice(0, 5).map((result) => (
            <li key={result.location.id}>
              <button
                onClick={() => onSelect(result)}
                className="w-full text-left p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b last:border-b-0 border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {result.location.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {result.location.address}
                    </p>
                    <div className="flex items-center mt-2 space-x-3 text-xs">
                      {result.distance && (
                        <span className="text-gray-500">
                          📍 {result.distance.toFixed(1)} miles
                        </span>
                      )}
                      <span className={`font-medium ${
                        result.currentStatus === 'open' ? 'text-green-600' :
                        result.currentStatus === 'limited' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {result.currentStatus === 'open' ? '🟢 OPEN' :
                         result.currentStatus === 'limited' ? '🟡 LIMITED' :
                         '🔴 CLOSED'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {results.length > 5 && (
            <li className="p-3 text-center text-sm text-gray-500 bg-gray-50">
              Showing 5 of {results.length} results. 
              <button 
                onClick={() => {/* Navigate to full search results */}}
                className="text-purple-600 hover:underline ml-1"
              >
                View all results
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export const MainSearchForm: React.FC = () => {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState({
    openNow: false,
    within5Miles: false,
    noRegistration: false
  })
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  
  const { searchLocations, loading, results, clearResults } = useLocationSearch()

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        clearResults()
        setShowResults(false)
        return
      }

      const parsedQuery = parseLocationQuery(searchQuery.trim())
      
      if (parsedQuery.type === 'invalid') {
        // Still try to search, but might not get good results
        console.warn('Invalid query:', parsedQuery.error)
      }

      // Convert parsed query to search format
      let searchQueryObj
      if (parsedQuery.type === 'zipcode' && parsedQuery.value) {
        searchQueryObj = { type: 'zipcode' as const, value: parsedQuery.value as string }
      } else if (parsedQuery.type === 'coordinates' && parsedQuery.value) {
        // Convert LatLng to Coordinates
        const latLng = parsedQuery.value as { lat: number; lng: number }
        const coordinates = { latitude: latLng.lat, longitude: latLng.lng }
        searchQueryObj = { type: 'coordinates' as const, value: coordinates }
      } else {
        // Treat as address search for now
        searchQueryObj = { type: 'address' as const, value: searchQuery.trim() }
      }

      // Apply filters
      const searchFilters = {
        radius: filters.within5Miles ? 5 : 15,
        ...(filters.openNow && { currentStatus: ['open'] }),
      }

      try {
        console.log('Executing search with:', searchQueryObj, searchFilters)
        await searchLocations(searchQueryObj, searchFilters)
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setShowResults(false)
      }
    }, 300),
    [searchLocations, filters, clearResults]
  )

  // Handle input change with debounced search
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    navigateToFullSearch()
  }

  const navigateToFullSearch = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    // Build search parameters
    const searchParams = new URLSearchParams()
    searchParams.set('q', trimmedQuery)
    
    if (filters.openNow) {
      searchParams.set('status', 'open')
    }
    
    if (filters.within5Miles) {
      searchParams.set('radius', '5')
    }
    
    if (filters.noRegistration) {
      searchParams.set('no_registration', 'true')
    }

    // Navigate to search results page
    router.push(`/search?${searchParams.toString()}`)
    setShowResults(false)
  }

  const handleResultSelect = (result: LocationSearchResult) => {
    // Navigate directly to the location details page
    router.push(`/location/${result.location.id}`)
    setShowResults(false)
  }

  const handleFilterChange = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }))
  }

  const handleInputFocus = () => {
    if (query.trim().length >= 2 && results.length > 0) {
      setShowResults(true)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div ref={searchRef} className="relative">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              id="location-search"
              name="location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="search location (zip code, city, neighborhood)"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-label="Search for food assistance by location"
              autoComplete="off"
            />
            
            <DynamicSearchResults
              results={results}
              isOpen={showResults}
              onSelect={handleResultSelect}
              loading={loading}
            />
          </div>
          
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            search
          </button>
        </form>
        
        <div className="flex gap-4 mt-3 text-xs">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="mr-1"
              checked={filters.openNow}
              onChange={() => handleFilterChange('openNow')}
            />
            open now
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="mr-1"
              checked={filters.within5Miles}
              onChange={() => handleFilterChange('within5Miles')}
            />
            within 5 miles
          </label>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="mr-1"
              checked={filters.noRegistration}
              onChange={() => handleFilterChange('noRegistration')}
            />
            no registration required
          </label>
        </div>
      </div>
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
} 