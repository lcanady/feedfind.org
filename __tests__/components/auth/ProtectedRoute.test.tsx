import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import { useAuth } from '../../../hooks/useAuth'
import { AuthContextType } from '../../../types/auth'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Helper function to create complete auth context mock
const createAuthMock = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  loading: false,
  error: null,
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  isAuthenticated: false,
  isProvider: false,
  isAdmin: false,
  isSuperuser: false,
  isAdminOrSuperuser: false,
  ...overrides,
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  const TestComponent = () => <div>Protected Content</div>

  it('should show loading state while authentication is loading', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      loading: true,
    }))

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: null,
      isAuthenticated: false,
    }))

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: { id: '123', email: 'test@example.com' } as any,
      isAuthenticated: true,
    }))

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should redirect to custom redirect path when provided', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: null,
      isAuthenticated: false,
    }))

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/custom-login')
  })

  it('should check provider role when requireProvider is true', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: { id: '123', email: 'test@example.com' } as any,
      isAuthenticated: true,
      isProvider: false,
    }))

    render(
      <ProtectedRoute requireProvider>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should allow access when user has provider role', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: { id: '123', email: 'test@example.com' } as any,
      isAuthenticated: true,
      isProvider: true,
    }))

    render(
      <ProtectedRoute requireProvider>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should check admin role when requireAdmin is true', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: { id: '123', email: 'test@example.com' } as any,
      isAuthenticated: true,
      isProvider: true,
      isAdmin: false,
    }))

    render(
      <ProtectedRoute requireAdmin>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should allow access when user has admin role', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      user: { id: '123', email: 'test@example.com' } as any,
      isAuthenticated: true,
      isProvider: true,
      isAdmin: true,
    }))

    render(
      <ProtectedRoute requireAdmin>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should render custom loading component when provided', () => {
    mockUseAuth.mockReturnValue(createAuthMock({
      loading: true,
    }))

    const CustomLoading = () => <div>Custom Spinner Component</div>

    render(
      <ProtectedRoute loadingComponent={<CustomLoading />}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Custom Spinner Component')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
}) 