import { render, screen, waitFor } from '@testing-library/react'
import { useAuth } from '../../../hooks/useAuth'
import AdminAuth from '../../../components/admin/AdminAuth'
import { User, AuthContextType } from '../../../types/auth'

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('AdminAuth', () => {
  const createMockUser = (role: 'user' | 'provider' | 'admin' | 'superuser' = 'admin'): User => ({
    uid: 'admin-user-123',
    email: 'admin@feedfind.org',
    displayName: 'Admin User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    role,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
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
    isAdmin: false,
    isProvider: false,
    isSuperuser: false,
    isAdminOrSuperuser: false,
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should restrict admin features to authorized users', async () => {
    // Arrange: Mock non-admin user
    const regularUser = createMockUser('user')
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: regularUser,
      isAuthenticated: true,
    }))

    // Act: Render AdminAuth component
    render(<AdminAuth><div>Admin Content</div></AdminAuth>)

    // Assert: Should show access denied message
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should implement proper admin role checking', async () => {
    // Arrange: Mock admin user
    const adminUser = createMockUser('admin')
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: adminUser,
      isAuthenticated: true,
      isAdmin: true,
      isAdminOrSuperuser: true,
    }))

    // Act: Render AdminAuth component
    render(<AdminAuth><div>Admin Content</div></AdminAuth>)

    // Assert: Should show admin content
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })
    expect(screen.queryByText(/access denied/i)).not.toBeInTheDocument()
  })

  it('should allow superuser access to admin features', async () => {
    // Arrange: Mock superuser
    const superUser = createMockUser('superuser')
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: superUser,
      isAuthenticated: true,
      isSuperuser: true,
      isAdminOrSuperuser: true,
    }))

    // Act: Render AdminAuth component
    render(<AdminAuth><div>Admin Content</div></AdminAuth>)

    // Assert: Should show admin content for superuser
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })
  })

  it('should show loading state while checking authentication', () => {
    // Arrange: Mock loading state
    mockUseAuth.mockReturnValue(createMockAuthContext({
      loading: true,
    }))

    // Act: Render AdminAuth component
    render(<AdminAuth><div>Admin Content</div></AdminAuth>)

    // Assert: Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should handle authentication errors gracefully', () => {
    // Arrange: Mock error state
    mockUseAuth.mockReturnValue(createMockAuthContext({
      error: 'Authentication failed',
    }))

    // Act: Render AdminAuth component
    render(<AdminAuth><div>Admin Content</div></AdminAuth>)

    // Assert: Should show error message
    expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should redirect unauthenticated users to login', () => {
    // Arrange: Mock unauthenticated state
    mockUseAuth.mockReturnValue(createMockAuthContext())

    // Act: Render AdminAuth component
    render(<AdminAuth><div>Admin Content</div></AdminAuth>)

    // Assert: Should show login prompt
    expect(screen.getByText(/please log in/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })
}) 