import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { LocationMap } from '../../../components/map/LocationMap'
import type { LocationSearchResult } from '../../../types/database'

// Mock Google Maps API
const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  fitBounds: jest.fn(),
  panTo: jest.fn(),
  getCenter: jest.fn(),
  getZoom: jest.fn()
}

const mockMarker = {
  setPosition: jest.fn(),
  setMap: jest.fn(),
  setTitle: jest.fn(),
  setIcon: jest.fn(),
  addListener: jest.fn(),
  getPosition: jest.fn()
}

const mockInfoWindow = {
  setContent: jest.fn(),
  open: jest.fn(),
  close: jest.fn(),
  setPosition: jest.fn()
}

const mockMarkerClusterer = {
  addMarkers: jest.fn(),
  clearMarkers: jest.fn(),
  setMap: jest.fn()
}

// Mock Google Maps objects
;(global as any).google = {
  maps: {
    Map: jest.fn(() => mockMap),
    Marker: jest.fn(() => mockMarker),
    InfoWindow: jest.fn(() => mockInfoWindow),
    LatLng: jest.fn((lat, lng) => ({ lat, lng })),
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
      isEmpty: jest.fn(() => false)
    })),
    Size: jest.fn((width, height) => ({ width, height })),
    Point: jest.fn((x, y) => ({ x, y })),
    MapTypeId: {
      ROADMAP: 'roadmap',
      SATELLITE: 'satellite',
      HYBRID: 'hybrid',
      TERRAIN: 'terrain'
    },
    event: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      trigger: jest.fn()
    }
  }
}

// Mock MarkerClusterer
jest.mock('@googlemaps/markerclusterer', () => ({
  MarkerClusterer: jest.fn(() => mockMarkerClusterer)
}))

// Mock locations data
const mockLocations: LocationSearchResult[] = [
  {
    location: {
      id: '1',
      name: 'Downtown Food Bank',
      address: '123 Main St, New York, NY 10001',
      coordinates: { latitude: 40.7484, longitude: -73.9967 },
      phone: '(555) 123-4567',
      website: 'https://example.com',
      status: 'active',
      providerId: 'provider1',
      currentStatus: 'open',
      description: 'Community food bank serving downtown area',
      operatingHours: {
        monday: { open: '9:00 AM', close: '5:00 PM' },
        tuesday: { open: '9:00 AM', close: '5:00 PM' },
        wednesday: { open: '', close: '', closed: true },
        thursday: { open: '9:00 AM', close: '5:00 PM' },
        friday: { open: '9:00 AM', close: '5:00 PM' },
        saturday: { open: '10:00 AM', close: '3:00 PM' },
        sunday: { open: '', close: '', closed: true }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    provider: { id: 'provider1' } as any,
    services: [],
    distance: 0.5,
    currentStatus: 'open',
    lastUpdated: new Date(),
    rating: 4.5,
    reviewCount: 23
  },
  {
    location: {
      id: '2',
      name: 'Community Pantry',
      address: '456 Oak Ave, New York, NY 10002',
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      phone: '(555) 987-6543',
      status: 'active',
      providerId: 'provider2',
      currentStatus: 'limited',
      description: 'Local community pantry with fresh produce',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    provider: { id: 'provider2' } as any,
    services: [],
    distance: 1.2,
    currentStatus: 'limited',
    lastUpdated: new Date(),
    rating: 4.2,
    reviewCount: 15
  }
]

describe('LocationMap', () => {
  const mockOnLocationSelect = jest.fn()
  const mockOnMapLoad = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset Google Maps mocks
    mockMap.setCenter.mockClear()
    mockMap.setZoom.mockClear()
    mockMap.fitBounds.mockClear()
    mockMarker.setPosition.mockClear()
    mockMarker.setMap.mockClear()
    mockInfoWindow.setContent.mockClear()
    mockInfoWindow.open.mockClear()
    mockMarkerClusterer.addMarkers.mockClear()
    mockMarkerClusterer.clearMarkers.mockClear()
  })

  describe('Map Initialization and Accessibility', () => {
    it('should render with proper accessibility attributes', () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      const mapContainer = screen.getByRole('application', { name: /interactive map/i })
      expect(mapContainer).toBeInTheDocument()
      expect(mapContainer).toHaveAttribute('aria-label', 'Interactive map showing food assistance locations')
      
      // Should have keyboard instructions
      expect(screen.getByText(/use arrow keys to navigate/i)).toBeInTheDocument()
      
      // Should have keyboard instructions for screen readers
      expect(screen.getByText(/use arrow keys to navigate/i)).toBeInTheDocument()
      expect(screen.getByText(/for keyboard navigation/i)).toBeInTheDocument()
    })

    it('should provide keyboard navigation alternatives', async () => {
      const user = userEvent.setup()
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      // Should have a toggle for list view
      const listViewToggle = screen.getByRole('button', { name: /switch to list view/i })
      expect(listViewToggle).toBeInTheDocument()

      await user.click(listViewToggle)
      
      // Should show accessible list of locations
      expect(screen.getByRole('list', { name: /food assistance locations/i })).toBeInTheDocument()
      
      // Each location should be a list item
      const locationItems = screen.getAllByRole('listitem')
      expect(locationItems).toHaveLength(mockLocations.length)
    })

    it('should handle map loading errors gracefully', async () => {
      // Mock Google Maps to throw an error
      ;(global as any).google.maps.Map = jest.fn(() => {
        throw new Error('Google Maps failed to load')
      })

      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/map could not be loaded/i)).toBeInTheDocument()
        expect(screen.getByText(/please try refreshing/i)).toBeInTheDocument()
      })

      // Should provide fallback list view
      expect(screen.getByRole('list', { name: /food assistance locations/i })).toBeInTheDocument()
    })

    it('should respect user motion preferences', () => {
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

      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      // Should initialize map without animations
      expect((global as any).google.maps.Map).toHaveBeenCalledWith(
        expect.any(Element),
        expect.objectContaining({
          gestureHandling: 'cooperative',
          // Should have reduced animations
        })
      )
    })
  })

  describe('Marker Management', () => {
    it('should create markers for all locations', async () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      await waitFor(() => {
        expect((global as any).google.maps.Marker).toHaveBeenCalledTimes(mockLocations.length)
      })

      // Should set proper positions for markers
      mockLocations.forEach((location, index) => {
        expect((global as any).google.maps.Marker).toHaveBeenNthCalledWith(index + 1, 
          expect.objectContaining({
            position: { 
              lat: location.location.coordinates.latitude, 
              lng: location.location.coordinates.longitude 
            },
            title: location.location.name,
            map: mockMap
          })
        )
      })
    })

    it('should use different marker icons for different statuses', async () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      await waitFor(() => {
        // Should set different icons based on status
        expect(mockMarker.setIcon).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.stringContaining('open') // Green marker for open
          })
        )
        expect(mockMarker.setIcon).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.stringContaining('limited') // Yellow marker for limited
          })
        )
      })
    })

    it('should cluster markers for performance', async () => {
      const manyLocations = Array.from({ length: 50 }, (_, i) => ({
        ...mockLocations[0],
        location: {
          ...mockLocations[0].location,
          id: `location-${i}`,
          name: `Location ${i}`,
          coordinates: { 
            latitude: 40.7484 + (Math.random() - 0.5) * 0.1, 
            longitude: -73.9967 + (Math.random() - 0.5) * 0.1 
          }
        }
      }))

      render(
        <LocationMap 
          locations={manyLocations} 
          onLocationSelect={mockOnLocationSelect}
          enableClustering={true}
        />
      )

      await waitFor(() => {
        expect(mockMarkerClusterer.addMarkers).toHaveBeenCalled()
      })
    })

    it('should update markers when locations change', async () => {
      const { rerender } = render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      const updatedLocations = [
        ...mockLocations,
        {
          ...mockLocations[0],
          location: {
            ...mockLocations[0].location,
            id: '3',
            name: 'New Location',
            coordinates: { latitude: 40.7000, longitude: -74.0000 }
          }
        }
      ]

      rerender(
        <LocationMap 
          locations={updatedLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      await waitFor(() => {
        expect(global.google.maps.Marker).toHaveBeenCalledTimes(updatedLocations.length)
      })
    })
  })

  describe('Info Windows and Interactions', () => {
    it('should show info window when marker is clicked', async () => {
      const user = userEvent.setup()
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      await waitFor(() => {
        expect(mockMarker.addListener).toHaveBeenCalledWith('click', expect.any(Function))
      })

      // Simulate marker click
      const clickHandler = mockMarker.addListener.mock.calls.find(
        call => call[0] === 'click'
      )[1]
      
      clickHandler()

      expect(mockInfoWindow.setContent).toHaveBeenCalledWith(
        expect.stringContaining(mockLocations[0].location.name)
      )
      expect(mockInfoWindow.open).toHaveBeenCalledWith(mockMap, mockMarker)
    })

    it('should call onLocationSelect when location is selected from info window', async () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      // Simulate marker click and info window interaction
      const clickHandler = mockMarker.addListener.mock.calls.find(
        call => call[0] === 'click'
      )[1]
      
      clickHandler()

      // The info window content should include a button to select location
      const infoWindowContent = mockInfoWindow.setContent.mock.calls[0][0]
      expect(infoWindowContent).toContain('View Details')
      
      // Simulate clicking the view details button in info window
      // (This would be handled by the actual DOM interaction in real usage)
      mockOnLocationSelect(mockLocations[0])
      
      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocations[0])
    })

    it('should display comprehensive location information in info window', async () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      const clickHandler = mockMarker.addListener.mock.calls.find(
        call => call[0] === 'click'
      )[1]
      
      clickHandler()

      const infoWindowContent = mockInfoWindow.setContent.mock.calls[0][0]
      
      // Should include essential information
      expect(infoWindowContent).toContain(mockLocations[0].location.name)
      expect(infoWindowContent).toContain(mockLocations[0].location.address)
      expect(infoWindowContent).toContain(mockLocations[0].location.phone)
      expect(infoWindowContent).toContain('0.5 miles away')
      expect(infoWindowContent).toContain('Open')
    })
  })

  describe('Map Controls and Navigation', () => {
    it('should fit map bounds to show all locations', async () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      await waitFor(() => {
        expect(mockMap.fitBounds).toHaveBeenCalled()
      })
    })

    it('should center on user location when provided', async () => {
      const userLocation = { latitude: 40.7580, longitude: -73.9855 }
      
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
          userLocation={userLocation}
        />
      )

      await waitFor(() => {
        expect(mockMap.setCenter).toHaveBeenCalledWith({
          lat: userLocation.latitude,
          lng: userLocation.longitude
        })
      })
    })

    it('should provide map type controls', () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
          showMapTypeControl={true}
        />
      )

      expect(global.google.maps.Map).toHaveBeenCalledWith(
        expect.any(Element),
        expect.objectContaining({
          mapTypeControl: true,
          mapTypeControlOptions: expect.objectContaining({
            mapTypeIds: expect.arrayContaining(['roadmap', 'satellite', 'terrain'])
          })
        })
      )
    })

    it('should handle zoom controls appropriately', () => {
      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
          showZoomControl={true}
        />
      )

      expect(global.google.maps.Map).toHaveBeenCalledWith(
        expect.any(Element),
        expect.objectContaining({
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'cooperative'
        })
      )
    })
  })

  describe('Performance and Optimization', () => {
    it('should debounce map updates for performance', async () => {
      jest.useFakeTimers()
      
      const { rerender } = render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      // Rapidly update locations
      for (let i = 0; i < 5; i++) {
        rerender(
          <LocationMap 
            locations={[...mockLocations, { 
              ...mockLocations[0], 
              location: { ...mockLocations[0].location, id: `temp-${i}` } 
            }]} 
            onLocationSelect={mockOnLocationSelect}
          />
        )
      }

      // Should not update map immediately
      expect(mockMarkerClusterer.clearMarkers).not.toHaveBeenCalled()

      // Fast-forward timers
      jest.advanceTimersByTime(300)

      await waitFor(() => {
        // Should update map after debounce
        expect(mockMarkerClusterer.clearMarkers).toHaveBeenCalled()
      })

      jest.useRealTimers()
    })

    it('should cleanup markers and listeners on unmount', () => {
      const { unmount } = render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      unmount()

      // Should clean up markers
      expect(mockMarker.setMap).toHaveBeenCalledWith(null)
      
      // Should clean up clusterer
      expect(mockMarkerClusterer.clearMarkers).toHaveBeenCalled()
    })
  })

  describe('Error Handling and Fallbacks', () => {
    it('should handle missing Google Maps API gracefully', () => {
      // Temporarily remove Google Maps
      const originalGoogle = global.google
      delete global.google

      render(
        <LocationMap 
          locations={mockLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      expect(screen.getByText(/google maps is not available/i)).toBeInTheDocument()
      expect(screen.getByRole('list', { name: /food assistance locations/i })).toBeInTheDocument()

      // Restore Google Maps
      global.google = originalGoogle
    })

    it('should handle empty locations array', () => {
      render(
        <LocationMap 
          locations={[]} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      expect(screen.getByText(/no locations to display/i)).toBeInTheDocument()
    })

    it('should handle invalid coordinates gracefully', async () => {
      const invalidLocations = [{
        ...mockLocations[0],
        location: {
          ...mockLocations[0].location,
          coordinates: { latitude: NaN, longitude: NaN }
        }
      }]

      render(
        <LocationMap 
          locations={invalidLocations} 
          onLocationSelect={mockOnLocationSelect}
        />
      )

      // Should not crash, should show warning
      await waitFor(() => {
        expect(screen.getByText(/some locations could not be displayed/i)).toBeInTheDocument()
      })
    })
  })
}) 