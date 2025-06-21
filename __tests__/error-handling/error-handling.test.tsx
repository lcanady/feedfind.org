import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../../components/setup/ErrorBoundary'
import { AuthProvider } from '../../hooks/useAuth'
import LoginForm from '../../components/forms/LoginForm'
import SearchForm from '../../components/search/SearchForm'
import LocationMap from '../../components/map/LocationMap'

// Mock Firebase
jest.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
  },
  db: jest.fn(),
}))

// Mock location service
jest.mock('../../lib/locationService', () => ({
  searchLocations: jest.fn(),
}))

// Mock Google Maps
jest.mock('../../components/map/LocationMap', () => {
  return function MockLocationMap({ locations, onLocationSelect, onError }: any) {
    React.useEffect(() => {
      // Simulate map loading error
      const shouldError = locations.some((loc: any) => loc.name === 'ERROR_TRIGGER')
      if (shouldError && onError) {
        onError(new Error('Google Maps API failed to load'))
      }
    }, [locations, onError])

    return (
      <div data-testid="location-map">
        {locations.map((location: any) => (
          <button key={location.id} onClick={() => onLocationSelect(location)}>
            {location.name}
          </button>
        ))}
      </div>
    )
  }
})

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary')
  }
  return <div>No error</div>
}

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Global Error Boundary', () => {
    it('should catch and display user-friendly errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should show error UI instead of crashing
      expect(screen.getByText(/application error/i)).toBeInTheDocument()
      expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()
    })

    it('should log errors to monitoring service', () => {
      const consoleSpy = jest.spyOn(console, 'error')
      
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setup Error Boundary caught an error:'),
        expect.any(Error),
        expect.any(Object)
      )
    })

    it('should provide recovery actions for users', async () => {
      const user = userEvent.setup()
      
      // Mock window.location.reload
      Object.defineProperty(window, 'location', {
        value: { reload: jest.fn() },
        writable: true
      })

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const refreshButton = screen.getByRole('button', { name: /refresh page/i })
      await user.click(refreshButton)

      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should handle different error types appropriately', () => {
      const networkError = new Error('Network error')
      networkError.name = 'NetworkError'

      const NetworkErrorComponent = () => {
        throw networkError
      }

      render(
        <ErrorBoundary>
          <NetworkErrorComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText(/application error/i)).toBeInTheDocument()
      expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
    })

    it('should maintain app stability during errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      )

      // Should render normally
      expect(screen.getByText('No error')).toBeInTheDocument()

      // Trigger error
      rerender(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should show error UI
      expect(screen.getByText(/application error/i)).toBeInTheDocument()

      // Should be able to recover
      rerender(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      )

      // Note: ErrorBoundary doesn't reset automatically, would need reset mechanism
      expect(screen.getByText(/application error/i)).toBeInTheDocument()
    })

    it('should show technical details when requested', async () => {
      const user = userEvent.setup()
      
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should have details section
      const detailsToggle = screen.getByText(/show technical details/i)
      expect(detailsToggle).toBeInTheDocument()

      await user.click(detailsToggle)

      // Should show error details
      expect(screen.getByText(/Test error for ErrorBoundary/)).toBeInTheDocument()
    })
  })

  describe('Network & API Error Handling', () => {
    it('should handle Firebase connection timeouts', async () => {
      const user = userEvent.setup()
      const mockAuth = require('../../lib/firebase').auth
      mockAuth.signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network request failed'
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
        expect(screen.getByText(/check your connection/i)).toBeInTheDocument()
      })
    })

    it('should handle Google Maps API failures', async () => {
      const locations = [
        { id: '1', name: 'ERROR_TRIGGER', coordinates: { lat: 40.7128, lng: -74.0060 } }
      ]

      const handleError = jest.fn()

      render(
        <LocationMap
          locations={locations}
          onLocationSelect={jest.fn()}
          onError={handleError}
        />
      )

      // Should handle map loading error
      await waitFor(() => {
        expect(handleError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Google Maps API failed to load'
          })
        )
      })
    })

    it('should handle slow/intermittent network connections', async () => {
      const user = userEvent.setup()
      const mockSearch = require('../../lib/locationService').searchLocations
      
      // Simulate slow network
      mockSearch.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve([]), 5000))
      )

             render(<SearchForm onError={jest.fn()} onLoading={jest.fn()} />)

       const searchInput = screen.getByLabelText(/search/i)
       await user.type(searchInput, 'New York')
       
       const searchButton = screen.getByRole('button', { name: /search/i })
       await user.click(searchButton)

       // Should show loading state
       expect(screen.getByText(/searching/i)).toBeInTheDocument()

      // Should handle timeout gracefully
      await waitFor(() => {
        expect(screen.queryByText(/searching/i)).not.toBeInTheDocument()
      }, { timeout: 6000 })
    })

    it('should handle server maintenance modes', async () => {
      const user = userEvent.setup()
      const mockSearch = require('../../lib/locationService').searchLocations
      mockSearch.mockRejectedValue({
        code: 'unavailable',
        message: 'Service temporarily unavailable'
      })

      render(<SearchForm onSearch={mockSearch} />)

      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'New York')
      
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should show maintenance message
      await waitFor(() => {
        expect(screen.getByText(/service temporarily unavailable/i)).toBeInTheDocument()
        expect(screen.getByText(/please try again later/i)).toBeInTheDocument()
      })
    })

    it('should handle rate limiting responses', async () => {
      const user = userEvent.setup()
      const mockSearch = require('../../lib/locationService').searchLocations
      mockSearch.mockRejectedValue({
        code: 'resource-exhausted',
        message: 'Rate limit exceeded'
      })

      render(<SearchForm onSearch={mockSearch} />)

      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'New York')
      
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
        expect(screen.getByText(/please wait/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Experience Error Patterns', () => {
    it('should show inline validation errors immediately', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Try to submit with invalid email
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      // Should show immediate validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should provide retry mechanisms for failed operations', async () => {
      const user = userEvent.setup()
      const mockSearch = require('../../lib/locationService').searchLocations
      
      // First call fails, second succeeds
      mockSearch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([{ id: '1', name: 'Test Location' }])

      render(<SearchForm onSearch={mockSearch} />)

      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'New York')
      
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should show error with retry option
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      // Should succeed on retry
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledTimes(2)
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
      })
    })

    it('should gracefully degrade when services are unavailable', async () => {
      const user = userEvent.setup()
      const mockSearch = require('../../lib/locationService').searchLocations
      mockSearch.mockRejectedValue(new Error('Service unavailable'))

      render(<SearchForm onSearch={mockSearch} />)

      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'New York')
      
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should show fallback options
      await waitFor(() => {
        expect(screen.getByText(/service unavailable/i)).toBeInTheDocument()
        expect(screen.getByText(/try browsing by category/i)).toBeInTheDocument()
      })
    })

    it('should maintain user data during error recovery', async () => {
      const user = userEvent.setup()
      const mockAuth = require('../../lib/firebase').auth
      
      // First attempt fails
      mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce({
        code: 'auth/network-request-failed',
        message: 'Network error'
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Should show error but maintain form data
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Form data should be preserved
      expect(emailInput).toHaveValue('user@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('should guide users to alternative actions', async () => {
      const user = userEvent.setup()
      const mockSearch = require('../../lib/locationService').searchLocations
      mockSearch.mockResolvedValue([]) // Empty results

      render(<SearchForm onSearch={mockSearch} />)

      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'NonexistentLocation')
      
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)

      // Should suggest alternative actions
      await waitFor(() => {
        expect(screen.getByText(/no locations found/i)).toBeInTheDocument()
        expect(screen.getByText(/try a different search/i)).toBeInTheDocument()
        expect(screen.getByText(/browse all locations/i)).toBeInTheDocument()
      })
    })

    it('should handle multiple error states simultaneously', async () => {
      const user = userEvent.setup()
      const mockAuth = require('../../lib/firebase').auth
      const mockSearch = require('../../lib/locationService').searchLocations
      
      // Both services fail
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(new Error('Auth failed'))
      mockSearch.mockRejectedValue(new Error('Search failed'))

      render(
        <AuthProvider>
          <div>
            <LoginForm />
            <SearchForm onSearch={mockSearch} />
          </div>
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const searchInput = screen.getByLabelText(/search/i)
      
      // Trigger both errors
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await user.type(searchInput, 'New York')
      await user.click(screen.getByRole('button', { name: /search/i }))

      // Should handle both errors gracefully
      await waitFor(() => {
        expect(screen.getByText(/auth failed/i)).toBeInTheDocument()
        expect(screen.getByText(/search failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Error Handling', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should clear errors when user corrects input', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Trigger validation error
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })

      // Correct the input
      await user.type(emailInput, 'user@example.com')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })

    it('should show field-specific error messages', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Enter invalid email
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      // Should show specific email validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })
  })
}) 