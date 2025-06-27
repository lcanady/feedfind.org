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
  const { user, loading: authLoading, getCurrentOrganizationRole } = useAuth()
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
          setLoading(false)
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

    if (!authLoading && user) {
      loadData()
    }
  }, [user, authLoading])

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

  return (
    <ProtectedRoute 
      requireProvider={true}
      redirectTo="/login"
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <Header />
        <HeaderAd />

        <main className="container mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              {error.includes('No organizations found') && (
                <Link 
                  href="/add-organization"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                >
                  Register your organization →
                </Link>
              )}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your organization data...</p>
            </div>
          ) : showOrgSelector && providers.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Select Organization</h2>
              <div className="space-y-4">
                {providers.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => handleSelectProvider(provider)}
                    className="w-full text-left p-4 border rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <h3 className="font-medium">{provider.organizationName}</h3>
                    <p className="text-sm text-gray-600">{provider.email}</p>
                    {user?.uid && provider.members?.[user.uid]?.role && (
                      <span className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Role: {provider.members?.[user.uid]?.role}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : selectedProvider ? (
            <div>
              {/* Rest of your existing UI */}
              {/* ... */}
            </div>
          ) : null}
        </main>

        <FooterAd />
      </div>
    </ProtectedRoute>
  )
} 