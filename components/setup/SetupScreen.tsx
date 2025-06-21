'use client'

import { useState, useEffect } from 'react'
import { setupService, SetupData } from '../../lib/setupService'
import { useAuth } from '../../hooks/useAuth'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface ValidationErrors {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export default function SetupScreen() {
  const { user: authUser } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false)

  // Check if user is already logged in and populate form
  useEffect(() => {
    if (authUser) {
      setIsAlreadyLoggedIn(true)
      
      // Pre-populate form with user data
      if (authUser.displayName) {
        const nameParts = authUser.displayName.split(' ')
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: authUser.email || ''
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          email: authUser.email || ''
        }))
      }
    }
  }, [authUser])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear general error and success
    if (error) {
      setError(null)
    }
    if (success) {
      setSuccess(null)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
    
    // Validate required fields (names are required for email/password signup)
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required for email/password signup'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required for email/password signup'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return !Object.values(errors).some(error => error)
  }

  const handleSetupCompletion = async (useGoogleAuth = false) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isAlreadyLoggedIn && authUser) {
        // User is already authenticated, just create their profile
        const setupData: SetupData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: authUser.email || formData.email.trim(),
          useExistingAuth: true // New flag to indicate existing auth
        }

        await setupService.createSuperuserProfile(authUser, setupData)
      } else {
        // User needs to be authenticated first
        const setupData: SetupData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: useGoogleAuth ? undefined : formData.password,
          useGoogleAuth
        }

        await setupService.createSuperuser(setupData)
      }
      
      setSuccess('Superuser account created successfully! You are now logged in.')
      
      // The SetupWrapper will automatically hide the setup screen
      // once the auth state updates and setup is no longer needed
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailPasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For already logged in users, only validate names
    // For new users, validate the full form including email/password
    if (isAlreadyLoggedIn) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Please enter your first and last name to complete setup.')
        return
      }
    } else {
      if (!validateForm()) {
        return
      }
    }

    await handleSetupCompletion(false)
  }

  const handleGoogleSetup = async () => {
    await handleSetupCompletion(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to FeedFind
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              {isAlreadyLoggedIn ? 'Complete your superuser profile' : 'First-time setup required'}
            </p>
                         <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
               <div className="flex">
                 <div className="flex-shrink-0">
                   <svg 
                     className="h-5 w-5 text-blue-400" 
                     viewBox="0 0 20 20" 
                     fill="currentColor"
                     aria-hidden="true"
                   >
                     <path 
                       fillRule="evenodd" 
                       d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                       clipRule="evenodd" 
                     />
                   </svg>
                 </div>
                 <div className="ml-3">
                   <p className="text-sm text-blue-700">
                     {isAlreadyLoggedIn 
                       ? 'You are logged in but need to complete your superuser profile setup.'
                       : 'No users found in the system. Create the first superuser account to get started.'
                     }
                   </p>
                   <p className="text-xs text-blue-600 mt-1">
                     {isAlreadyLoggedIn
                       ? 'Your information has been pre-filled from your account. You can update it below.'
                       : 'The superuser has the highest level of system privileges. When using Google sign-in, your name will be automatically populated from your Google profile.'
                     }
                   </p>
                 </div>
               </div>
             </div>
          </div>

          {error && (
            <div 
              role="alert" 
              className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md"
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              role="alert" 
              className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-green-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailPasswordSetup} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                                 <label 
                   htmlFor="firstName"
                   className="block text-sm font-medium text-gray-700"
                 >
                   First Name <span className="text-gray-500">(optional for Google sign-in)</span>
                 </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                     aria-invalid={validationErrors.firstName ? 'true' : 'false'}
                   aria-describedby={validationErrors.firstName ? 'firstName-error' : undefined}
                 />
                {validationErrors.firstName && (
                  <p id="firstName-error" className="mt-1 text-sm text-red-600">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                                 <label 
                   htmlFor="lastName"
                   className="block text-sm font-medium text-gray-700"
                 >
                   Last Name <span className="text-gray-500">(optional for Google sign-in)</span>
                 </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                     aria-invalid={validationErrors.lastName ? 'true' : 'false'}
                   aria-describedby={validationErrors.lastName ? 'lastName-error' : undefined}
                 />
                {validationErrors.lastName && (
                  <p id="lastName-error" className="mt-1 text-sm text-red-600">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email - only show for new users */}
            {!isAlreadyLoggedIn && (
              <div>
                <label 
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  aria-invalid={validationErrors.email ? 'true' : 'false'}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                />
                {validationErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            )}

            {/* Show current email for logged in users */}
            {isAlreadyLoggedIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm">
                  {authUser?.email}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Using email from your logged-in account
                </p>
              </div>
            )}

            {/* Password - only show for new users */}
            {!isAlreadyLoggedIn && (
              <>
                <div>
                  <label 
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      aria-invalid={validationErrors.password ? 'true' : 'false'}
                      aria-describedby={validationErrors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-1.086-1.086L12 12m0 0l2.121 2.121M8.464 8.464L6.343 6.343m-2.122 2.121L8.465 12.707" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-600">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      aria-invalid={validationErrors.confirmPassword ? 'true' : 'false'}
                      aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-1.086-1.086L12 12m0 0l2.121 2.121M8.464 8.464L6.343 6.343m-2.122 2.121L8.465 12.707" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit Buttons */}
                         <div className="space-y-3">
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading 
                   ? 'Creating Superuser...' 
                   : isAlreadyLoggedIn 
                     ? 'Complete Superuser Setup' 
                     : 'Create Superuser Account'
                 }
               </button>

               {!isAlreadyLoggedIn && (
                 <>
                   <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-gray-300" />
                     </div>
                     <div className="relative flex justify-center text-sm">
                       <span className="px-2 bg-white text-gray-500">or</span>
                     </div>
                   </div>

                   <button
                     type="button"
                     onClick={handleGoogleSetup}
                     disabled={loading}
                     className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                       <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                       <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                     </svg>
                     {loading ? 'Setting up...' : 'Create with Google'}
                   </button>
                 </>
               )}
             </div>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              This account will have full superuser privileges.
              <br />
              Additional users, administrators, and providers can be created after initial setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 