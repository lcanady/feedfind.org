import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { SearchForm } from '../../../components/search/SearchForm'

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
})

// Mock the search hooks
const mockSearchLocations = jest.fn()
const mockClearResults = jest.fn()
const mockClearError = jest.fn()
const mockGetCurrentPosition = jest.fn()
const mockClearGpsError = jest.fn()

jest.mock('../../../hooks/useLocationSearch', () => ({
  useLocationSearch: () => ({
    searchLocations: mockSearchLocations,
    loading: false,
    error: null,
    results: [],
    clearResults: mockClearResults,
    clearError: mockClearError,
    hasMore: false,
    loadMore: jest.fn()
  }),
  useGeolocation: () => ({
    getCurrentPosition: mockGetCurrentPosition,
    loading: false,
    error: null,
    clearError: mockClearGpsError
  })
}))

describe('SearchForm', () => {
  const mockOnResults = jest.fn()
  const mockOnError = jest.fn()
  const mockOnLoading = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGeolocation.getCurrentPosition.mockClear()
    mockSearchLocations.mockClear()
    mockClearResults.mockClear()
    mockClearError.mockClear()
    mockGetCurrentPosition.mockClear()
    mockClearGpsError.mockClear()
    mockOnResults.mockClear()
    mockOnError.mockClear()
    mockOnLoading.mockClear()
  })

  describe('Form Rendering and Accessibility', () => {
    it('should render with proper accessibility attributes', () => {
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const form = screen.getByRole('search', { name: /search for food assistance locations/i })
      expect(form).toBeInTheDocument()

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')

      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toBeInTheDocument()
      expect(searchButton).toHaveAttribute('type', 'submit')

      const gpsButton = screen.getByRole('button', { name: /use my current location/i })
      expect(gpsButton).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })
      const gpsButton = screen.getByRole('button', { name: /use my current location/i })

      // Add some input to enable the search button
      await user.type(searchInput, '12345')

      // After typing, input still has focus. Tab navigation order: clear button → search button → GPS button → filters toggle
      await user.tab()
      // First tab goes to clear button (skip)
      
      await user.tab()
      expect(searchButton).toHaveFocus()

      await user.tab()
      expect(gpsButton).toHaveFocus()
    })

    it('should have proper heading hierarchy', () => {
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)
      
      // Should not have conflicting headings, form should be properly labeled
      const form = screen.getByRole('search')
      expect(form).toHaveAccessibleName()
    })
  })

  describe('ZIP Code Validation', () => {
    it('should validate ZIP code format before submission', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      // Test invalid ZIP code
      await user.type(searchInput, '123')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Please enter a valid 5-digit ZIP code')
      })

      expect(mockSearchLocations).not.toHaveBeenCalled()
    })

    it('should accept valid ZIP codes', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, '12345')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith(
          { type: 'zipcode', value: '12345' },
          expect.any(Object)
        )
      })
    })

    it('should handle ZIP+4 format', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, '12345-6789')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith(
          { type: 'zipcode', value: '12345-6789' },
          expect.any(Object)
        )
      })
    })

    it('should clear validation errors when user types valid input', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      // Enter invalid ZIP
      await user.type(searchInput, '123')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })

      // Clear and enter valid ZIP - should clear error
      await user.clear(searchInput)
      await user.type(searchInput, '12345')

      // The error should be cleared when typing (via clearError)
      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('GPS Location Functionality', () => {
    it('should request location permission appropriately', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const gpsButton = screen.getByRole('button', { name: /use my current location/i })

      mockGetCurrentPosition.mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      })

      await user.click(gpsButton)

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled()
        expect(mockSearchLocations).toHaveBeenCalledWith(
          { 
            type: 'coordinates', 
            value: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 }
          },
          expect.any(Object)
        )
      })
    })

    it('should handle location permission denial gracefully', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const gpsButton = screen.getByRole('button', { name: /use my current location/i })

      mockGetCurrentPosition.mockRejectedValue(new Error('Permission denied'))

      await user.click(gpsButton)

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled()
      })

      // Should not crash and should handle error gracefully
      expect(mockSearchLocations).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should handle form submission via Enter key', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      
      await user.type(searchInput, '12345')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith(
          { type: 'zipcode', value: '12345' },
          expect.any(Object)
        )
      })
    })

    it('should prevent submission with empty input', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should not call search with empty input
      expect(mockSearchLocations).not.toHaveBeenCalled()
    })

    it('should clear previous results when starting new search', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)

      await user.type(searchInput, '12345')
      
      // Clear input should clear results
      await user.clear(searchInput)

      expect(mockClearResults).toHaveBeenCalled()
    })
  })

  describe('Advanced Search Features', () => {
    it('should support address search in addition to ZIP codes', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, '123 Main St, New York, NY')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith(
          { type: 'address', value: '123 Main St, New York, NY' },
          expect.any(Object)
        )
      })
    })

    it('should handle partial addresses gracefully', async () => {
      const user = userEvent.setup()
      render(<SearchForm onResults={mockOnResults} onError={mockOnError} onLoading={mockOnLoading} />)

      const searchInput = screen.getByPlaceholderText(/enter zip code or address/i)
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'Main St')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith(
          { type: 'address', value: 'Main St' },
          expect.any(Object)
        )
      })
    })
  })
}) 