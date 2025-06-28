'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { User, AuthContextType } from '../types/auth'
import { OrganizationRole } from '../types/database'
import type { User as DatabaseUser } from '../types/database'
import { Provider } from '../types/database'
import { ProviderService } from '../lib/databaseService'

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentOrganization, setCurrentOrganization] = useState<{ id: string; role: OrganizationRole } | undefined>()

  // Clear error helper
  const clearError = () => setError(null)

  // Format Firebase auth errors
  const formatAuthError = (error: any): string => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      clearError()
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // User state will be updated by onAuthStateChanged listener
      console.log('Login successful:', result.user.email)
    } catch (error: any) {
      const errorMessage = formatAuthError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Google login function
  const loginWithGoogle = async (): Promise<void> => {
    try {
      clearError()
      
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      
      // User state will be updated by onAuthStateChanged listener
      console.log('Google login successful:', result.user.email)
    } catch (error: any) {
      const errorMessage = formatAuthError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Register function
  const register = async (email: string, password: string): Promise<void> => {
    try {
      clearError()
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // User state will be updated by onAuthStateChanged listener
      console.log('Registration successful:', result.user.email)
    } catch (error: any) {
      const errorMessage = formatAuthError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      clearError()
      
      await signOut(auth)
      
      // User state will be updated by onAuthStateChanged listener
      console.log('Logout successful')
      
      // Redirect to index page
      window.location.href = '/'
    } catch (error: any) {
      const errorMessage = formatAuthError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      clearError()
      
      await sendPasswordResetEmail(auth, email)
      
      console.log('Password reset email sent to:', email)
    } catch (error: any) {
      const errorMessage = formatAuthError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Update profile function
  const updateProfile = async (profileData: any): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      clearError()
      
      // Here you would update the user profile in Firestore
      // For now, we'll just simulate success
      console.log('Updating profile:', profileData)
      
      // TODO: Implement Firestore update when database layer is ready
      // await updateDoc(doc(db, 'users', user.uid), {
      //   profile: {
      //     ...user.profile,
      //     ...profileData,
      //     updatedAt: new Date()
      //   }
      // })
      
      console.log('Profile update successful')
    } catch (error: any) {
      const errorMessage = formatAuthError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Computed properties
  const isAuthenticated = !!user
  const isProvider = user?.role === 'provider'
  const isAdmin = user?.role === 'admin'
  const isSuperuser = user?.role === 'superuser'
  const isAdminOrSuperuser = user?.role === 'admin' || user?.role === 'superuser'

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as DatabaseUser
        
        // Merge Firebase user with Firestore data
        return {
          ...firebaseUser,
          role: userData.role || 'user',
          profile: {
            firstName: userData.profile?.firstName || undefined,
            lastName: userData.profile?.lastName || undefined,
            phoneNumber: userData.profile?.phone || undefined,
            organizationName: undefined,
            isVerified: userData.isEmailVerified || false,
            createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(),
            updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(),
          }
        }
      } else {
        // User document doesn't exist, create basic user object
        console.warn('User document not found in Firestore for:', firebaseUser.email)
        return {
          ...firebaseUser,
          role: 'user',
          profile: {
            firstName: undefined,
            lastName: undefined,
            phoneNumber: undefined,
            organizationName: undefined,
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error)
      // Return basic user object on error
      return {
        ...firebaseUser,
        role: 'user',
        profile: {
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...')
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (firebaseUser: FirebaseUser | null) => {
        try {
          console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user')
          
          if (firebaseUser) {
            // Fetch user data from Firestore
            const userData = await fetchUserData(firebaseUser)
            setUser(userData)
          } else {
            setUser(null)
          }
          
          // Clear any existing errors on successful auth state change
          setError(null)
        } catch (error: any) {
          console.error('Error processing auth state change:', error)
          setError(formatAuthError(error))
          setUser(null)
        } finally {
          console.log('Setting loading to false')
          setLoading(false)
        }
      },
      (error) => {
        console.error('Auth state change error:', error)
        setError(formatAuthError(error))
        setUser(null)
        setLoading(false)
      }
    )

    // Cleanup subscription
    return unsubscribe
  }, [])

  const setCurrentOrganizationContext = useCallback(async (organizationId: string) => {
    if (!user) return

    try {
      const providerService = new ProviderService()
      const provider = await providerService.getById(organizationId)
      
      if (!provider) {
        throw new Error('Organization not found')
      }

      const member = provider.members?.[user.uid]
      if (!member && !isAdminOrSuperuser) {
        throw new Error('You are not a member of this organization')
      }

      setCurrentOrganization({
        id: organizationId,
        role: member?.role || 'admin' // Admins get admin role by default
      })
    } catch (err) {
      console.error('Failed to set organization context:', err)
      setError(err instanceof Error ? err.message : 'Failed to set organization context')
    }
  }, [user, isAdminOrSuperuser])

  const hasOrganizationPermission = useCallback(async (organizationId: string, permission: string): Promise<boolean> => {
    if (!user || !currentOrganization || currentOrganization.id !== organizationId) return false
    
    // Admins and superusers have all permissions
    if (isAdminOrSuperuser) return true

    try {
      // Get the provider service
      const providerService = new ProviderService()
      
      // Get the member's permissions
      const provider = await providerService.getById(organizationId)
      if (!provider) return false

      const member = provider.members?.[user.uid]
      if (!member) return false

      // Owners and admins have all permissions
      if (member.role === 'owner' || member.role === 'admin') return true

      // Check specific permission
      return member.permissions?.[permission as keyof typeof member.permissions] || false
    } catch (err) {
      console.error('Failed to check organization permission:', err)
      return false
    }
  }, [user, currentOrganization, isAdminOrSuperuser])

  const getCurrentOrganizationRole = useCallback((): OrganizationRole | null => {
    if (!user || !currentOrganization) return null
    return currentOrganization.role
  }, [user, currentOrganization])

  const value = {
    user,
    loading,
    error,
    currentOrganization,
    login,
    loginWithGoogle,
    logout,
    register,
    resetPassword,
    updateProfile,
    setCurrentOrganization: setCurrentOrganizationContext,
    hasOrganizationPermission,
    getCurrentOrganizationRole,
    isAuthenticated: !!user,
    isProvider: user?.role === 'provider',
    isAdmin: user?.role === 'admin',
    isSuperuser: user?.role === 'superuser',
    isAdminOrSuperuser: user?.role === 'admin' || user?.role === 'superuser'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 