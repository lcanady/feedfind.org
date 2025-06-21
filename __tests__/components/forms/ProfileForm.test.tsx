import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfileForm from '../../../components/forms/ProfileForm'
import { useAuth } from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'

// Mock Firebase
jest.mock('../../../lib/firebase', () => ({
  auth: {},
  db: {}
}))

// Mock the auth hook
jest.mock('../../../hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ProfileForm Pre-population', () => {
  const mockPush = jest.fn()
  
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
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    } as any)
  })

  it('should pre-populate fields from user profile data', async () => {
    const userWithProfile = {
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
      phoneNumber: '+1234567890',
      photoURL: null,
      providerId: 'firebase',
      role: 'user' as const,
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: userWithProfile,
      isAuthenticated: true
    })
    
    render(<ProfileForm />)
    
    // Wait for pre-population to occur
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    })

    // Check for pre-filled indicators (should have multiple)
    expect(screen.getAllByText('✓ Pre-filled')).toHaveLength(3) // firstName, lastName, phoneNumber
  })

  it('should pre-populate from displayName when profile data is missing', async () => {
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
      role: 'user' as const,
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
    
    render(<ProfileForm />)
    
    // Wait for pre-population from displayName
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
    })
  })

  it('should show pre-population success message', async () => {
    const userWithData = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
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
      role: 'user' as const,
      profile: {
        firstName: 'Test',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: userWithData,
      isAuthenticated: true
    })
    
    render(<ProfileForm />)
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/pre-filled with available information/i)).toBeInTheDocument()
    })
  })

  it('should not show pre-population indicators when no data available', () => {
    const userWithoutData = {
      uid: 'test-uid',
      email: 'empty@example.com',
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
      role: 'user' as const,
      profile: {
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: userWithoutData,
      isAuthenticated: true
    })
    
    render(<ProfileForm />)
    
    // Should not show pre-filled indicators
    expect(screen.queryByText('✓ Pre-filled')).not.toBeInTheDocument()
    expect(screen.queryByText(/pre-filled with available information/i)).not.toBeInTheDocument()
  })
}) 