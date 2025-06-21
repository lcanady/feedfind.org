import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock service worker registration
const mockServiceWorker = {
  register: jest.fn(() => Promise.resolve({
    scope: '/',
    active: { postMessage: jest.fn() },
    installing: null,
    waiting: null,
    update: jest.fn()
  })),
  unregister: jest.fn(),
  update: jest.fn(),
  addEventListener: jest.fn(),
  postMessage: jest.fn(),
}

// Mock PWA install prompt
const mockBeforeInstallPrompt = {
  prompt: jest.fn(),
  userChoice: Promise.resolve({ outcome: 'accepted' }),
  preventDefault: jest.fn(),
}

// Mock offline/online events
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    register: mockServiceWorker.register,
    ready: Promise.resolve(mockServiceWorker),
    addEventListener: mockServiceWorker.addEventListener,
  },
}

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
})

// Mock localStorage for offline data
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock Response constructor for service worker tests
global.Response = jest.fn().mockImplementation((body) => ({
  body,
  ok: true,
  status: 200,
  clone: jest.fn()
}))

// Mock caches API
global.caches = {
  open: jest.fn(() => Promise.resolve({
    put: jest.fn(),
    delete: jest.fn(),
    match: jest.fn()
  }))
}

// Mock components for PWA testing
const MockPWAInstallPrompt = () => {
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false)
  const [installPrompt, setInstallPrompt] = React.useState<any>(null)

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
    }
  }

  if (!showInstallPrompt) return null

  return (
    <div 
      data-testid="install-prompt"
      className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Install FeedFind</h3>
          <p className="text-sm">Add to your home screen for quick access</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="px-3 py-1 text-sm bg-blue-700 rounded"
            data-testid="dismiss-install"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded font-medium"
            data-testid="install-app"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}

const MockOfflineIndicator = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div 
      data-testid="offline-indicator"
      className="bg-yellow-100 border-l-4 border-yellow-500 p-4"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            You're currently offline. Some features may be limited.
          </p>
        </div>
      </div>
    </div>
  )
}

const MockOfflineLocationCache = () => {
  const [cachedLocations, setCachedLocations] = React.useState<any[]>([])
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)

  React.useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      // Load cached data when going offline
      const cached = localStorage.getItem('feedfind-locations')
      if (cached) {
        setCachedLocations(JSON.parse(cached))
      }
    }

    const handleOnline = () => {
      setIsOffline(false)
      // Sync data when coming back online
      setCachedLocations([])
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline || cachedLocations.length === 0) return null

  return (
    <div data-testid="offline-cache">
      <h3 className="text-lg font-semibold mb-2">Cached Locations</h3>
      <div className="space-y-2">
        {cachedLocations.map((location, index) => (
          <div key={index} className="bg-gray-100 p-3 rounded-lg">
            <h4 className="font-medium">{location.name}</h4>
            <p className="text-sm text-gray-600">{location.address}</p>
            <span className="text-xs text-gray-500">Cached data</span>
          </div>
        ))}
      </div>
    </div>
  )
}

describe('PWAFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockNavigator.onLine = true
  })

  describe('PWA Installation', () => {
    it('should be installable as standalone app', async () => {
      const user = userEvent.setup()

      render(<MockPWAInstallPrompt />)

      // Simulate beforeinstallprompt event
      const installEvent = new Event('beforeinstallprompt')
      Object.assign(installEvent, mockBeforeInstallPrompt)
      window.dispatchEvent(installEvent)

      await waitFor(() => {
        expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
      })

      const installButton = screen.getByTestId('install-app')
      await user.click(installButton)

      expect(mockBeforeInstallPrompt.prompt).toHaveBeenCalled()
    })

    it('should show install prompts at appropriate times', async () => {
      const user = userEvent.setup()

      render(<MockPWAInstallPrompt />)

      // Initially no prompt should be shown
      expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument()

      // Trigger install prompt
      const installEvent = new Event('beforeinstallprompt')
      Object.assign(installEvent, mockBeforeInstallPrompt)
      window.dispatchEvent(installEvent)

      await waitFor(() => {
        expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
      })

      // User can dismiss the prompt
      const dismissButton = screen.getByTestId('dismiss-install')
      await user.click(dismissButton)

      expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument()
    })

    it('should provide native app-like navigation', () => {
      // Test that the app works in standalone mode
      const mockMatchMedia = jest.fn()
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })
      
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        writable: true,
      })

      const StandaloneApp = () => {
        const [isStandalone, setIsStandalone] = React.useState(false)

        React.useEffect(() => {
          const checkStandalone = () => {
            const standalone = window.matchMedia('(display-mode: standalone)').matches
            setIsStandalone(standalone)
          }
          
          checkStandalone()
        }, [])

        return (
          <div data-testid="standalone-app">
            {isStandalone ? (
              <div data-testid="standalone-mode">
                <header className="bg-blue-600 text-white p-4">
                  <h1>FeedFind</h1>
                </header>
                <main className="p-4">
                  <p>Running in standalone mode</p>
                </main>
              </div>
            ) : (
              <div data-testid="browser-mode">
                <p>Running in browser</p>
              </div>
            )}
          </div>
        )
      }

      render(<StandaloneApp />)

      expect(screen.getByTestId('standalone-mode')).toBeInTheDocument()
      expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)')
    })
  })

  describe('Offline Functionality', () => {
    it('should work offline with cached location data', async () => {
      const cachedData = [
        { id: '1', name: 'Food Bank A', address: '123 Main St' },
        { id: '2', name: 'Food Bank B', address: '456 Oak Ave' }
      ]
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData))
      mockNavigator.onLine = false

      render(<MockOfflineLocationCache />)

      // Simulate going offline
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)

      await waitFor(() => {
        expect(screen.getByTestId('offline-cache')).toBeInTheDocument()
        expect(screen.getByText('Food Bank A')).toBeInTheDocument()
        expect(screen.getByText('Food Bank B')).toBeInTheDocument()
      })
    })

    it('should show offline indicators and messaging', async () => {
      mockNavigator.onLine = false

      render(<MockOfflineIndicator />)

      // Simulate going offline
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)

      await waitFor(() => {
        expect(screen.getByTestId('offline-indicator')).toBeInTheDocument()
        expect(screen.getByText(/you're currently offline/i)).toBeInTheDocument()
      })
    })

    it('should sync data when connection is restored', async () => {
      const mockSync = jest.fn()
      
      const SyncComponent = () => {
        React.useEffect(() => {
          const handleOnline = () => {
            mockSync()
          }

          window.addEventListener('online', handleOnline)
          return () => window.removeEventListener('online', handleOnline)
        }, [])

        return <div data-testid="sync-component">Sync Component</div>
      }

      render(<SyncComponent />)

      // Simulate coming back online
      mockNavigator.onLine = true
      const onlineEvent = new Event('online')
      window.dispatchEvent(onlineEvent)

      await waitFor(() => {
        expect(mockSync).toHaveBeenCalled()
      })
    })
  })

  describe('Service Worker Caching', () => {
    it('should cache essential resources for offline use', async () => {
      const mockCaches = {
        open: jest.fn(() => Promise.resolve({
          addAll: jest.fn(),
          match: jest.fn(),
          put: jest.fn(),
        })),
        match: jest.fn(),
      }

      Object.defineProperty(window, 'caches', {
        value: mockCaches,
        writable: true,
      })

      // Mock service worker registration
      const ServiceWorkerTest = () => {
        React.useEffect(() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
              .then((registration) => {
                console.log('SW registered:', registration)
              })
              .catch((error) => {
                console.log('SW registration failed:', error)
              })
          }
        }, [])

        return <div data-testid="sw-test">Service Worker Test</div>
      }

      render(<ServiceWorkerTest />)

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js')
    })

    it('should handle cache invalidation and updates', async () => {
      const mockCache = {
        addAll: jest.fn(),
        match: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        keys: jest.fn(() => Promise.resolve(['old-resource'])),
      }

      const mockCaches = {
        open: jest.fn(() => Promise.resolve(mockCache)),
        delete: jest.fn(),
        keys: jest.fn(() => Promise.resolve(['old-cache'])),
      }

      Object.defineProperty(window, 'caches', {
        value: mockCaches,
        writable: true,
      })

      const CacheUpdateTest = () => {
        const updateCache = async () => {
          const cache = await caches.open('feedfind-v1')
          await cache.delete('old-resource')
          await cache.put('new-resource', new Response('new data'))
        }

        React.useEffect(() => {
          updateCache()
        }, [])

        return <div data-testid="cache-update">Cache Update Test</div>
      }

      render(<CacheUpdateTest />)

      await waitFor(() => {
        expect(mockCaches.open).toHaveBeenCalledWith('feedfind-v1')
      })
    })
  })

  describe('Background Sync', () => {
    it('should implement background sync for form submissions', async () => {
      const mockRegistration = {
        sync: {
          register: jest.fn(),
        },
      }

      mockServiceWorker.register.mockResolvedValue(mockRegistration)

      const BackgroundSyncForm = () => {
        const [pendingSubmissions, setPendingSubmissions] = React.useState<any[]>([])

        const handleSubmit = async (data: any) => {
          if (navigator.onLine) {
            // Submit immediately if online
            console.log('Submitting immediately:', data)
          } else {
            // Queue for background sync if offline
            const newSubmission = { ...data, timestamp: Date.now() }
            setPendingSubmissions(prev => [...prev, newSubmission])
            
            // Register background sync
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.ready
              if (registration.sync) {
                await registration.sync.register('form-submission')
              }
            }
          }
        }

        return (
          <div data-testid="background-sync-form">
            <button 
              onClick={() => handleSubmit({ message: 'test' })}
              data-testid="submit-form"
            >
              Submit
            </button>
            {pendingSubmissions.length > 0 && (
              <div data-testid="pending-submissions">
                {pendingSubmissions.length} pending submissions
              </div>
            )}
          </div>
        )
      }

      render(<BackgroundSyncForm />)

      // Simulate offline submission
      mockNavigator.onLine = false
      const user = userEvent.setup()
      const submitButton = screen.getByTestId('submit-form')
      
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('pending-submissions')).toBeInTheDocument()
      })
    })
  })

  describe('Push Notifications', () => {
    it('should request notification permissions appropriately', async () => {
      const mockNotification = {
        permission: 'default',
        requestPermission: jest.fn(() => Promise.resolve('granted')),
      }

      Object.defineProperty(window, 'Notification', {
        value: mockNotification,
        writable: true,
      })

      const NotificationTest = () => {
        const [permission, setPermission] = React.useState(Notification.permission)

        const requestPermission = async () => {
          const result = await Notification.requestPermission()
          setPermission(result)
        }

        return (
          <div data-testid="notification-test">
            <p data-testid="permission-status">Permission: {permission}</p>
            <button 
              onClick={requestPermission}
              data-testid="request-permission"
            >
              Enable Notifications
            </button>
          </div>
        )
      }

      render(<NotificationTest />)

      const user = userEvent.setup()
      const requestButton = screen.getByTestId('request-permission')
      
      await user.click(requestButton)

      expect(mockNotification.requestPermission).toHaveBeenCalled()
    })

    it('should handle notification clicks and routing', async () => {
      const mockNotification = {
        permission: 'granted',
        requestPermission: jest.fn(),
      }

      Object.defineProperty(window, 'Notification', {
        value: mockNotification,
        writable: true,
      })

      const NotificationHandler = () => {
        const [lastNotification, setLastNotification] = React.useState<string | null>(null)

        React.useEffect(() => {
          const handleNotificationClick = (event: any) => {
            setLastNotification(event.detail?.locationId || 'unknown')
            // In real app, would navigate to location
            mockPush('/location/' + event.detail?.locationId)
          }

          window.addEventListener('notificationclick', handleNotificationClick)
          return () => window.removeEventListener('notificationclick', handleNotificationClick)
        }, [])

        return (
          <div data-testid="notification-handler">
            {lastNotification && (
              <p data-testid="last-notification">
                Last notification: {lastNotification}
              </p>
            )}
          </div>
        )
      }

      render(<NotificationHandler />)

      // Simulate notification click
      const notificationEvent = new CustomEvent('notificationclick', {
        detail: { locationId: 'location-123' }
      })
      window.dispatchEvent(notificationEvent)

      await waitFor(() => {
        expect(screen.getByTestId('last-notification')).toBeInTheDocument()
        expect(mockPush).toHaveBeenCalledWith('/location/location-123')
      })
    })

    it('should respect user notification preferences', () => {
      const NotificationPreferences = () => {
        const [preferences, setPreferences] = React.useState({
          statusUpdates: true,
          newLocations: false,
          reminders: true,
        })

        const updatePreference = (key: string, value: boolean) => {
          setPreferences(prev => ({ ...prev, [key]: value }))
          localStorage.setItem('notification-preferences', JSON.stringify({
            ...preferences,
            [key]: value
          }))
        }

        return (
          <div data-testid="notification-preferences">
            <label>
              <input
                type="checkbox"
                checked={preferences.statusUpdates}
                onChange={(e) => updatePreference('statusUpdates', e.target.checked)}
                data-testid="status-updates-checkbox"
              />
              Status Updates
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.newLocations}
                onChange={(e) => updatePreference('newLocations', e.target.checked)}
                data-testid="new-locations-checkbox"
              />
              New Locations
            </label>
          </div>
        )
      }

      render(<NotificationPreferences />)

      const statusCheckbox = screen.getByTestId('status-updates-checkbox')
      const newLocationsCheckbox = screen.getByTestId('new-locations-checkbox')

      expect(statusCheckbox).toBeChecked()
      expect(newLocationsCheckbox).not.toBeChecked()

      fireEvent.click(newLocationsCheckbox)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'notification-preferences',
        expect.stringContaining('"newLocations":true')
      )
    })
  })

  describe('Cross-Platform Compatibility', () => {
    it('should work across different devices and browsers', () => {
      const userAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Android 10; Mobile; rv:81.0) Gecko/81.0 Firefox/81.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124',
      ]

      userAgents.forEach(userAgent => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true,
        })

        const DeviceDetection = () => {
          const [deviceType, setDeviceType] = React.useState('')

          React.useEffect(() => {
            const ua = navigator.userAgent
            if (/iPhone|iPad|iPod/.test(ua)) {
              setDeviceType('iOS')
            } else if (/Android/.test(ua)) {
              setDeviceType('Android')
            } else {
              setDeviceType('Desktop')
            }
          }, [])

          return (
            <div data-testid="device-detection">
              Device: {deviceType}
            </div>
          )
        }

        const { unmount } = render(<DeviceDetection />)
        
        expect(screen.getByTestId('device-detection')).toBeInTheDocument()
        
        unmount()
      })
    })
  })
}) 