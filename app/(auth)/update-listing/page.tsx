'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../hooks/useAuth'
import { ProviderService, LocationService } from '../../../lib/databaseService'
import Header from '../../../components/layout/Header'
import { HeaderAd, FooterAd } from '@/components/ui/AdSense'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import type { Provider, Location } from '../../../types/database'

interface UpdateFormData {
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  description: string
  address: string
  servicesOffered: string[]
}

interface LocationFormData {
  name: string
  address: string
  description: string
  phone: string
  email: string
  website: string
  capacity: number
  currentCapacity: number
  operatingHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  services: string[]
  accessibilityFeatures: string[]
  languages: string[]
  eligibilityRequirements: string[]
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

const accessibilityOptions = [
  { id: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
  { id: 'parking_available', label: 'Parking Available' },
  { id: 'public_transport', label: 'Public Transportation Nearby' },
  { id: 'sign_language', label: 'Sign Language Interpreters' },
  { id: 'large_print', label: 'Large Print Materials' },
  { id: 'audio_assistance', label: 'Audio Assistance Available' }
]

const languageOptions = [
  { id: 'english', label: 'English' },
  { id: 'spanish', label: 'Spanish' },
  { id: 'french', label: 'French' },
  { id: 'mandarin', label: 'Mandarin' },
  { id: 'arabic', label: 'Arabic' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'other', label: 'Other Languages' }
]

export default function UpdateListingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'locations'>('profile')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [isNewLocation, setIsNewLocation] = useState(false)
  const [showOrgSelector, setShowOrgSelector] = useState(true)

  const [formData, setFormData] = useState<UpdateFormData>({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    servicesOffered: []
  })

  const [locationForm, setLocationForm] = useState<LocationFormData>({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    capacity: 0,
    currentCapacity: 0,
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: true },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    services: [],
    accessibilityFeatures: [],
    languages: ['english'],
    eligibilityRequirements: []
  })

  const providerService = new ProviderService()
  const locationService = new LocationService()

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '')
    if (!phoneNumber) return ''
    if (phoneNumber.length > 10) return phoneNumber.slice(0, 10)
    
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError('')

        // Get all organizations managed by this user
        const allProviders = await providerService.getAllByUserId(user.uid)
        
        if (allProviders.length === 0) {
          setError('No organizations found for your account. Please register your organization first.')
          return
        }

        setProviders(allProviders)
        
        // If only one organization, select it automatically
        if (allProviders.length === 1) {
          const firstProvider = allProviders[0]
          if (firstProvider) {
            setSelectedProvider(firstProvider)
            setShowOrgSelector(false)
            await loadProviderData(firstProvider)
          }
        } else {
          setShowOrgSelector(true)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load your organizations. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const loadProviderData = async (provider: Provider) => {
    try {
      setFormData({
        organizationName: provider.organizationName || '',
        contactPerson: provider.contactPerson || '',
        email: provider.email || '',
        phone: provider.phone || '',
        website: provider.website || '',
        description: provider.description || '',
        address: provider.address || '',
        servicesOffered: provider.servicesOffered || []
      })

      // Load locations
      const locationData = await locationService.getByProviderId(provider.id)
      setLocations(locationData)
    } catch (err) {
      console.error('Failed to load provider data:', err)
      setError('Failed to load organization data.')
    }
  }

  const handleSelectProvider = async (provider: Provider) => {
    setSelectedProvider(provider)
    setShowOrgSelector(false)
    await loadProviderData(provider)
  }

  const handleInputChange = (field: keyof UpdateFormData, value: string | string[]) => {
    if (field === 'phone' && typeof value === 'string') {
      value = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedProvider) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await providerService.updateProvider(selectedProvider.id, {
        organizationName: formData.organizationName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        address: formData.address,
        servicesOffered: formData.servicesOffered,
        updatedAt: new Date()
      })

      setSuccess('Profile updated successfully!')
      
              // Reload provider data
        const updatedProvider = await providerService.getById(selectedProvider.id)
        if (updatedProvider) {
          setSelectedProvider(updatedProvider)
        }
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const openLocationModal = (location?: Location) => {
    if (location) {
      setSelectedLocation(location)
      setIsNewLocation(false)
      setLocationForm({
        name: location.name || '',
        address: location.address || '',
        description: location.description || '',
        phone: location.phone || '',
        email: location.email || '',
        website: location.website || '',
        capacity: location.capacity || 0,
        currentCapacity: location.currentCapacity || 0,
        operatingHours: location.operatingHours ? {
          monday: { 
            open: location.operatingHours.monday?.open || '09:00', 
            close: location.operatingHours.monday?.close || '17:00', 
            closed: location.operatingHours.monday?.closed ?? false 
          },
          tuesday: { 
            open: location.operatingHours.tuesday?.open || '09:00', 
            close: location.operatingHours.tuesday?.close || '17:00', 
            closed: location.operatingHours.tuesday?.closed ?? false 
          },
          wednesday: { 
            open: location.operatingHours.wednesday?.open || '09:00', 
            close: location.operatingHours.wednesday?.close || '17:00', 
            closed: location.operatingHours.wednesday?.closed ?? false 
          },
          thursday: { 
            open: location.operatingHours.thursday?.open || '09:00', 
            close: location.operatingHours.thursday?.close || '17:00', 
            closed: location.operatingHours.thursday?.closed ?? false 
          },
          friday: { 
            open: location.operatingHours.friday?.open || '09:00', 
            close: location.operatingHours.friday?.close || '17:00', 
            closed: location.operatingHours.friday?.closed ?? false 
          },
          saturday: { 
            open: location.operatingHours.saturday?.open || '09:00', 
            close: location.operatingHours.saturday?.close || '17:00', 
            closed: location.operatingHours.saturday?.closed ?? true 
          },
          sunday: { 
            open: location.operatingHours.sunday?.open || '09:00', 
            close: location.operatingHours.sunday?.close || '17:00', 
            closed: location.operatingHours.sunday?.closed ?? true 
          }
        } : {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: true },
          sunday: { open: '09:00', close: '17:00', closed: true }
        },
        services: location.services || [],
        accessibilityFeatures: location.accessibilityFeatures || [],
        languages: location.languages || ['english'],
        eligibilityRequirements: location.eligibilityRequirements || []
      })
    } else {
      setSelectedLocation(null)
      setIsNewLocation(true)
      setLocationForm({
        name: '',
        address: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        capacity: 0,
        currentCapacity: 0,
        operatingHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: true },
          sunday: { open: '09:00', close: '17:00', closed: true }
        },
        services: [],
        accessibilityFeatures: [],
        languages: ['english'],
        eligibilityRequirements: []
      })
    }
    setShowLocationModal(true)
  }

  const handleSubmitLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')

    try {
      if (isNewLocation) {
        // Create new location
        const newLocation = await locationService.createLocation({
          ...locationForm,
          providerId: selectedProvider!.id,
          coordinates: { latitude: 0, longitude: 0 }, // TODO: Add geocoding
          status: 'pending', // New locations require admin approval
          currentStatus: 'open',
          isVerified: false,
          totalVisits: 0,
          reviewCount: 0,
          averageRating: 0
        })
        setSuccess('Location added successfully!')
      } else if (selectedLocation) {
        // Update existing location
        await locationService.update('locations', selectedLocation.id, {
          ...locationForm,
          updatedAt: new Date()
        })
        setSuccess('Location updated successfully!')
      }

      // Reload locations
      const locationData = await locationService.getByProviderId(selectedProvider!.id)
      setLocations(locationData)
      setShowLocationModal(false)
    } catch (err) {
      console.error('Failed to save location:', err)
      setError('Failed to save location. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await locationService.delete('locations', locationId)
      setSuccess('Location deleted successfully!')
      
      // Reload locations
      const locationData = await locationService.getByProviderId(selectedProvider!.id)
      setLocations(locationData)
    } catch (err) {
      console.error('Failed to delete location:', err)
      setError('Failed to delete location. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main id="main-content" className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4">
          <HeaderAd />
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error && !selectedProvider) {
    return (
      <ProtectedRoute>
        <main id="main-content" className="min-h-screen bg-white">
          <Header />
          <div className="max-w-7xl mx-auto px-4">
            <HeaderAd />
          </div>
          <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Profile Not Found</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="space-y-4">
                  <Link 
                    href="/add-organization" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Complete Registration
                  </Link>
                  <div>
                    <Link 
                      href="/" 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      ← Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main id="main-content" className="min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* Header Ad */}
        <div className="max-w-7xl mx-auto px-4">
          <HeaderAd />
        </div>

        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Your Listing</h1>
              <p className="text-gray-600">
                Keep your organization profile and location information up to date to help community members find your services.
              </p>
            </div>

            {/* Organization Selector */}
            {showOrgSelector && providers.length > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Organization to Update</h2>
                <p className="text-gray-600 mb-6">
                  You manage {providers.length} organizations. Select which one you'd like to update:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleSelectProvider(provider)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{provider.organizationName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{provider.email}</p>
                          {provider.address && (
                            <p className="text-sm text-gray-500 mt-1">{provider.address}</p>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                            provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {provider.status}
                          </span>
                          {provider.isVerified && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mt-1">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link 
                    href="/add-organization"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Organization
                  </Link>
                </div>
              </div>
            )}

            {/* Show content only if an organization is selected */}
            {selectedProvider && (
              <div>
                {/* Back to Organization List Button */}
                {providers.length > 1 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowOrgSelector(true)}
                      className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Organization List
                    </button>
                  </div>
                )}

                {/* Current Organization Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Currently Editing: {selectedProvider.organizationName}</h3>
                      <p className="text-sm text-gray-600">{selectedProvider.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedProvider.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedProvider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedProvider.status}
                      </span>
                      {selectedProvider.isVerified && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800">{success}</p>
                </div>
              </div>
            )}

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

                {/* Tab Navigation */}
                <div className="mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'profile'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Organization Profile
                      </button>
                      <button
                        onClick={() => setActiveTab('locations')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'locations'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Locations ({locations.length})
                      </button>
                    </nav>
                  </div>
                </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Organization Information</h2>
                  <p className="text-gray-600">
                    Update your organization's basic information and contact details.
                  </p>
                </div>

                <form onSubmit={handleSubmitProfile} className="space-y-6">
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        disabled={saving}
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        disabled={saving}
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        disabled={saving}
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        disabled={saving}
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="https://www.organization.org"
                      disabled={saving}
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="123 Main St, City, State, ZIP"
                      required
                      disabled={saving}
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Describe your organization's mission and the services you provide..."
                      required
                      disabled={saving}
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
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              disabled={saving}
                            />
                            <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
                              {service.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                    <Link
                      href="/provider"
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                {/* Add Location Button */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Service Locations</h2>
                      <p className="text-gray-600">
                        Manage your organization's service locations and their details.
                      </p>
                    </div>
                    <button
                      onClick={() => openLocationModal()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Add Location
                    </button>
                  </div>
                </div>

                {/* Locations List */}
                {locations.length > 0 ? (
                  <div className="grid gap-6">
                    {locations.map((location) => (
                      <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{location.name}</h3>
                            <p className="text-gray-600 mb-2">{location.address}</p>
                            {location.description && (
                              <p className="text-gray-600 mb-4">{location.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {location.phone && (
                                <span>📞 {location.phone}</span>
                              )}
                              {location.email && (
                                <span>✉️ {location.email}</span>
                              )}
                              {location.capacity && (
                                <span>👥 Capacity: {location.capacity}</span>
                              )}
                            </div>

                            <div className="mt-4 flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                location.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                                location.currentStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                                location.currentStatus === 'closed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {location.currentStatus || 'Unknown'}
                              </span>
                              {location.isVerified ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  ✓ Verified
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  Pending Verification
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => openLocationModal(location)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(location.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Added</h3>
                    <p className="text-gray-600 mb-6">
                      Add your first service location to help people find your organization.
                    </p>
                    <button
                      onClick={() => openLocationModal()}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Add Your First Location
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {isNewLocation ? 'Add New Location' : 'Edit Location'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmitLocation} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      id="locationName"
                      value={locationForm.name}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label htmlFor="locationCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="locationCapacity"
                      value={locationForm.capacity}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      min="0"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="locationAddress"
                    value={locationForm.address}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="locationDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="locationDescription"
                    value={locationForm.description}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="locationPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="locationPhone"
                      value={locationForm.phone}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      maxLength={14}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label htmlFor="locationEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="locationEmail"
                      value={locationForm.email}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label htmlFor="locationWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="locationWebsite"
                      value={locationForm.website}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Services */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-3">
                      Services at this location
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serviceOptions.map((service) => (
                        <div key={service.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`location-service-${service.id}`}
                            checked={locationForm.services.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLocationForm(prev => ({ ...prev, services: [...prev.services, service.id] }))
                              } else {
                                setLocationForm(prev => ({ ...prev, services: prev.services.filter(s => s !== service.id) }))
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            disabled={saving}
                          />
                          <label htmlFor={`location-service-${service.id}`} className="ml-2 text-sm text-gray-700">
                            {service.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Accessibility Features */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-3">
                      Accessibility Features
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {accessibilityOptions.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`accessibility-${option.id}`}
                            checked={locationForm.accessibilityFeatures.includes(option.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLocationForm(prev => ({ ...prev, accessibilityFeatures: [...prev.accessibilityFeatures, option.id] }))
                              } else {
                                setLocationForm(prev => ({ ...prev, accessibilityFeatures: prev.accessibilityFeatures.filter(f => f !== option.id) }))
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            disabled={saving}
                          />
                          <label htmlFor={`accessibility-${option.id}`} className="ml-2 text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : isNewLocation ? 'Add Location' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <FooterAd />
            
            <div className="grid md:grid-cols-4 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">about</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-blue-600 hover:underline">help & FAQ</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">safety tips</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">terms of use</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">privacy policy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
                <ul className="space-y-1">
                  <li><Link href="/add-organization" className="text-blue-600 hover:underline">add your organization</Link></li>
                  <li><Link href="/update-listing" className="text-blue-600 hover:underline font-medium">update your listing</Link></li>
                  <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                  <li><a href="#" className="text-blue-600 hover:underline">bulk posting</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">community</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-blue-600 hover:underline">volunteer opportunities</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">donate to local organizations</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">community forums</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">resource guides</a></li>
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
    </ProtectedRoute>
  )
} 