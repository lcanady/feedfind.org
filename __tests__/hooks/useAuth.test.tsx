import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'

// Mock Firebase Auth functions
const mockSignInWithEmailAndPassword = jest.fn()
const mockCreateUserWithEmailAndPassword = jest.fn()
const mockSignOut = jest.fn()
const mockSendPasswordResetEmail = jest.fn()
const mockOnAuthStateChanged = jest.fn()

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  sendPasswordResetEmail: (...args: any[]) => mockSendPasswordResetEmail(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  User: jest.fn(),
}))

// Mock Firebase app
jest.mock('../../lib/firebase', () => ({
  auth: {},
}))

import { useAuth, AuthProvider } from '../../hooks/useAuth'

// Test wrapper with AuthProvider
const createWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    // Mock onAuthStateChanged to not call callback immediately (loading state)
    mockOnAuthStateChanged.mockImplementation(() => {
      return jest.fn() // unsubscribe function
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should handle successful login', async () => {
    // Mock onAuthStateChanged to call with null first (no user)
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null)
      return jest.fn() // unsubscribe function
    })

    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    )
    expect(result.current.error).toBeNull()
  })

  it('should handle login failures with proper errors', async () => {
    const mockError = { code: 'auth/invalid-credential', message: 'Invalid credentials' }
    mockSignInWithEmailAndPassword.mockRejectedValue(mockError)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword')
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.user).toBeNull()
  })

  it('should manage logout correctly', async () => {
    mockSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(mockSignOut).toHaveBeenCalledWith(expect.anything())
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should persist authentication state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    // Should provide consistent state across re-renders
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('register')
    expect(result.current).toHaveProperty('resetPassword')
  })

  it('should handle password reset flow', async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com'
    )
  })

  it('should handle user registration', async () => {
    const mockUser = {
      uid: 'new-user-uid',
      email: 'newuser@example.com',
      displayName: null,
    }

    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    await act(async () => {
      await result.current.register('newuser@example.com', 'password123')
    })

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'newuser@example.com',
      'password123'
    )
  })

  it('should provide user type information', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    // Should include methods to check user roles/types
    expect(result.current).toHaveProperty('isProvider')
    expect(result.current).toHaveProperty('isAdmin')
    expect(result.current).toHaveProperty('isAuthenticated')
  })

  it('should handle authentication errors gracefully', async () => {
    const authError = {
      code: 'auth/user-not-found',
      message: 'User not found',
    }

    mockSignInWithEmailAndPassword.mockRejectedValue(authError)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper,
    })

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password')
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toContain('No account found')
  })
}) 