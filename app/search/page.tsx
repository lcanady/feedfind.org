'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SearchForm } from '../../components/search/SearchForm'
import Header from '../../components/layout/Header'
import { FooterAd } from '../../components/ui/AdSense'
import type { LocationSearchResult } from '../../types/database'

function SearchPageContent() {
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()

  // Get initial query from URL parameters
  const initialQuery = searchParams.get('q') || ''
  const initialStatus = searchParams.get('status') || undefined
  const initialRadius = searchParams.get('radius') || undefined

  const handleResults = (searchResults: LocationSearchResult[]) => {
    setResults(searchResults)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading)
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Food Assistance Near You
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search for food banks, pantries, and other food assistance locations in your area. 
              Get real-time availability information to ensure you don't make a wasted trip.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <SearchForm
              onResults={handleResults}
              onError={handleError}
              onLoading={handleLoading}
              initialQuery={initialQuery}
              autoFocus={!initialQuery} // Only auto-focus if no initial query
              showFilters={true}
              className="w-full"
            />
          </div>

          {/* Results Section */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Searching for locations...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} location{results.length !== 1 ? 's' : ''}
              </h2>
              
              <div className="grid gap-6">
                {results.map((result, index) => (
                  <div key={result.location.id || index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {result.location.name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {result.location.address}
                        </p>
                        {result.distance && (
                          <p className="text-sm text-gray-500">
                            {result.distance.toFixed(1)} miles away
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {/* Status Badge */}
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                            result.currentStatus === 'open' 
                              ? 'bg-green-100 text-green-800'
                              : result.currentStatus === 'limited'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                                                     {result.currentStatus === 'open' && '🟢 Open'}
                           {result.currentStatus === 'limited' && '🟡 Limited'}
                           {result.currentStatus === 'closed' && '🔴 Closed'}
                           {!result.currentStatus && '❓ Status Unknown'}
                        </span>
                        
                        {/* Rating */}
                        {result.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="text-sm text-gray-600">
                              {result.rating.toFixed(1)} ({result.reviewCount || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {result.location.description && (
                      <p className="text-gray-700 mb-4 text-sm">
                        {result.location.description}
                      </p>
                    )}

                    {/* Operating Hours */}
                    {result.location.operatingHours && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Hours</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
                          {Object.entries(result.location.operatingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}:</span>
                              <span>{hours && !hours.closed ? `${hours.open} - ${hours.close}` : 'Closed'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {result.location.phone && (
                        <a 
                          href={`tel:${result.location.phone}`}
                          className="text-purple-600 hover:text-purple-700 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {result.location.phone}
                        </a>
                      )}
                      
                      {result.location.website && (
                        <a 
                          href={result.location.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Website
                        </a>
                      )}
                      
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(result.location.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Directions
                      </a>
                    </div>

                                         {/* Last Updated */}
                     {result.lastUpdated && (
                       <p className="text-xs text-gray-400 mt-4 border-t pt-3">
                         Status last updated: {
                           result.lastUpdated instanceof Date 
                             ? result.lastUpdated.toLocaleDateString()
                             : new Date((result.lastUpdated as { seconds: number }).seconds * 1000).toLocaleDateString()
                         }
                       </p>
                     )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600">
                Enter your ZIP code or address above to find food assistance locations near you.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Non-obtrusive footer ad */}
          <FooterAd />
          
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">about</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">help & FAQ</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">safety tips</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">terms of use</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">privacy policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
              <ul className="space-y-1">
                <li><Link href="/add-organization" className="text-blue-600 hover:underline">add your organization</Link></li>
                <li><Link href="/update-listing" className="text-blue-600 hover:underline">update your listing</Link></li>
                <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                <li><Link href="/bulkposting" className="text-blue-600 hover:underline">bulk posting</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">community</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">volunteer opportunities</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">donate to local organizations</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">community forums</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">resource guides</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">contact</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">report an issue</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">suggest improvements</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">partnership inquiries</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2025 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main id="main-content" className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search...</p>
          </div>
        </div>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  )
} 