import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../../../components/layout/Header'
import { useAuth } from '../../../hooks/useAuth'

// Mock Firebase
jest.mock('../../../lib/firebase', () => ({
  auth: {},
  db: {}
}))

// Mock the auth hook
jest.mock('../../../hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Header', () => {
  const defaultAuthValue = {
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
    isAdmin: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show login/register links when user is not authenticated', () => {
    mockUseAuth.mockReturnValue(defaultAuthValue)
    
    render(<Header />)
    
    expect(screen.getAllByText('login')).toHaveLength(2) // Desktop + mobile
    expect(screen.getByText('register')).toBeInTheDocument()
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument()
  })

  it('should show user first name in greeting when available', () => {
    const userWithName = {
      uid: 'test-uid',
      email: 'john@example.com',
      displayName: 'John Doe',
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: 'token',
      tenantId: null,
      delete: jest.fn(),
      getIdToken: jest.fn(),
      getIdTokenResult: jest.fn(),
      reload: jest.fn(),
      toJSON: jest.fn(),
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: userWithName,
      isAuthenticated: true
    })
    
    render(<Header />)
    
    expect(screen.getByText('Welcome, John')).toBeInTheDocument()
    expect(screen.getAllByText('profile')).toHaveLength(2) // Desktop + mobile
    expect(screen.getAllByText('logout')).toHaveLength(2) // Desktop + mobile
  })

  it('should fall back to display name when first name is not available', () => {
    const userWithDisplayName = {
      uid: 'test-uid',
      email: 'jane@example.com',
      displayName: 'Jane Smith',
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: 'token',
      tenantId: null,
      delete: jest.fn(),
      getIdToken: jest.fn(),
      getIdTokenResult: jest.fn(),
      reload: jest.fn(),
      toJSON: jest.fn(),
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
      profile: {
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: userWithDisplayName,
      isAuthenticated: true
    })
    
    render(<Header />)
    
    expect(screen.getByText('Welcome, Jane Smith')).toBeInTheDocument()
  })

  it('should fall back to email when no name is available', () => {
    const userWithEmailOnly = {
      uid: 'test-uid',
      email: 'user@example.com',
      displayName: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: 'token',
      tenantId: null,
      delete: jest.fn(),
      getIdToken: jest.fn(),
      getIdTokenResult: jest.fn(),
      reload: jest.fn(),
      toJSON: jest.fn(),
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
      profile: {
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: userWithEmailOnly,
      isAuthenticated: true
    })
    
    render(<Header />)
    
    expect(screen.getByText('Welcome, user@example.com')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      loading: true
    })
    
    render(<Header />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
}) 