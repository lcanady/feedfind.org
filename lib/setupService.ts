import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  User as FirebaseUser 
} from 'firebase/auth'
import { auth, db } from './firebase'
import type { User } from '../types/database'

export interface SetupData {
  firstName: string
  lastName: string
  email: string
  password?: string
  useGoogleAuth?: boolean
  useExistingAuth?: boolean
}

export class SetupService {
  async createSuperuserProfile(firebaseUser: FirebaseUser, data: SetupData): Promise<User> {
    try {
      // For users already authenticated, just create their Firestore profile
      const firstName = data.firstName || 'Admin'
      const lastName = data.lastName || 'User'
      
      // If user has a display name, prefer that
      if (firebaseUser.displayName) {
        const nameParts = firebaseUser.displayName.split(' ')
        const extractedFirstName = nameParts[0] || firstName
        const extractedLastName = nameParts.slice(1).join(' ') || lastName
        
        data.firstName = extractedFirstName
        data.lastName = extractedLastName
      }

      // Create the user document in Firestore with superuser role
      const userProfile: any = {
        firstName: data.firstName,
        lastName: data.lastName,
      }
      
      // Only add phone if it exists
      if (firebaseUser.phoneNumber) {
        userProfile.phone = firebaseUser.phoneNumber
      }

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || data.email,
        role: 'superuser', // This is the superuser with highest privileges
        profile: userProfile,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        lastLoginAt: serverTimestamp() as any,
        termsAcceptedAt: serverTimestamp() as any,
        privacyPolicyAcceptedAt: serverTimestamp() as any,
      }

      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)

      console.log('Superuser profile created successfully:', firebaseUser.email)
      return userData
    } catch (error: any) {
      console.error('Error creating superuser profile:', error)
      throw this.formatError(error)
    }
  }

  async createSuperuser(data: SetupData): Promise<User> {
    try {
      let firebaseUser: FirebaseUser
      
      if (data.useGoogleAuth) {
        // Create with Google OAuth
        const provider = new GoogleAuthProvider()
        provider.addScope('email')
        provider.addScope('profile')
        
        const result = await signInWithPopup(auth, provider)
        firebaseUser = result.user
      } else {
        // Create with email/password
        if (!data.password) {
          throw new Error('Password is required for email registration')
        }
        
        const result = await createUserWithEmailAndPassword(auth, data.email, data.password)
        firebaseUser = result.user
      }

      // For Google auth, use the user's actual name from their Google profile
      let firstName = data.firstName
      let lastName = data.lastName
      
      if (data.useGoogleAuth && firebaseUser.displayName) {
        const nameParts = firebaseUser.displayName.split(' ')
        firstName = nameParts[0] || data.firstName
        lastName = nameParts.slice(1).join(' ') || data.lastName || ''
      }

      // Create the user document in Firestore with superuser role
      // Only include fields that have values to avoid Firebase undefined errors
      const userProfile: any = {
        firstName,
        lastName,
      }
      
      // Only add phone if it exists
      if (firebaseUser.phoneNumber) {
        userProfile.phone = firebaseUser.phoneNumber
      }

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || data.email,
        role: 'superuser', // This is the superuser with highest privileges
        profile: userProfile,
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        lastLoginAt: serverTimestamp() as any,
        termsAcceptedAt: serverTimestamp() as any,
        privacyPolicyAcceptedAt: serverTimestamp() as any,
      }

      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)

      console.log('Superuser created successfully:', firebaseUser.email)
      return userData
    } catch (error: any) {
      console.error('Error creating superuser:', error)
      throw this.formatError(error)
    }
  }

  private formatError(error: any): Error {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists.')
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters long.')
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.')
      case 'auth/popup-closed-by-user':
        return new Error('Google sign-in was cancelled. Please try again.')
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection.')
      default:
        return new Error(error.message || 'An unexpected error occurred during setup.')
    }
  }
}

export const setupService = new SetupService() 