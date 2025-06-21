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

// Mock Google Maps for touch gesture testing
const mockMap = {
  setZoom: jest.fn(),
  getZoom: jest.fn(() => 10),
  panTo: jest.fn(),
  fitBounds: jest.fn(),
}

// Mock components for testing
const MockLocationMap = ({ onLocationSelect, className }: { 
  onLocationSelect?: (location: any) => void
  className?: string 
}) => {
  const handleTouch = (e: React.TouchEvent) => {
    // Simulate touch interaction
    if (onLocationSelect) {
      onLocationSelect({ id: '1', name: 'Test Location' })
    }
  }

  return (
    <div 
      className={className}
      data-testid="location-map"
      onTouchStart={handleTouch}
      style={{ width: '100%', height: '400px' }}
    >
      <div data-testid="map-marker">Marker</div>
    </div>
  )
}

const MockSwipeableCard = ({ onSwipe, children }: { 
  onSwipe?: (direction: string) => void
  children: React.ReactNode 
}) => {
  const [startX, setStartX] = React.useState(0)
  const [currentX, setCurrentX] = React.useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setStartX(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setCurrentX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    const diff = startX - currentX
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (onSwipe) {
        onSwipe(diff > 0 ? 'left' : 'right')
      }
    }
    setStartX(0)
    setCurrentX(0)
  }

  return (
    <div
      data-testid="swipeable-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="bg-white border rounded-lg p-4 touch-manipulation"
    >
      {children}
    </div>
  )
}

describe('MobileInteractions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Touch Gestures', () => {
    it('should handle swipe gestures on location cards', async () => {
      const mockSwipe = jest.fn()
      const user = userEvent.setup()

      render(
        <MockSwipeableCard onSwipe={mockSwipe}>
          <h3>Food Bank Location</h3>
          <p>123 Main Street</p>
        </MockSwipeableCard>
      )

      const card = screen.getByTestId('swipeable-card')
      expect(card).toBeInTheDocument()

      // Simulate swipe left gesture
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      fireEvent.touchMove(card, {
        touches: [{ clientX: 30, clientY: 100 }]
      })
      fireEvent.touchEnd(card)

      expect(mockSwipe).toHaveBeenCalledWith('left')
    })

    it('should handle swipe gestures on map interface', async () => {
      const mockLocationSelect = jest.fn()

      render(
        <MockLocationMap 
          onLocationSelect={mockLocationSelect}
          className="w-full h-96"
        />
      )

      const map = screen.getByTestId('location-map')
      expect(map).toBeInTheDocument()

      // Simulate touch interaction on map
      fireEvent.touchStart(map, {
        touches: [{ clientX: 150, clientY: 150 }]
      })

      expect(mockLocationSelect).toHaveBeenCalledWith({
        id: '1',
        name: 'Test Location'
      })
    })

    it('should provide haptic feedback for important actions', () => {
      // Mock vibration API
      const mockVibrate = jest.fn()
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true
      })

      const HapticButton = () => {
        const handleClick = () => {
          if (navigator.vibrate) {
            navigator.vibrate(50) // Short vibration
          }
        }

        return (
          <button 
            onClick={handleClick}
            data-testid="haptic-button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Find Locations
          </button>
        )
      }

      render(<HapticButton />)

      const button = screen.getByTestId('haptic-button')
      fireEvent.click(button)

      expect(mockVibrate).toHaveBeenCalledWith(50)
    })
  })

  describe('Pinch-to-Zoom', () => {
    it('should handle pinch-to-zoom on maps', () => {
      const ZoomableMap = () => {
        const [zoom, setZoom] = React.useState(10)

        const handleWheel = (e: React.WheelEvent) => {
          e.preventDefault()
          const newZoom = e.deltaY > 0 ? Math.max(1, zoom - 1) : Math.min(20, zoom + 1)
          setZoom(newZoom)
        }

        return (
          <div
            data-testid="zoomable-map"
            onWheel={handleWheel}
            className="w-full h-96 bg-gray-200 relative overflow-hidden"
            style={{ touchAction: 'manipulation' }}
          >
            <div data-testid="zoom-level">Zoom: {zoom}</div>
            <div className="absolute inset-0 flex items-center justify-center">
              Map Content
            </div>
          </div>
        )
      }

      render(<ZoomableMap />)

      const map = screen.getByTestId('zoomable-map')
      const zoomLevel = screen.getByTestId('zoom-level')

      expect(zoomLevel).toHaveTextContent('Zoom: 10')

      // Simulate zoom in (wheel up)
      fireEvent.wheel(map, { deltaY: -100 })
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('Zoom: 11')

      // Simulate zoom out (wheel down)
      fireEvent.wheel(map, { deltaY: 100 })
      fireEvent.wheel(map, { deltaY: 100 })
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('Zoom: 9')
    })

    it('should respect zoom boundaries', () => {
      const BoundedZoomMap = () => {
        const [zoom, setZoom] = React.useState(1) // Start at minimum

        const handleWheel = (e: React.WheelEvent) => {
          e.preventDefault()
          const newZoom = e.deltaY > 0 
            ? Math.max(1, zoom - 1)  // Min zoom: 1
            : Math.min(20, zoom + 1) // Max zoom: 20
          setZoom(newZoom)
        }

        return (
          <div
            data-testid="bounded-zoom-map"
            onWheel={handleWheel}
            className="w-full h-96"
          >
            <div data-testid="zoom-display">Zoom: {zoom}</div>
          </div>
        )
      }

      render(<BoundedZoomMap />)

      const map = screen.getByTestId('bounded-zoom-map')
      const zoomDisplay = screen.getByTestId('zoom-display')

      // Try to zoom below minimum
      fireEvent.wheel(map, { deltaY: 100 })
      expect(zoomDisplay).toHaveTextContent('Zoom: 1') // Should stay at minimum

      // Zoom to maximum
      for (let i = 0; i < 25; i++) {
        fireEvent.wheel(map, { deltaY: -100 })
      }
      expect(zoomDisplay).toHaveTextContent('Zoom: 20') // Should stop at maximum
    })
  })

  describe('Form Interaction Prevention', () => {
    it('should prevent accidental form submissions', async () => {
      const mockSubmit = jest.fn()
      const user = userEvent.setup()

      const ProtectedForm = () => {
        const [isValid, setIsValid] = React.useState(false)
        const [inputValue, setInputValue] = React.useState('')

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          if (isValid) {
            mockSubmit(inputValue)
          }
        }

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value
          setInputValue(value)
          setIsValid(value.length >= 3) // Minimum validation
        }

        return (
          <form onSubmit={handleSubmit} data-testid="protected-form">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter location (min 3 chars)"
              className="w-full px-3 py-2 border rounded-lg"
              data-testid="location-input"
            />
            <button
              type="submit"
              disabled={!isValid}
              className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-button"
            >
              Search
            </button>
          </form>
        )
      }

      render(<ProtectedForm />)

      const input = screen.getByTestId('location-input')
      const submitButton = screen.getByTestId('submit-button')

      // Initially button should be disabled
      expect(submitButton).toBeDisabled()

      // Try to submit with invalid input
      await user.click(submitButton)
      expect(mockSubmit).not.toHaveBeenCalled()

      // Enter valid input
      await user.type(input, 'New York')
      expect(submitButton).not.toBeDisabled()

      // Now submission should work
      await user.click(submitButton)
      expect(mockSubmit).toHaveBeenCalledWith('New York')
    })

    it('should handle double-tap prevention', async () => {
      const mockAction = jest.fn()
      const user = userEvent.setup()

      const DoubleClickProtectedButton = () => {
        const [isProcessing, setIsProcessing] = React.useState(false)

        const handleClick = async () => {
          if (isProcessing) return // Prevent double clicks

          setIsProcessing(true)
          mockAction()
          
          // Simulate async operation
          setTimeout(() => {
            setIsProcessing(false)
          }, 1000)
        }

        return (
          <button
            onClick={handleClick}
            disabled={isProcessing}
            data-testid="protected-button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
        )
      }

      render(<DoubleClickProtectedButton />)

      const button = screen.getByTestId('protected-button')

      // First click should work
      await user.click(button)
      expect(mockAction).toHaveBeenCalledTimes(1)
      expect(button).toBeDisabled()

      // Second click should be prevented
      await user.click(button)
      expect(mockAction).toHaveBeenCalledTimes(1) // Still only called once
    })
  })

  describe('One-Handed Usage Optimization', () => {
    it('should position primary actions within thumb reach', () => {
      render(
        <div className="min-h-screen flex flex-col max-w-sm mx-auto">
          {/* Header */}
          <header className="p-4 bg-white border-b">
            <h1 className="text-xl font-bold">FeedFind</h1>
          </header>

          {/* Content area */}
          <main className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3>Food Bank A</h3>
                <p>123 Main St</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3>Food Bank B</h3>
                <p>456 Oak Ave</p>
              </div>
            </div>
          </main>

          {/* Thumb-reachable action area */}
          <div className="sticky bottom-0 p-4 bg-white border-t safe-area-padding-bottom">
            <div className="flex gap-2">
              <button 
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium"
                data-testid="primary-action"
              >
                Find Nearby
              </button>
              <button 
                className="py-3 px-4 border border-gray-300 rounded-lg"
                data-testid="secondary-action"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )

      const primaryAction = screen.getByTestId('primary-action')
      const secondaryAction = screen.getByTestId('secondary-action')
      const actionContainer = primaryAction.parentElement?.parentElement

      expect(primaryAction).toBeInTheDocument()
      expect(secondaryAction).toBeInTheDocument()
             expect(actionContainer).toHaveClass('sticky')
       expect(actionContainer).toHaveClass('bottom-0')
    })

    it('should optimize button sizes for thumb interaction', () => {
      render(
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="min-h-[48px] px-4 py-3 bg-blue-600 text-white rounded-lg font-medium"
              data-testid="thumb-optimized-button-1"
            >
              Open
            </button>
            <button 
              className="min-h-[48px] px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
              data-testid="thumb-optimized-button-2"
            >
              Limited
            </button>
          </div>
          <button 
            className="w-full min-h-[48px] px-4 py-3 mt-4 bg-gray-600 text-white rounded-lg font-medium"
            data-testid="full-width-button"
          >
            View All Locations
          </button>
        </div>
      )

      const button1 = screen.getByTestId('thumb-optimized-button-1')
      const button2 = screen.getByTestId('thumb-optimized-button-2')
      const fullWidthButton = screen.getByTestId('full-width-button')

      // Check minimum height for thumb interaction
      expect(button1).toHaveClass('min-h-[48px]')
      expect(button2).toHaveClass('min-h-[48px]')
      expect(fullWidthButton).toHaveClass('min-h-[48px]')
      expect(fullWidthButton).toHaveClass('w-full')
    })
  })

  describe('Accessibility Touch Support', () => {
    it('should support assistive touch technologies', () => {
      render(
        <div>
          <button
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg"
            data-testid="accessible-button"
            aria-label="Search for food assistance locations"
            role="button"
          >
            Search
          </button>
          <div
            className="min-h-[44px] px-4 py-2 bg-gray-100 rounded-lg cursor-pointer"
            data-testid="accessible-div"
            role="button"
            tabIndex={0}
            aria-label="Filter search results"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                // Handle activation
              }
            }}
          >
            Filter
          </div>
        </div>
      )

      const button = screen.getByTestId('accessible-button')
      const div = screen.getByTestId('accessible-div')

      // Check accessibility attributes
      expect(button).toHaveAttribute('aria-label', 'Search for food assistance locations')
      expect(div).toHaveAttribute('role', 'button')
      expect(div).toHaveAttribute('tabIndex', '0')
      expect(div).toHaveAttribute('aria-label', 'Filter search results')
    })

    it('should provide adequate touch target spacing', () => {
      render(
        <div className="p-4 space-y-4">
          <button 
            className="min-h-[44px] w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
            data-testid="spaced-button-1"
          >
            Option 1
          </button>
          <button 
            className="min-h-[44px] w-full px-4 py-2 bg-green-600 text-white rounded-lg"
            data-testid="spaced-button-2"
          >
            Option 2
          </button>
          <button 
            className="min-h-[44px] w-full px-4 py-2 bg-red-600 text-white rounded-lg"
            data-testid="spaced-button-3"
          >
            Option 3
          </button>
        </div>
      )

      const container = screen.getByTestId('spaced-button-1').parentElement
      expect(container).toHaveClass('space-y-4') // Adequate spacing between buttons
    })
  })
}) 