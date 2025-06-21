import React from 'react'
import { useRouter } from 'next/navigation'

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
  showBottomNav?: boolean
  title?: string
  onBack?: () => void
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  showBottomNav = false,
  title = 'FeedFind',
  onBack,
  primaryAction,
  secondaryAction,
}) => {
  const router = useRouter()
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-md mx-auto relative">
      {/* Offline Indicator */}
      {!isOnline && (
        <div 
          className="bg-yellow-100 border-l-4 border-yellow-500 p-3 text-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center">
            <svg 
              className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-800">You're offline. Some features may be limited.</span>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header 
        className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50"
        role="banner"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={handleBackClick}
                className="mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Go back"
                data-testid="back-button"
              >
                <svg 
                  className="w-5 h-5 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>
          
          {/* Header actions */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Menu"
              data-testid="menu-button"
            >
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        className="flex-1 overflow-y-auto pb-safe"
        role="main"
        data-testid="main-content"
      >
        {children}
      </main>

      {/* Bottom Action Bar - Optimized for thumb reach */}
      {(primaryAction || secondaryAction || showBottomNav) && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 pb-safe">
          {/* Primary and Secondary Actions */}
          {(primaryAction || secondaryAction) && (
            <div className="flex gap-3 mb-3">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="flex-1 min-h-[48px] py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="primary-action"
                >
                  {primaryAction.label}
                </button>
              )}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="min-h-[48px] py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  data-testid="secondary-action"
                >
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}

          {/* Bottom Navigation */}
          {showBottomNav && (
            <nav 
              className="flex justify-around"
              role="navigation"
              aria-label="Main navigation"
              data-testid="bottom-navigation"
            >
              <button
                onClick={() => router.push('/')}
                className="flex flex-col items-center py-2 px-3 min-h-[48px] min-w-[48px] rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Home"
              >
                <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs text-gray-600">Home</span>
              </button>
              
              <button
                onClick={() => router.push('/search')}
                className="flex flex-col items-center py-2 px-3 min-h-[48px] min-w-[48px] rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs text-gray-600">Search</span>
              </button>
              
              <button
                onClick={() => router.push('/map')}
                className="flex flex-col items-center py-2 px-3 min-h-[48px] min-w-[48px] rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Map"
              >
                <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-xs text-gray-600">Map</span>
              </button>
              
              <button
                onClick={() => router.push('/profile')}
                className="flex flex-col items-center py-2 px-3 min-h-[48px] min-w-[48px] rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Profile"
              >
                <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-gray-600">Profile</span>
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onTap?: () => void
  swipeable?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  onTap,
  swipeable = false,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [startX, setStartX] = React.useState(0)
  const [currentX, setCurrentX] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (swipeable && e.touches[0]) {
      setStartX(e.touches[0].clientX)
      setIsDragging(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeable && isDragging && e.touches[0]) {
      setCurrentX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    if (swipeable && isDragging) {
      const diff = startX - currentX
      const threshold = 50 // Minimum swipe distance

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && onSwipeLeft) {
          onSwipeLeft()
        } else if (diff < 0 && onSwipeRight) {
          onSwipeRight()
        }
      }

      setIsDragging(false)
      setStartX(0)
      setCurrentX(0)
    }
  }

  const handleClick = () => {
    if (!isDragging && onTap) {
      onTap()
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 touch-manipulation ${
        onTap ? 'cursor-pointer hover:bg-gray-50' : ''
      } ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="mobile-card"
    >
      {children}
    </div>
  )
}

// Mobile-optimized form input
interface MobileInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
}) => {
  const inputId = React.useId()

  return (
    <div className="mb-4">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        data-testid="mobile-input"
      />
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Mobile-optimized button
interface MobileButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}) => {
  const baseClasses = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  }

  const sizeClasses = {
    small: 'min-h-[40px] px-3 py-2 text-sm',
    medium: 'min-h-[44px] px-4 py-2.5 text-base',
    large: 'min-h-[48px] px-6 py-3 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      data-testid="mobile-button"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
} 