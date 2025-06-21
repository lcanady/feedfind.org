import { User as FirebaseUser } from 'firebase/auth'

// Enhanced user interface extending Firebase User
export interface User extends FirebaseUser {
  role?: 'user' | 'provider' | 'admin' | 'superuser'
  profile?: UserProfile
}

// User profile information
export interface UserProfile {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  organizationName?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  adPreferences?: AdPreferences
  accountSettings?: AccountSettings
}

// Ad preferences and subscription
export interface AdPreferences {
  showAds: boolean
  subscriptionType: 'free' | 'ad-free' | 'premium'
  subscriptionExpires?: Date
  adPersonalization: boolean
}

// Account settings
export interface AccountSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  locationSharing: boolean
  dataProcessing: boolean
  language: 'en' | 'es'
  theme: 'light' | 'dark' | 'system'
}

// Profile form data
export interface ProfileFormData {
  firstName: string
  lastName: string
  phoneNumber?: string
  organizationName?: string
  emailNotifications: boolean
  pushNotifications: boolean
  locationSharing: boolean
  adPersonalization: boolean
  language: 'en' | 'es'
  theme: 'light' | 'dark' | 'system'
}

// Authentication context state
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Authentication actions
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (profileData: Partial<ProfileFormData>) => Promise<void>
  isAuthenticated: boolean
  isProvider: boolean
  isAdmin: boolean
  isSuperuser: boolean
  isAdminOrSuperuser: boolean
}

// Combined auth context interface
export interface AuthContextType extends AuthState, AuthActions {}

// Login form data
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

// Registration form data
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  organizationName?: string
  userType: 'user' | 'provider'
  acceptTerms: boolean
}

// Password reset form data
export interface PasswordResetFormData {
  email: string
}

// Authentication errors
export interface AuthError {
  code: string
  message: string
}

// Provider verification status
export interface ProviderVerification {
  status: 'pending' | 'approved' | 'rejected'
  documents?: string[]
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
} 