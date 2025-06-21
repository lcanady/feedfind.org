'use client'

import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  className = '',
  style = {}
}) => {
  const { user } = useAuth()
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // Check if user has ad-free subscription
  const isAdFree = user?.profile?.adPreferences?.subscriptionType === 'ad-free' || 
                   user?.profile?.adPreferences?.subscriptionType === 'premium' ||
                   user?.profile?.adPreferences?.showAds === false

  // Only render AdSense if we have a valid client ID (not a placeholder)
  const isValidClientId = clientId && 
    clientId !== 'ca-pub-1234567890123456' && 
    clientId !== 'ca-pub-your-client-id' &&
    clientId.startsWith('ca-pub-')

  useEffect(() => {
    if (typeof window !== 'undefined' && isValidClientId && !isAdFree) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [isValidClientId, isAdFree])

  // Don't render ads for ad-free users
  if (isAdFree) {
    return null
  }

  // If no valid client ID, render placeholder
  if (!isValidClientId) {
    return (
      <div className={`${className}`} style={style}>
        <div 
          className="border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm"
          style={{ minHeight: style.minHeight || '90px' }}
        >
          Ad Space
        </div>
      </div>
    )
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Pre-configured ad components for common placements
export const HeaderAd: React.FC = () => (
  <AdSense
    adSlot="1234567890" // Replace with actual ad slot
    adFormat="horizontal"
    className="mb-4"
    style={{ textAlign: 'center', minHeight: '90px', backgroundColor: '#f9fafb' }}
  />
)

export const SidebarAd: React.FC = () => (
  <AdSense
    adSlot="1234567891" // Replace with actual ad slot
    adFormat="rectangle"
    className="mb-4"
    style={{ textAlign: 'center', minHeight: '250px', backgroundColor: '#f9fafb' }}
  />
)

export const FooterAd: React.FC = () => (
  <AdSense
    adSlot="1234567892" // Replace with actual ad slot
    adFormat="horizontal"
    className="mt-4"
    style={{ textAlign: 'center', minHeight: '90px', backgroundColor: '#f9fafb' }}
  />
) 