/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import ProviderRegisterPage from '../../app/(auth)/provider-register/page'
import Home from '../../app/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    register: jest.fn(),
    loginWithGoogle: jest.fn(),
  })),
}))

// Mock ProviderRegistrationForm
jest.mock('../../components/provider/ProviderRegistrationForm', () => ({
  ProviderRegistrationForm: ({ onProviderCreated, onCancel }: any) => (
    <div data-testid="provider-registration-form">
      <h2>Provider Registration Form</h2>
      <button 
        onClick={() => onProviderCreated({ id: 'test-provider', name: 'Test Provider' })}
        data-testid="complete-registration"
      >
        Complete Registration
      </button>
      <button onClick={onCancel} data-testid="cancel-registration">
        Cancel
      </button>
    </div>
  ),
}))

describe('Provider Registration Flow', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      prefetch: jest.fn(),
    })
  })

  describe('Home Page - Add Your Organization Link', () => {
    it('should display "add your organization" link in footer', () => {
      render(<Home />)
      
      const addOrgLink = screen.getByRole('link', { name: /add your organization/i })
      expect(addOrgLink).toBeInTheDocument()
      expect(addOrgLink).toHaveAttribute('href', '/provider-register')
    })

    it('should have proper accessibility for the link', () => {
      render(<Home />)
      
      const addOrgLink = screen.getByRole('link', { name: /add your organization/i })
      expect(addOrgLink).toBeVisible()
             expect(addOrgLink).toHaveClass('text-blue-600')
       expect(addOrgLink).toHaveClass('hover:underline')
    })
  })

  describe('Provider Registration Page', () => {
    it('should render initial signup step by default', () => {
      render(<ProviderRegisterPage />)
      
      expect(screen.getByText(/Register Your Organization/i)).toBeInTheDocument()
      expect(screen.getByText(/Join FeedFind.org to help connect your community/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    })

    it('should show progress indicator correctly', () => {
      render(<ProviderRegisterPage />)
      
      // Step 1 should be active
      const step1 = screen.getByText('1')
      expect(step1).toBeInTheDocument()
      expect(step1.closest('div')).toHaveClass('bg-blue-600')
      
      // Step 2 should be inactive
      const step2 = screen.getByText('2')
      expect(step2).toBeInTheDocument()
      expect(step2.closest('div')).toHaveClass('bg-gray-300')
    })

    it('should validate signup form fields', async () => {
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      
      // Try to submit empty form
      await user.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
      })
    })

    it('should handle password confirmation validation', async () => {
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      // Fill in passwords that don't match
      await user.type(screen.getByLabelText(/^Password$/i), 'password123')
      await user.type(screen.getByLabelText(/Confirm Password/i), 'different')
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('should show password visibility toggle', async () => {
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const toggleButton = screen.getByRole('button', { name: '' })
      
      // Initially should be password type
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Click toggle
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      // Click again to hide
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should handle Google signup option', async () => {
      const mockLoginWithGoogle = jest.fn()
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        register: jest.fn(),
        loginWithGoogle: mockLoginWithGoogle,
      })
      
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
      await user.click(googleButton)
      
      expect(mockLoginWithGoogle).toHaveBeenCalled()
    })
  })

  describe('Provider Information Step', () => {
    it('should show provider form when user is authenticated', () => {
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: { uid: 'test-user', email: 'test@example.com' },
        isAuthenticated: true,
        loading: false,
        register: jest.fn(),
        loginWithGoogle: jest.fn(),
      })
      
      render(<ProviderRegisterPage />)
      
      expect(screen.getByText(/Organization Information/i)).toBeInTheDocument()
      expect(screen.getByTestId('provider-registration-form')).toBeInTheDocument()
    })

    it('should complete registration flow', async () => {
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: { uid: 'test-user', email: 'test@example.com' },
        isAuthenticated: true,
        loading: false,
        register: jest.fn(),
        loginWithGoogle: jest.fn(),
      })
      
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      const completeButton = screen.getByTestId('complete-registration')
      await user.click(completeButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/provider')
      })
    })

    it('should handle cancellation', async () => {
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: { uid: 'test-user', email: 'test@example.com' },
        isAuthenticated: true,
        loading: false,
        register: jest.fn(),
        loginWithGoogle: jest.fn(),
      })
      
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      const cancelButton = screen.getByTestId('cancel-registration')
      await user.click(cancelButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Navigation and Links', () => {
    it('should have back to home link', () => {
      render(<ProviderRegisterPage />)
      
      const backLink = screen.getByRole('link', { name: /← Back to Home/i })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('should have sign in link for existing users', () => {
      render(<ProviderRegisterPage />)
      
      const signInLink = screen.getByRole('link', { name: /Sign In/i })
      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner when auth is loading', () => {
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: true,
        register: jest.fn(),
        loginWithGoogle: jest.fn(),
      })
      
      render(<ProviderRegisterPage />)
      
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    })

    it('should disable form buttons during loading', async () => {
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: true,
        register: jest.fn(),
        loginWithGoogle: jest.fn(),
      })
      
      render(<ProviderRegisterPage />)
      
      await waitFor(() => {
        const createAccountButton = screen.queryByRole('button', { name: /Create Account/i })
        const googleButton = screen.queryByRole('button', { name: /Continue with Google/i })
        
        if (createAccountButton) {
          expect(createAccountButton).toBeDisabled()
        }
        if (googleButton) {
          expect(googleButton).toBeDisabled()
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should display authentication errors', () => {
      const { useAuth } = require('../../hooks/useAuth')
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Email already in use',
        register: jest.fn(),
        loginWithGoogle: jest.fn(),
      })
      
      render(<ProviderRegisterPage />)
      
      expect(screen.getByText(/Email already in use/i)).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      render(<ProviderRegisterPage />)
      
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<ProviderRegisterPage />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent(/Register Your Organization/i)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ProviderRegisterPage />)
      
      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/First Name/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Last Name/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Email Address/i)).toHaveFocus()
    })
  })
}) 