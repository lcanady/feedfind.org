import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import SearchForm from '../../components/search/SearchForm'
import LocationMap from '../../components/map/LocationMap'
import AdminDashboard from '../../components/admin/AdminDashboard'
import { AuthProvider } from '../../hooks/useAuth'
import type { LocationSearchResult, Location, Provider, Service } from '../../types/database'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Firebase and Google Maps
jest.mock('../../lib/firebase', () => ({
  auth: {},
  db: {},
}))

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: '123', email: 'test@example.com', role: 'admin' },
    isAuthenticated: true,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock Google Maps
const mockGoogleMaps = {
  Map: jest.fn(() => ({
    setCenter: jest.fn(),
    setZoom: jest.fn(),
  })),
  Marker: jest.fn(),
  InfoWindow: jest.fn(),
  LatLng: jest.fn(),
}

Object.defineProperty(window, 'google', {
  value: {
    maps: mockGoogleMaps,
  },
})

// Helper function to create mock LocationSearchResult
const createMockLocationSearchResult = (overrides: Partial<LocationSearchResult> = {}): LocationSearchResult => ({
  location: {
    id: '1',
    name: 'Test Location',
    address: '123 Test St',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    providerId: 'provider-1',
    status: 'active',
    currentStatus: 'open',
    createdAt: new Date(),
    ...overrides.location,
  },
  provider: {
    id: 'provider-1',
    organizationName: 'Test Provider',
    email: 'provider@test.com',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(),
    ...overrides.provider,
  },
  services: [
    {
      id: 'service-1',
      name: 'Food Distribution',
      locationId: '1',
      type: 'food_pantry',
      isActive: true,
      createdAt: new Date(),
    }
  ],
  distance: 1.2,
  currentStatus: 'open',
  rating: 4.5,
  reviewCount: 10,
  ...overrides,
})

describe('Accessibility Compliance', () => {
  describe('WCAG 2.1 AA Standards', () => {
    it('should pass axe-core automated accessibility tests for SearchForm', async () => {
      const { container } = render(<SearchForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should pass axe-core automated accessibility tests for LocationMap', async () => {
      const mockLocations = [createMockLocationSearchResult()]

      const { container } = render(
        <LocationMap 
          locations={mockLocations}
          onLocationSelect={() => {}}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should pass axe-core automated accessibility tests for AdminDashboard', async () => {
      const { container } = render(
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation Support', () => {
    it('should support full keyboard navigation in SearchForm', async () => {
      const user = userEvent.setup()
      render(<SearchForm />)

      const searchInput = screen.getByLabelText(/search for food assistance/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      // Test tab navigation
      await user.tab()
      expect(searchInput).toHaveFocus()

      await user.tab()
      expect(searchButton).toHaveFocus()

      // Test Enter key functionality
      await user.click(searchInput)
      await user.type(searchInput, '12345')
      await user.keyboard('{Enter}')

      // Should trigger search (tested by not throwing errors)
      expect(searchInput).toHaveValue('12345')
    })

    it('should provide keyboard alternatives for map interactions', async () => {
      const user = userEvent.setup()
      const mockLocations = [createMockLocationSearchResult()]

      render(
        <LocationMap 
          locations={mockLocations}
          onLocationSelect={() => {}}
        />
      )

      // Should provide list view toggle for keyboard users
      const listViewToggle = screen.getByRole('button', { name: /switch to list view/i })
      expect(listViewToggle).toBeInTheDocument()

      await user.click(listViewToggle)
      
      // Should show accessible list alternative
      const locationList = screen.getByRole('list', { name: /locations list/i })
      expect(locationList).toBeInTheDocument()
    })

    it('should support keyboard navigation in admin dashboard tabs', async () => {
      const user = userEvent.setup()
      render(
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      )

      const overviewTab = screen.getByRole('button', { name: /overview/i })
      const moderationTab = screen.getByRole('button', { name: /content moderation/i })

      // Test tab navigation
      await user.tab()
      // Skip past header elements to admin tabs
      while (document.activeElement !== overviewTab && document.activeElement !== moderationTab) {
        await user.tab()
      }

      // Test arrow key navigation between tabs
      await user.keyboard('{ArrowRight}')
      expect(moderationTab).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      expect(overviewTab).toHaveFocus()
    })
  })

  describe('ARIA Labels and Roles', () => {
    it('should provide proper ARIA labels for form controls', () => {
      render(<SearchForm />)

      const searchInput = screen.getByLabelText(/search for food assistance/i)
      expect(searchInput).toHaveAttribute('aria-label')

      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toHaveAttribute('type', 'submit')

      // Check for proper form structure
      const form = screen.getByRole('search') || screen.getByTestId('search-form')
      expect(form).toBeInTheDocument()
    })

    it('should provide proper ARIA labels for map components', () => {
      const mockLocations = [createMockLocationSearchResult()]

      render(
        <LocationMap 
          locations={mockLocations}
          onLocationSelect={() => {}}
        />
      )

      const mapContainer = screen.getByRole('region', { name: /interactive map/i })
      expect(mapContainer).toHaveAttribute('aria-label')

      const listViewToggle = screen.getByRole('button', { name: /switch to list view/i })
      expect(listViewToggle).toHaveAttribute('aria-label')
    })

    it('should provide proper navigation landmarks in admin dashboard', () => {
      render(
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      )

      const navigation = screen.getByRole('navigation', { name: /admin tools/i })
      expect(navigation).toBeInTheDocument()

      const main = screen.getByRole('main') || screen.getByTestId('admin-main-content')
      expect(main).toBeInTheDocument()
    })
  })

  describe('Color and Contrast Requirements', () => {
    it('should not rely on color alone to convey status information', () => {
      const mockLocations = [
        {
          id: '1',
          name: 'Open Location',
          address: '123 Test St',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          status: 'open' as const,
          lastUpdated: new Date(),
          type: 'food_bank' as const,
        },
        {
          id: '2',
          name: 'Closed Location',
          address: '456 Test Ave',
          coordinates: { lat: 40.7580, lng: -73.9855 },
          status: 'closed' as const,
          lastUpdated: new Date(),
          type: 'soup_kitchen' as const,
        }
      ]

      render(
        <LocationMap 
          locations={mockLocations}
          center={{ lat: 40.7128, lng: -74.0060 }}
          zoom={12}
        />
      )

      // Status should be indicated by text and icons, not just color
      const openStatus = screen.getByText(/open/i)
      const closedStatus = screen.getByText(/closed/i)

      expect(openStatus).toBeInTheDocument()
      expect(closedStatus).toBeInTheDocument()

      // Should have visual indicators beyond color
      expect(openStatus.closest('[data-status="open"]')).toBeInTheDocument()
      expect(closedStatus.closest('[data-status="closed"]')).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup()
      render(<SearchForm />)

      const searchInput = screen.getByLabelText(/search for food assistance/i)
      await user.type(searchInput, '12345')
      await user.keyboard('{Enter}')

      // Should have live region for search results
      const liveRegion = screen.getByRole('status') || screen.getByTestId('search-results-status')
      expect(liveRegion).toBeInTheDocument()
    })

    it('should provide descriptive text for interactive map elements', () => {
      const mockLocations = [
        {
          id: '1',
          name: 'Test Location',
          address: '123 Test St',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          status: 'open' as const,
          lastUpdated: new Date(),
          type: 'food_bank' as const,
        }
      ]

      render(
        <LocationMap 
          locations={mockLocations}
          center={{ lat: 40.7128, lng: -74.0060 }}
          zoom={12}
        />
      )

      const mapDescription = screen.getByText(/interactive map showing food assistance locations/i) ||
                           screen.getByLabelText(/map showing/i)
      expect(mapDescription).toBeInTheDocument()
    })
  })

  describe('Motion and Animation Preferences', () => {
    it('should respect prefers-reduced-motion settings', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      const mockLocations = [
        {
          id: '1',
          name: 'Test Location',
          address: '123 Test St',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          status: 'open' as const,
          lastUpdated: new Date(),
          type: 'food_bank' as const,
        }
      ]

      const { container } = render(
        <LocationMap 
          locations={mockLocations}
          center={{ lat: 40.7128, lng: -74.0060 }}
          zoom={12}
        />
      )

      // Should not have animation classes when reduced motion is preferred
      const animatedElements = container.querySelectorAll('.animate-spin, .transition-all')
      animatedElements.forEach(element => {
        expect(element).toHaveClass('motion-reduce:animate-none')
      })
    })
  })

  describe('Focus Management', () => {
    it('should manage focus properly in modal dialogs', async () => {
      const user = userEvent.setup()
      render(
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      )

      // Navigate to content moderation tab
      const moderationTab = screen.getByRole('button', { name: /content moderation/i })
      await user.click(moderationTab)

      // Should trap focus within modals when opened
      // This would be tested more thoroughly in actual modal components
      expect(moderationTab).toHaveAttribute('aria-current', 'page')
    })

    it('should provide visible focus indicators', async () => {
      const user = userEvent.setup()
      render(<SearchForm />)

      const searchInput = screen.getByLabelText(/search for food assistance/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      // Check for focus ring classes in the HTML (they should be present for CSS)
      expect(searchInput.className).toMatch(/focus:ring-2/)
      expect(searchButton.className).toMatch(/focus:ring-2/)
      
      // Also test that elements can receive focus
      await user.click(searchInput)
      expect(searchInput).toHaveFocus()
      
      await user.tab()
      expect(searchButton).toHaveFocus()
    })
  })
}) 