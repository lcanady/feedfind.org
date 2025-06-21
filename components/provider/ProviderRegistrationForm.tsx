'use client'

import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { ProviderService } from '../../lib/databaseService'
import type { Provider } from '../../types/database'

export interface ProviderRegistrationFormProps {
  onProviderCreated: (provider: Provider) => void
  onCancel?: () => void
  className?: string
}

interface ProviderFormData {
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  website?: string
  description: string
  address: string
  servicesOffered: string[]
}

const serviceOptions = [
  { id: 'food_pantry', label: 'Food Pantry' },
  { id: 'soup_kitchen', label: 'Soup Kitchen' },
  { id: 'mobile_pantry', label: 'Mobile Food Pantry' },
  { id: 'senior_meals', label: 'Senior Meals' },
  { id: 'child_nutrition', label: 'Child Nutrition Programs' },
  { id: 'emergency_food', label: 'Emergency Food Assistance' },
  { id: 'nutrition_education', label: 'Nutrition Education' },
  { id: 'other', label: 'Other Services' }
]

export const ProviderRegistrationForm: React.FC<ProviderRegistrationFormProps> = ({
  onProviderCreated,
  onCancel,
  className = ''
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ProviderFormData>({
    organizationName: '',
    contactPerson: '',
    email: user?.email || '',
    phone: '',
    website: '',
    description: '',
    address: '',
    servicesOffered: []
  })

  const providerService = new ProviderService()

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Limit to 10 digits for US phone numbers
    const limitedDigits = digits.slice(0, 10)
    
    // Format based on length
    if (limitedDigits.length <= 3) {
      return limitedDigits
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
    }
  }

  const handleInputChange = (field: keyof ProviderFormData, value: string) => {
    // Apply phone formatting for phone field
    const processedValue = field === 'phone' ? formatPhoneNumber(value) : value
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(serviceId)
        ? prev.servicesOffered.filter(id => id !== serviceId)
        : [...prev.servicesOffered, serviceId]
    }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.organizationName.trim()) {
      errors.push('Organization name is required')
    }
    
    if (!formData.contactPerson.trim()) {
      errors.push('Contact person is required')
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address')
    }
    
    if (!formData.phone.trim()) {
      errors.push('Phone number is required')
    } else {
      // Validate that we have exactly 10 digits and proper format
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        errors.push('Please enter a complete 10-digit phone number')
      } else {
        // Also validate the exact format expected by the server
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
        if (!phoneRegex.test(formData.phone)) {
          errors.push('Phone number must be in the format (XXX) XXX-XXXX')
        }
      }
    }
    
    if (!formData.description.trim()) {
      errors.push('Description is required')
    }
    
    if (!formData.address.trim()) {
      errors.push('Address is required')
    }
    
    if (formData.servicesOffered.length === 0) {
      errors.push('Please select at least one service offered')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to register as a provider')
      return
    }
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const newProvider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        isVerified: false,
        status: 'pending',
        locationIds: []
      }
      
      const createdProvider = await providerService.create(newProvider)
      
      // Announce success to screen readers
      const announcement = `Provider profile created successfully for ${formData.organizationName}`
      const ariaLive = document.createElement('div')
      ariaLive.setAttribute('aria-live', 'polite')
      ariaLive.setAttribute('aria-atomic', 'true')
      ariaLive.className = 'sr-only'
      ariaLive.textContent = announcement
      document.body.appendChild(ariaLive)
      setTimeout(() => document.body.removeChild(ariaLive), 1000)
      
      onProviderCreated(createdProvider)
    } catch (err) {
      console.error('Failed to create provider:', err)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create provider profile'
      
      if (err instanceof Error) {
        if (err.message.includes('Phone number must be in format')) {
          errorMessage = 'Please complete your phone number in the format (XXX) XXX-XXXX'
        } else if (err.message.includes('email')) {
          errorMessage = 'Please enter a valid email address'
        } else if (err.message.includes('Organization name')) {
          errorMessage = 'Organization name is required'
        } else if (err.message.includes('permission')) {
          errorMessage = 'You do not have permission to create a provider profile. Please contact support.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Provider Profile
          </h2>
          <p className="text-gray-600">
            Register your food assistance organization to start managing locations and helping your community find your services.
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Downtown Food Bank"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., John Smith"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@organization.org"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.organization.org"
              disabled={loading}
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Main Address *
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main St, City, State, ZIP"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your organization's mission and the services you provide..."
              required
              disabled={loading}
            />
          </div>

          {/* Services Offered */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">
                Services Offered * (Select all that apply)
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={formData.servicesOffered.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Information Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">Review Process</h4>
                <p className="text-sm text-blue-700">
                  Your provider profile will be reviewed by our team before being approved. 
                  This typically takes 1-2 business days. You'll receive an email notification once approved.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Profile...
                </div>
              ) : (
                'Create Provider Profile'
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 sm:flex-none bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProviderRegistrationForm 