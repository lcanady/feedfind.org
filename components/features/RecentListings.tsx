'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { LocationService } from '../../lib/databaseService'
import { seedIfEmpty } from '../../lib/seedData'
import type { Location, OperatingHours } from '../../types/database'
import { useLocation } from '@/hooks/useLocation'

interface RecentListingsProps {
  limit?: number
  className?: string
}

interface LocationWithDistance extends Location {
  distance?: number
  timeAgo?: string
}

const formatOperatingHours = (hours: OperatingHours): string => {
  const dayIndex = new Date().getDay()
  const days = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  } as const
  
  const today = days[dayIndex as keyof typeof days]
  const todayHours = hours[today]

  if (!todayHours) {
    return 'Hours not available'
  }

  if (todayHours.closed) {
    return 'Closed today'
  }
  
  if (todayHours.open && todayHours.close) {
    return `Open today ${todayHours.open} - ${todayHours.close}`
  }
  
  return 'Hours not available'
}

const RecentListings: React.FC<RecentListingsProps> = ({ 
  limit = 5, 
  className = '' 
}) => {
  const [listings, setListings] = useState<LocationWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const { zipCode } = useLocation()

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        setLoading(true)
        const locationService = new LocationService()
        
        // First, ensure we have some data
        await seedIfEmpty()
        
        // Fetch recent locations ordered by last update, filtered by user's location if available
        const results = await locationService.getRecentListings(limit, zipCode || '')

        const locations: LocationWithDistance[] = results.map(doc => {
          const location: LocationWithDistance = {
            ...doc,
            distance: (doc as any).distance // Distance will be calculated if zipCode was provided
          }

          // Calculate time ago
          if (doc.updatedAt) {
            const updateTime = doc.updatedAt instanceof Date 
              ? doc.updatedAt 
              : doc.updatedAt.toDate()
            const now = new Date()
            const diffInHours = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60 * 60))
            
            if (diffInHours < 1) {
              location.timeAgo = 'Just updated'
            } else if (diffInHours === 1) {
              location.timeAgo = '1 hour ago'
            } else if (diffInHours < 24) {
              location.timeAgo = `${diffInHours} hours ago`
            } else {
              const diffInDays = Math.floor(diffInHours / 24)
              location.timeAgo = diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
            }
          }

          return location
        })

        setListings(locations)
      } catch (err) {
        console.error('Error fetching recent listings:', err)
        setError('Failed to load recent listings')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentListings()
  }, [limit, zipCode])

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'open':
        return { 
          text: '🟢 OPEN NOW', 
          className: 'text-green-600 font-medium',
          ariaLabel: 'Currently open'
        }
      case 'limited':
        return { 
          text: '🟡 LIMITED STOCK', 
          className: 'text-amber-600 font-medium',
          ariaLabel: 'Limited availability'
        }
      case 'closed':
        return { 
          text: '🔴 CLOSED', 
          className: 'text-red-600 font-medium',
          ariaLabel: 'Currently closed'
        }
      default:
        return { 
          text: '❓ STATUS UNKNOWN', 
          className: 'text-gray-600 font-medium',
          ariaLabel: 'Status unknown'
        }
    }
  }

  const getAvailabilityBadge = (location: Location) => {
    if (location.currentStatus === 'open') {
      return {
        text: 'available',
        className: 'bg-green-100 text-green-800'
      }
    } else if (location.currentStatus === 'limited') {
      return {
        text: 'limited stock',
        className: 'bg-amber-100 text-amber-800'
      }
    } else {
      return {
        text: 'closed',
        className: 'bg-red-100 text-red-800'
      }
    }
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} text-center text-gray-500 py-4`}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline mt-2"
        >
          Try again
        </button>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className={`${className} text-center text-gray-500 py-8`}>
        <p>No recent listings available{zipCode ? ' in your area' : ''}.</p>
        <Link 
          href="/search" 
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Search for locations
        </Link>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {listings.map((location) => {
          const statusDisplay = getStatusDisplay(location.currentStatus)
          const availabilityBadge = getAvailabilityBadge(location)

          return (
            <article 
              key={location.id} 
              className="border-b border-gray-200 pb-3 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-blue-600 hover:underline font-medium">
                    <Link 
                      href={`/location/${location.id}`}
                      className="block"
                      aria-label={`View details for ${location.name}`}
                    >
                      {location.name}
                    </Link>
                  </h3>
                  {location.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {location.description}
                    </p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4 flex-wrap">
                    <span className="flex items-center">
                      📍 {location.address}
                      {location.distance !== undefined && (
                        <span className="ml-1">
                          ({location.distance.toFixed(1)} miles)
                        </span>
                      )}
                    </span>
                    <span 
                      className={statusDisplay.className}
                      aria-label={statusDisplay.ariaLabel}
                    >
                      {statusDisplay.text}
                    </span>
                    {location.operatingHours && (
                      <span className="flex items-center">
                        ⏰ {formatOperatingHours(location.operatingHours)}
                      </span>
                    )}
                    {location.eligibilityRequirements?.length === 0 && (
                      <span className="flex items-center">
                        👥 No registration required
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 text-right text-xs text-gray-500 flex-shrink-0">
                  {location.timeAgo && (
                    <div className="mb-1">
                      updated: {location.timeAgo}
                    </div>
                  )}
                  <div>
                    <span 
                      className={`inline-block px-2 py-1 rounded text-xs ${availabilityBadge.className}`}
                    >
                      {availabilityBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to get current operating hours
function getCurrentHours(operatingHours: any): string {
  const today = new Date().getDay()
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today] as keyof typeof operatingHours
  
  const todayHours = operatingHours[dayName]
  if (!todayHours || todayHours.closed) {
    return 'Closed today'
  }
  
  return `${todayHours.open}-${todayHours.close}`
}

export default RecentListings 