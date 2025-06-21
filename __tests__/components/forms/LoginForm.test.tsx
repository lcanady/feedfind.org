import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import LoginForm from '../../../components/forms/LoginForm'

expect.extend(toHaveNoViolations)

// Mock the useAuth hook
const mockLogin = jest.fn()
const mockLoginWithGoogle = jest.fn()

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithGoogle: mockLoginWithGoogle,
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

describe('LoginForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogin.mockClear()
    mockLoginWithGoogle.mockClear()
  })

  it('should render with proper accessibility attributes', () => {
    render(<LoginForm />)

    // Check for form
    const form = screen.getByLabelText(/sign in form/i)
    expect(form).toBeInTheDocument()

    // Check for proper input labels
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()

    // Check for submit button (not the Google sign-in button)
    const submitButton = screen.getByRole('button', { name: /^sign in$/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should validate email format before submission', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /^sign in$/i })

    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should require password field', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /^sign in$/i })

    // Enter email but no password
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Should show validation error for password
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /^sign in$/i })

    // Fill out form
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Should call login function
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should include forgot password link', () => {
    render(<LoginForm />)

    const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i })
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('should include register link', () => {
    render(<LoginForm />)

    const registerLink = screen.getByRole('link', { name: /create an account/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('should toggle password visibility', async () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const toggleButton = screen.getByRole('button', { name: /show password/i })

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()

    // Click toggle to hide password again
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should clear validation errors when user starts typing', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /^sign in$/i })

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

  it('should be accessible (no axe violations)', async () => {
    const { container } = render(<LoginForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support Enter key submission', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)

    // Fill out form and press Enter
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.keyboard('{Enter}')

    // Should call login function
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
}) 