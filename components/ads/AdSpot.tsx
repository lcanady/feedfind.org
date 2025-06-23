'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface AdSpotProps {
  id: string
  size: 'small' | 'medium' | 'large' | 'banner'
  className?: string
  fallbackContent?: React.ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
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

  React.useEffect(() => {
    // Here we would integrate with the actual ad service (e.g., Google AdSense)
    // For now, we'll simulate ad loading
    const loadAd = async () => {
      try {
        // Simulate ad loading delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoaded(true)
        onLoad?.()
      } catch (error) {
        setHasError(true)
        onError?.(error as Error)
      }
    }

    loadAd()
  }, [onLoad, onError])

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

      {/* Ad Content */}
      {isLoaded && !hasError && (
        <div className="w-full h-full flex items-center justify-center">
          {/* This is where the actual ad would be rendered */}
          <div className="text-center text-gray-400">
            <p>Advertisement Demo</p>
            <p className="text-xs mt-1">{size} format</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdSpot 