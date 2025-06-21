import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import RegistrationForm from '../../../components/forms/RegistrationForm'

expect.extend(toHaveNoViolations)

// Mock the useAuth hook
const mockRegister = jest.fn()

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
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

describe('RegistrationForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with proper accessibility attributes', () => {
    render(<RegistrationForm />)

    // Check for form
    const form = screen.getByLabelText(/create account form/i)
    expect(form).toBeInTheDocument()

    // Check for proper input labels
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()

    // Check for submit button
    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should validate email format before submission', async () => {
    render(<RegistrationForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should validate password requirements', async () => {
    render(<RegistrationForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Enter weak password
    await user.type(passwordInput, 'weak')
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should validate password confirmation match', async () => {
    render(<RegistrationForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Enter mismatched passwords
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should require all fields', async () => {
    render(<RegistrationForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Submit empty form
    await user.click(submitButton)

    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    render(<RegistrationForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i)
    const firstNameInput = screen.getByLabelText(/first name/i)
    const lastNameInput = screen.getByLabelText(/last name/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Fill out form with valid data
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.type(firstNameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.click(submitButton)

    // Should call register function
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      )
    })
  })

  it('should include login link', () => {
    render(<RegistrationForm />)

    const loginLink = screen.getByRole('link', { name: /sign in to your account/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should show password strength indicator', async () => {
    render(<RegistrationForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Type weak password
    await user.type(passwordInput, 'weak')
    expect(screen.getByText(/weak/i)).toBeInTheDocument()

    // Type medium password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'medium123')
    expect(screen.getByText(/medium/i)).toBeInTheDocument()

    // Type strong password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'StrongPassword123!')
    expect(screen.getByText(/strong/i)).toBeInTheDocument()
  })

  it('should toggle password visibility', async () => {
    render(<RegistrationForm />)

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
    render(<RegistrationForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

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
    const { container } = render(<RegistrationForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle keyboard navigation properly', async () => {
    render(<RegistrationForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i)
    const firstNameInput = screen.getByLabelText(/first name/i)
    const lastNameInput = screen.getByLabelText(/last name/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Tab through form elements in order
    await user.tab()
    expect(firstNameInput).toHaveFocus()

    await user.tab()
    expect(lastNameInput).toHaveFocus()

    await user.tab()
    expect(emailInput).toHaveFocus()

    await user.tab()
    expect(passwordInput).toHaveFocus()

    await user.tab()
    // Skip password toggle button
    await user.tab()
    expect(confirmPasswordInput).toHaveFocus()

    await user.tab()
    // Skip confirm password toggle button
    await user.tab()
    expect(submitButton).toHaveFocus()
  })
}) 