'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export interface AdSpotProps {
  id: string
  size: 'small' | 'medium' | 'large' | 'banner'
  className?: string
  fallbackContent?: React.ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
}

// Map our size options to AdSense formats
const adFormatMap = {
  small: 'rectangle',
  medium: 'rectangle',
  large: 'horizontal',
  banner: 'horizontal'
}

const sizeClasses = {
  small: 'w-[300px] h-[250px]',
  medium: 'w-[336px] h-[280px]',
  large: 'w-[728px] h-[90px]',
  banner: 'w-full h-[90px]'
}

export const AdSpot: React.FC<AdSpotProps> = ({
  id,
  size,
  className,
  fallbackContent,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const { user } = useAuth()
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // Check if user has ad-free subscription
  const isAdFree = user?.profile?.adPreferences?.subscriptionType === 'ad-free' || 
                   user?.profile?.adPreferences?.subscriptionType === 'premium' ||
                   user?.profile?.adPreferences?.showAds === false

  // Only render AdSense if we have a valid client ID
  const isValidClientId = clientId && 
    clientId !== 'ca-pub-1234567890123456' && 
    clientId !== 'ca-pub-your-client-id' &&
    clientId.startsWith('ca-pub-')

  React.useEffect(() => {
    if (typeof window !== 'undefined' && isValidClientId && !isAdFree) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        setIsLoaded(true)
        onLoad?.()
      } catch (error) {
        setHasError(true)
        onError?.(error as Error)
        console.error('AdSense error:', error)
      }
    }
  }, [isValidClientId, isAdFree, onLoad, onError])

  // Don't render ads for ad-free users
  if (isAdFree) {
    return null
  }

  // If no valid client ID, show placeholder
  if (!isValidClientId) {
    return (
      <div
        id={`ad-spot-${id}`}
        className={cn(
          'relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden',
          sizeClasses[size],
          className
        )}
        role="complementary"
        aria-label="Advertisement"
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Advertisement Demo</p>
            <p className="text-xs text-gray-400 mt-1">{size} format</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      id={`ad-spot-${id}`}
      className={cn(
        'adsense-container',
        sizeClasses[size],
        className
      )}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
            <span className="mt-2 text-sm text-gray-500">Loading advertisement...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {fallbackContent || (
            <div className="text-center">
              <p className="text-sm text-gray-500">Advertisement unavailable</p>
              <p className="text-xs text-gray-400 mt-1">Please try again later</p>
            </div>
          )}
        </div>
      )}

      {/* AdSense Ad */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={id}
        data-ad-format={adFormatMap[size]}
        data-full-width-responsive={size === 'banner' ? 'true' : 'false'}
      />
    </div>
  )
}

export default AdSpot 