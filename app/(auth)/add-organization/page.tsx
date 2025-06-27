'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../hooks/useAuth'
import { ProviderRegistrationForm } from '../../../components/provider/ProviderRegistrationForm'
import Header from '../../../components/layout/Header'
import { HeaderAd, FooterAd } from '@/components/ui/AdSense'

export default function AddOrganizationPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'signup' | 'register'>('info')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If user is already authenticated, skip to registration step
    if (isAuthenticated && user) {
      setStep('register')
    }
  }, [isAuthenticated, user])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setStep('register')
    } else {
      setStep('signup')
    }
  }

  const handleUserSignedUp = () => {
    setStep('register')
  }

  const handleProviderRegistered = () => {
    router.push('/provider')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Header Ad */}
      <div className="max-w-7xl mx-auto px-4">
        <HeaderAd />
      </div>

      {step === 'info' && (
        <>
          {/* Hero Section */}
          <div className="bg-purple-50 border-b border-purple-100">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Add Your Organization to FeedFind
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Join our network of food assistance providers and help your community find the resources they need. 
                  Increase your visibility and make it easier for people to discover your services.
                </p>
                <button
                  onClick={handleGetStarted}
                  disabled={loading}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Getting Started...' : 'Get Started'}
                </button>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Increase Visibility</h3>
                <p className="text-gray-600">
                  Make your organization more discoverable to people in need of food assistance in your community.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  Update your availability status in real-time to reduce wasted trips and improve service efficiency.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Connection</h3>
                <p className="text-gray-600">
                  Connect with your community more effectively and receive feedback to improve your services.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Getting your organization listed on FeedFind is simple and free. Follow these easy steps to get started.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Account</h3>
                  <p className="text-gray-600">
                    Sign up for a free account or log in if you already have one. This takes less than 2 minutes.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Organization Info</h3>
                  <p className="text-gray-600">
                    Provide details about your organization, services, and contact information.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Go Live</h3>
                  <p className="text-gray-600">
                    After a quick review, your organization will be live and searchable by community members.
                  </p>
                </div>
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={handleGetStarted}
                  disabled={loading}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Getting Started...' : 'Start Registration'}
                </button>
              </div>
            </div>
          </div>

          {/* Types of Organizations Section */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Can Join</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                FeedFind welcomes all types of food assistance organizations. Here are some examples of who we serve:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">🏪</div>
                <h3 className="font-semibold text-gray-900 mb-2">Food Pantries</h3>
                <p className="text-sm text-gray-600">Regular distribution of groceries and food supplies</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">🍲</div>
                <h3 className="font-semibold text-gray-900 mb-2">Soup Kitchens</h3>
                <p className="text-sm text-gray-600">Hot meal service and community dining programs</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">🚚</div>
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Pantries</h3>
                <p className="text-sm text-gray-600">Mobile food distribution and outreach services</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">🏛️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Community Centers</h3>
                <p className="text-sm text-gray-600">Community-based food assistance programs</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">⛪</div>
                <h3 className="font-semibold text-gray-900 mb-2">Faith-Based</h3>
                <p className="text-sm text-gray-600">Churches, temples, and religious organization programs</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">🏫</div>
                <h3 className="font-semibold text-gray-900 mb-2">Schools</h3>
                <p className="text-sm text-gray-600">School-based food programs and backpack programs</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">👴</div>
                <h3 className="font-semibold text-gray-900 mb-2">Senior Services</h3>
                <p className="text-sm text-gray-600">Senior meal programs and elder nutrition services</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="font-semibold text-gray-900 mb-2">Nonprofits</h3>
                <p className="text-sm text-gray-600">Charitable organizations providing food assistance</p>
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'signup' && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your Account</h1>
            <p className="text-gray-600">
              Start by creating your account to manage your organization's profile
            </p>
          </div>

          <UserSignupForm onSuccess={handleUserSignedUp} />

          <div className="mt-8 text-center">
            <button
              onClick={() => setStep('info')}
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Information
            </button>
          </div>
        </div>
      )}

      {step === 'register' && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Register Your Organization</h1>
            <p className="text-gray-600">
              Provide details about your organization to complete your FeedFind profile
            </p>
          </div>

          <ProviderRegistrationForm 
            onProviderCreated={handleProviderRegistered}
            onCancel={() => router.push('/')}
          />

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Footer Ad */}
          <FooterAd />
          
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">about</h3>
              <ul className="space-y-1">
                <li><Link href="/help" className="text-blue-600 hover:underline">help & FAQ</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">safety tips</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">terms of use</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">privacy policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
              <ul className="space-y-1">
                <li><Link href="/add-organization" className="text-blue-600 hover:underline font-medium">add your organization</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">update your listing</a></li>
                                  <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">bulk posting</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">community</h3>
              <ul className="space-y-1">
                <li><Link href="/community/volunteer" className="text-blue-600 hover:underline">volunteer opportunities</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">donate to local organizations</a></li>
                <li><Link href="/community/forums" className="text-blue-600 hover:underline">community forums</Link></li>
                <li><Link href="/community/resources" className="text-blue-600 hover:underline">resource guides</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">contact</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">report an issue</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">suggest improvements</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">partnership inquiries</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2024 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </main>
  )
}

// User Signup Form Component
function UserSignupForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, loginWithGoogle, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset validation errors
    const errors: Record<string, string> = {}
    
    // Validate required fields
    if (!formData.firstName) errors.firstName = 'First name is required'
    if (!formData.lastName) errors.lastName = 'Last name is required'
    if (!formData.email) {
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
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    
    try {
      await register(formData.email, formData.password)
      onSuccess()
    } catch {
      // Error is handled by the useAuth hook
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle()
      onSuccess()
    } catch {
      // Error is handled by the useAuth hook
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Google Sign Up Button */}
      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'Signing up...' : 'Continue with Google'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L15.12 15.12m-4.242-4.242L5.636 5.636m0 0L3 3m2.636 2.636L9.878 9.878m6.364 6.364L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
} 