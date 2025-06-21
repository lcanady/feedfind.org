import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import PasswordResetForm from '../../../components/forms/PasswordResetForm'

expect.extend(toHaveNoViolations)

// Mock the useAuth hook
const mockResetPassword = jest.fn()

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
    loading: false,
    error: null,
    user: null,
    isAuthenticated: false,
  }),
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('PasswordResetForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with proper accessibility attributes', () => {
    render(<PasswordResetForm />)

    // Check for form
    const form = screen.getByLabelText(/reset password form/i)
    expect(form).toBeInTheDocument()

    // Check for email input with proper label
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()

    // Check for submit button
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')

    // Check for heading
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
  })

  it('should validate email format before submission', async () => {
    render(<PasswordResetForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('should require email field', async () => {
    render(<PasswordResetForm />)

    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Submit empty form
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('should submit form with valid email', async () => {
    render(<PasswordResetForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Fill out form with valid email
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Should call resetPassword function
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('should show success message after successful submission', async () => {
    // Mock successful reset
    mockResetPassword.mockResolvedValueOnce(undefined)

    render(<PasswordResetForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Fill out and submit form
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument()
    })

    // Form should be hidden after success
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument()
  })

  it('should include back to login link', () => {
    render(<PasswordResetForm />)

    const loginLink = screen.getByRole('link', { name: /back to sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should clear validation errors when user starts typing', async () => {
    render(<PasswordResetForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Trigger validation error
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })

    // Start typing again - error should clear
    await user.clear(emailInput)
    await user.type(emailInput, 'test@')
    
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
    })
  })

  it('should handle keyboard submission (Enter key)', async () => {
    render(<PasswordResetForm />)

    const emailInput = screen.getByLabelText(/email address/i)

    // Fill out form and press Enter
    await user.type(emailInput, 'test@example.com')
    await user.keyboard('{Enter}')

    // Should call resetPassword function
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('should be accessible (no axe violations)', async () => {
    const { container } = render(<PasswordResetForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper focus management', async () => {
    render(<PasswordResetForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Tab navigation should work correctly
    await user.tab()
    expect(emailInput).toHaveFocus()

    await user.tab()
    expect(submitButton).toHaveFocus()
  })

  it('should show helpful instructions', () => {
    render(<PasswordResetForm />)

    // Should include instruction text
    expect(screen.getByText(/enter your email address and we'll send you a link to reset your password/i)).toBeInTheDocument()
  })
}) 