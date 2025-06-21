'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'

export default function PasswordResetForm() {
  const { resetPassword, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset validation error
    setValidationError('')
    
    // Validate email
    if (!email) {
      setValidationError('Email is required')
      return
    }
    
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address')
      return
    }
    
    // Submit form
    try {
      await resetPassword(email)
      setIsSuccess(true)
    } catch {
      // Error is handled by the useAuth hook
    }
  }

  // Show success message after successful submission
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 border border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              A password reset link has been sent to your email address. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link 
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Reset Password
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        
        {error && (
          <div 
            role="alert" 
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md"
          >
            {error}
          </div>
        )}
        
        <form 
          onSubmit={handleSubmit}
          aria-label="Reset password form"
          className="space-y-4"
          noValidate
        >
          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-invalid={validationError ? 'true' : 'false'}
              aria-describedby={validationError ? 'email-error' : undefined}
            />
            {validationError && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {validationError}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link 
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
} 