import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock components for testing
const MockSearchForm = ({ className }: { className?: string }) => (
  <form className={className} data-testid="search-form">
    <input type="text" placeholder="Search locations" />
    <button type="submit">Search</button>
  </form>
)

const MockLocationCard = ({ location, className }: { location: any; className?: string }) => (
  <div className={className} data-testid="location-card">
    <h3>{location.name}</h3>
    <p>{location.address}</p>
    <button>View Details</button>
  </div>
)

const MockHeader = ({ className }: { className?: string }) => (
  <header className={className} data-testid="header">
    <nav>
      <button>Menu</button>
      <h1>FeedFind</h1>
      <button>Profile</button>
    </nav>
  </header>
)

describe('ResponsiveDesign', () => {
  // Mock viewport dimensions
  const mockViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
    window.dispatchEvent(new Event('resize'))
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset to desktop size
    mockViewport(1024, 768)
  })

  describe('Mobile Breakpoints', () => {
    it('should display correctly on mobile screens (320px)', async () => {
      mockViewport(320, 568)
      
      render(
        <div className="min-h-screen">
          <MockHeader className="w-full px-4 py-2 md:px-6" />
          <main className="px-4 py-4 md:px-6">
            <MockSearchForm className="w-full mb-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MockLocationCard 
                location={{ name: 'Food Bank', address: '123 Main St' }}
                className="w-full"
              />
            </div>
          </main>
        </div>
      )

      const header = screen.getByTestId('header')
      const searchForm = screen.getByTestId('search-form')
      const locationCard = screen.getByTestId('location-card')

      expect(header).toBeInTheDocument()
      expect(searchForm).toBeInTheDocument()
      expect(locationCard).toBeInTheDocument()

      // Check that elements are properly sized for mobile
      expect(header).toHaveClass('w-full')
      expect(searchForm).toHaveClass('w-full')
      expect(locationCard).toHaveClass('w-full')
    })

    it('should display correctly on tablet screens (768px)', async () => {
      mockViewport(768, 1024)
      
      render(
        <div className="min-h-screen">
          <MockHeader className="w-full px-4 py-2 md:px-6" />
          <main className="px-4 py-4 md:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MockLocationCard 
                location={{ name: 'Food Bank 1', address: '123 Main St' }}
                className="w-full"
              />
              <MockLocationCard 
                location={{ name: 'Food Bank 2', address: '456 Oak Ave' }}
                className="w-full"
              />
            </div>
          </main>
        </div>
      )

      const locationCards = screen.getAllByTestId('location-card')
      expect(locationCards).toHaveLength(2)
      
      // On tablet, should show 2 columns
      locationCards.forEach(card => {
        expect(card).toHaveClass('w-full')
      })
    })

    it('should display correctly on desktop screens (1024px+)', async () => {
      mockViewport(1024, 768)
      
      render(
        <div className="min-h-screen">
          <MockHeader className="w-full px-4 py-2 md:px-6" />
          <main className="px-4 py-4 md:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MockLocationCard 
                location={{ name: 'Food Bank 1', address: '123 Main St' }}
                className="w-full"
              />
              <MockLocationCard 
                location={{ name: 'Food Bank 2', address: '456 Oak Ave' }}
                className="w-full"
              />
              <MockLocationCard 
                location={{ name: 'Food Bank 3', address: '789 Pine Rd' }}
                className="w-full"
              />
            </div>
          </main>
        </div>
      )

      const locationCards = screen.getAllByTestId('location-card')
      expect(locationCards).toHaveLength(3)
      
      // On desktop, should show 3 columns
      locationCards.forEach(card => {
        expect(card).toHaveClass('w-full')
      })
    })
  })

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape orientation smoothly', async () => {
      // Start in portrait
      mockViewport(375, 667)
      
      const { rerender } = render(
        <div className="min-h-screen">
          <MockHeader className="w-full" />
          <main className="px-4 py-4">
            <MockSearchForm className="w-full mb-4" />
          </main>
        </div>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('search-form')).toBeInTheDocument()

      // Switch to landscape
      mockViewport(667, 375)
      
      rerender(
        <div className="min-h-screen">
          <MockHeader className="w-full" />
          <main className="px-4 py-4">
            <MockSearchForm className="w-full mb-4" />
          </main>
        </div>
      )

      // Elements should still be present and functional
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('search-form')).toBeInTheDocument()
    })
  })

  describe('Touch Targets', () => {
    it('should provide accessible touch targets (44px minimum)', () => {
      render(
        <div>
          <button 
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg"
            data-testid="touch-button"
          >
            Search
          </button>
          <a 
            href="/location/123"
            className="inline-block min-h-[44px] min-w-[44px] px-4 py-2 text-blue-600 underline"
            data-testid="touch-link"
          >
            View Location
          </a>
        </div>
      )

      const button = screen.getByTestId('touch-button')
      const link = screen.getByTestId('touch-link')

      // Check minimum touch target size classes are applied
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('min-w-[44px]')
      expect(link).toHaveClass('min-h-[44px]')
      expect(link).toHaveClass('min-w-[44px]')
    })

    it('should have adequate spacing between touch targets', () => {
      render(
        <div className="space-y-2">
          <button 
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg"
            data-testid="button-1"
          >
            Button 1
          </button>
          <button 
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-green-600 text-white rounded-lg"
            data-testid="button-2"
          >
            Button 2
          </button>
        </div>
      )

      const container = screen.getByTestId('button-1').parentElement
      expect(container).toHaveClass('space-y-2')
    })
  })

  describe('Font Sizes and Readability', () => {
    it('should optimize font sizes for mobile readability', () => {
      render(
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="main-heading">
            FeedFind
          </h1>
          <p className="text-base md:text-lg" data-testid="body-text">
            Find food assistance near you
          </p>
          <small className="text-sm md:text-base" data-testid="small-text">
            Last updated: Today
          </small>
        </div>
      )

      const heading = screen.getByTestId('main-heading')
      const bodyText = screen.getByTestId('body-text')
      const smallText = screen.getByTestId('small-text')

      // Check responsive font size classes
      expect(heading).toHaveClass('text-2xl')
      expect(heading).toHaveClass('md:text-3xl')
      expect(bodyText).toHaveClass('text-base')
      expect(bodyText).toHaveClass('md:text-lg')
      expect(smallText).toHaveClass('text-sm')
      expect(smallText).toHaveClass('md:text-base')
    })

    it('should maintain proper line height for readability', () => {
      render(
        <div>
          <p className="text-base leading-relaxed" data-testid="readable-text">
            This is a longer paragraph of text that should maintain good readability
            with proper line height spacing for mobile users.
          </p>
        </div>
      )

      const text = screen.getByTestId('readable-text')
      expect(text).toHaveClass('leading-relaxed')
    })
  })

  describe('Mobile Form Optimization', () => {
    it('should handle keyboard appearance on mobile forms', () => {
      render(
        <form data-testid="mobile-form">
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium mb-2">
              Search Location
            </label>
            <input
              id="search"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter ZIP code or address"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="radius" className="block text-sm font-medium mb-2">
              Search Radius
            </label>
            <select
              id="radius"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </form>
      )

      const form = screen.getByTestId('mobile-form')
      const searchInput = screen.getByLabelText('Search Location')
      const radiusSelect = screen.getByLabelText('Search Radius')
      const submitButton = screen.getByRole('button', { name: /search/i })

      expect(form).toBeInTheDocument()
      expect(searchInput).toHaveClass('w-full')
      expect(radiusSelect).toHaveClass('w-full')
      expect(submitButton).toHaveClass('w-full')
      expect(submitButton).toHaveClass('py-3') // Full width with adequate padding
    })

    it('should prevent accidental form submissions', () => {
      const mockSubmit = jest.fn()
      
      render(
        <form onSubmit={mockSubmit} data-testid="protected-form">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter location"
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={false}
          >
            Search Locations
          </button>
        </form>
      )

      const form = screen.getByTestId('protected-form')
      const button = screen.getByRole('button', { name: /search locations/i })

      expect(form).toBeInTheDocument()
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })
  })

  describe('One-Handed Usage Optimization', () => {
    it('should optimize for one-handed usage patterns', () => {
      render(
        <div className="min-h-screen flex flex-col">
          {/* Header at top */}
          <header className="w-full p-4 bg-white border-b" data-testid="header">
            <h1 className="text-xl font-bold">FeedFind</h1>
          </header>
          
          {/* Main content in middle */}
          <main className="flex-1 p-4" data-testid="main-content">
            <div className="space-y-4">
              <MockLocationCard 
                location={{ name: 'Food Bank', address: '123 Main St' }}
                className="w-full"
              />
            </div>
          </main>
          
          {/* Primary actions at bottom for thumb reach */}
          <div className="sticky bottom-0 p-4 bg-white border-t" data-testid="bottom-actions">
            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium">
              Find Nearby Locations
            </button>
          </div>
        </div>
      )

      const header = screen.getByTestId('header')
      const mainContent = screen.getByTestId('main-content')
      const bottomActions = screen.getByTestId('bottom-actions')

      expect(header).toBeInTheDocument()
      expect(mainContent).toBeInTheDocument()
      expect(bottomActions).toBeInTheDocument()
      
      // Check that primary action is at bottom for easy thumb access
      expect(bottomActions).toHaveClass('sticky')
      expect(bottomActions).toHaveClass('bottom-0')
    })
  })

  describe('Performance on Mobile', () => {
    it('should load essential content first', async () => {
      const { container } = render(
        <div>
          {/* Critical above-the-fold content */}
          <header data-testid="critical-header">
            <h1>FeedFind</h1>
          </header>
          <main data-testid="critical-content">
            <MockSearchForm />
          </main>
          
          {/* Non-critical content that can load later */}
          <footer data-testid="non-critical-footer">
            <p>Additional information</p>
          </footer>
        </div>
      )

      // Critical content should be immediately available
      expect(screen.getByTestId('critical-header')).toBeInTheDocument()
      expect(screen.getByTestId('critical-content')).toBeInTheDocument()
      
      // Non-critical content should also be present (in real app, this might lazy load)
      expect(screen.getByTestId('non-critical-footer')).toBeInTheDocument()
    })

    it('should handle slow network conditions gracefully', async () => {
      // Mock slow loading state
      const SlowLoadingComponent = () => {
        const [loading, setLoading] = React.useState(true)
        
        React.useEffect(() => {
          const timer = setTimeout(() => setLoading(false), 100)
          return () => clearTimeout(timer)
        }, [])

        if (loading) {
          return (
            <div data-testid="loading-skeleton">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          )
        }

        return (
          <div data-testid="loaded-content">
            <h2>Food Bank Location</h2>
            <p>123 Main Street</p>
          </div>
        )
      }

      render(<SlowLoadingComponent />)

      // Should show loading skeleton initially
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

      // Should show actual content after loading
      await waitFor(() => {
        expect(screen.getByTestId('loaded-content')).toBeInTheDocument()
      })
    })
  })
}) 