'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import type { ProfileFormData } from '../../types/auth'
import { SidebarAd } from '@/components/ui/AdSense'

export default function ProfileForm() {
  const router = useRouter()
  const { user, updateProfile, loading } = useAuth()
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    organizationName: '',
    emailNotifications: true,
    pushNotifications: false,
    locationSharing: true,
    adPersonalization: true,
    language: 'en',
    theme: 'system'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({})
  const [isPrePopulated, setIsPrePopulated] = useState(false)

  // Load user data into form from multiple sources
  useEffect(() => {
    if (user) {
      // Helper function to extract first and last name from displayName
      const getNameFromDisplayName = (displayName: string | null) => {
        if (!displayName) return { firstName: '', lastName: '' }
        const parts = displayName.split(' ')
        return {
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || ''
        }
      }

      // Get name from profile first, then fallback to displayName
      const profileFirstName = user.profile?.firstName
      const profileLastName = user.profile?.lastName
      const { firstName: displayFirstName, lastName: displayLastName } = getNameFromDisplayName(user.displayName)

      const newFormData = {
        firstName: profileFirstName || displayFirstName || '',
        lastName: profileLastName || displayLastName || '',
        phoneNumber: user.profile?.phoneNumber || user.phoneNumber || '',
        organizationName: user.profile?.organizationName || '',
        emailNotifications: user.profile?.accountSettings?.emailNotifications ?? true,
        pushNotifications: user.profile?.accountSettings?.pushNotifications ?? false,
        locationSharing: user.profile?.accountSettings?.locationSharing ?? true,
        adPersonalization: user.profile?.adPreferences?.adPersonalization ?? true,
        language: user.profile?.accountSettings?.language ?? 'en',
        theme: user.profile?.accountSettings?.theme ?? 'system'
      }

      setFormData(newFormData)

      // Check if any fields were pre-populated
      const hasPrePopulatedData = newFormData.firstName || 
                                  newFormData.lastName || 
                                  newFormData.phoneNumber || 
                                  newFormData.organizationName
      
      if (hasPrePopulatedData) {
        setIsPrePopulated(true)
        // Show a temporary message about pre-populated data
        setMessage({ 
          type: 'success', 
          text: 'Your profile has been pre-filled with available information. Please review and update as needed.' 
        })
        // Clear the message after 5 seconds
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      }
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      await updateProfile(formData)
      
      // Redirect to home page with success message
      router.push('/?message=profile-updated')
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isAdFree = user?.profile?.adPreferences?.subscriptionType === 'ad-free' || 
                   user?.profile?.adPreferences?.subscriptionType === 'premium'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-3">
        <div className="bg-white border border-gray-200 rounded-lg">
          {message && (
            <div 
              className={`p-4 border-b border-gray-200 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Personal Information */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                    {formData.firstName && isPrePopulated && (
                      <span className="ml-2 text-xs text-green-600 font-normal">✓ Pre-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-300' : 
                      formData.firstName && isPrePopulated ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }`}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                    {formData.lastName && isPrePopulated && (
                      <span className="ml-2 text-xs text-green-600 font-normal">✓ Pre-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-300' : 
                      formData.lastName && isPrePopulated ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }`}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                  {formData.phoneNumber && isPrePopulated && (
                    <span className="ml-2 text-xs text-green-600 font-normal">✓ Pre-filled</span>
                  )}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? 'border-red-300' : 
                    formData.phoneNumber && isPrePopulated ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                  aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
                />
                {errors.phoneNumber && (
                  <p id="phoneNumber-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {user?.role === 'provider' && (
                <div className="mt-4">
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your organization name"
                  />
                </div>
              )}
            </div>

            {/* Ad Preferences */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ad Preferences</h2>
              
              {!isAdFree && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-900">Upgrade to Ad-Free</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Remove all advertisements and support FeedFind.org for just $3/month
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}

              {isAdFree ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ Ad-Free Experience Active</p>
                  <p className="text-sm text-green-700 mt-1">
                    Thank you for supporting FeedFind.org!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.adPersonalization}
                      onChange={(e) => handleInputChange('adPersonalization', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Ad Personalization - Show more relevant ads based on your location
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Email notifications about nearby food assistance
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications}
                    onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Push notifications for status updates
                  </span>
                </label>
              </div>
            </div>

            {/* Privacy & Language */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy & Language</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.locationSharing}
                    onChange={(e) => handleInputChange('locationSharing', e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Allow location sharing for better search results
                  </span>
                </label>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Account Type:</span> {user?.role || 'User'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Subscription:</span> {
                    user?.profile?.adPreferences?.subscriptionType === 'free' ? 'Free (with ads)' :
                    user?.profile?.adPreferences?.subscriptionType === 'ad-free' ? 'Ad-Free' :
                    user?.profile?.adPreferences?.subscriptionType === 'premium' ? 'Premium' :
                    'Free (with ads)'
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col md:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full md:w-auto px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 order-2 md:order-1"
                >
                  Back to Main
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 md:order-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-6">
          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
            <nav className="space-y-2">
              <a href="#personal-info" className="block text-sm text-gray-600 hover:text-blue-600">Personal Information</a>
              <a href="#ad-preferences" className="block text-sm text-gray-600 hover:text-blue-600">Ad Preferences</a>
              <a href="#notifications" className="block text-sm text-gray-600 hover:text-blue-600">Notifications</a>
              <a href="#privacy" className="block text-sm text-gray-600 hover:text-blue-600">Privacy & Language</a>
              <a href="#account" className="block text-sm text-gray-600 hover:text-blue-600">Account Information</a>
            </nav>
          </div>

          {/* Sidebar Ad */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <SidebarAd />
          </div>

          {/* Help Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-4">
              Having trouble with your profile settings? Our support team is here to help.
            </p>
            <a
              href="/help"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Visit Help Center
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 