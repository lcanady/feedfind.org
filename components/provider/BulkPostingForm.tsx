'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LocationService, ProviderService } from '../../lib/databaseService'
import type { Location, CreateLocationData, Provider } from '../../types/database'

interface BulkLocationData {
  name: string
  address: string
  description?: string
  phone?: string
  email?: string
  website?: string
  operatingHours?: {
    monday?: { open: string; close: string; closed?: boolean }
    tuesday?: { open: string; close: string; closed?: boolean }
    wednesday?: { open: string; close: string; closed?: boolean }
    thursday?: { open: string; close: string; closed?: boolean }
    friday?: { open: string; close: string; closed?: boolean }
    saturday?: { open: string; close: string; closed?: boolean }
    sunday?: { open: string; close: string; closed?: boolean }
  }
  services?: string[]
  accessibilityFeatures?: string[]
  languages?: string[]
  capacity?: number
  eligibilityRequirements?: string[]
}

interface BulkPostingResults {
  successful: number
  failed: number
  errors: Array<{ row: number; error: string; location?: string }>
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
  'wheelchair_accessible',
  'hearing_accessible',
  'vision_accessible',
  'mental_health_support',
  'multilingual_staff',
  'interpreter_services'
]

const languageOptions = [
  'english',
  'spanish',
  'french',
  'chinese',
  'vietnamese',
  'korean',
  'tagalog',
  'other'
]

export const BulkPostingForm: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [provider, setProvider] = useState<Provider | null>(null)
  const [results, setResults] = useState<BulkPostingResults | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual entry state
  const [manualLocations, setManualLocations] = useState<BulkLocationData[]>([
    {
      name: '',
      address: '',
      description: '',
      phone: '',
      email: '',
      website: '',
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
      capacity: 0,
      eligibilityRequirements: []
    }
  ])

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<BulkLocationData[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const locationService = new LocationService()
  const providerService = new ProviderService()

  // Load provider data
  React.useEffect(() => {
    const loadProvider = async () => {
      if (!user) return
      
      try {
        const providerData = await providerService.getById(user.uid)
        setProvider(providerData)
      } catch (err) {
        console.error('Failed to load provider:', err)
        setError('Unable to load your provider profile. Please ensure you have a registered provider account.')
      }
    }

    loadProvider()
  }, [user])

  // Add new manual location
  const addManualLocation = () => {
    setManualLocations(prev => [...prev, {
      name: '',
      address: '',
      description: '',
      phone: '',
      email: '',
      website: '',
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
      capacity: 0,
      eligibilityRequirements: []
    }])
  }

  // Remove manual location
  const removeManualLocation = (index: number) => {
    setManualLocations(prev => prev.filter((_, i) => i !== index))
  }

  // Update manual location
  const updateManualLocation = (index: number, field: keyof BulkLocationData, value: any) => {
    setManualLocations(prev => prev.map((location, i) => 
      i === index ? { ...location, [field]: value } : location
    ))
  }

  // Handle service toggle for manual entry
  const toggleService = (locationIndex: number, serviceId: string) => {
    const location = manualLocations[locationIndex]
    if (!location) return
    const services = location.services || []
    const updatedServices = services.includes(serviceId)
      ? services.filter(id => id !== serviceId)
      : [...services, serviceId]
    
    updateManualLocation(locationIndex, 'services', updatedServices)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(csv|xlsx?)$/i)) {
      setError('Please upload a CSV or Excel file')
      return
    }

    setUploadedFile(file)
    parseFile(file)
  }

  // Parse uploaded file
  const parseFile = async (file: File) => {
    try {
      setLoading(true)
      setError('')

      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row')
      }

      const firstLine = lines[0]
      if (!firstLine) {
        throw new Error('Header row is empty')
      }

      const headers = firstLine.split(',').map(h => h.trim().toLowerCase())
      const data: BulkLocationData[] = []

      // Expected headers
      const requiredHeaders = ['name', 'address']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line) continue
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const location: BulkLocationData = {
          name: '',
          address: ''
        }

        headers.forEach((header, index) => {
          const value = values[index] || ''
          
          switch (header) {
            case 'name':
              location.name = value
              break
            case 'address':
              location.address = value
              break
            case 'description':
              location.description = value
              break
            case 'phone':
              location.phone = value
              break
            case 'email':
              location.email = value
              break
            case 'website':
              location.website = value
              break
            case 'capacity':
              location.capacity = parseInt(value) || 0
              break
            case 'services':
              location.services = value ? value.split(';').map(s => s.trim()) : []
              break
            case 'languages':
              location.languages = value ? value.split(';').map(l => l.trim()) : ['english']
              break
            case 'accessibility':
              location.accessibilityFeatures = value ? value.split(';').map(a => a.trim()) : []
              break
            case 'eligibility':
              location.eligibilityRequirements = value ? value.split(';').map(e => e.trim()) : []
              break
          }
        })

        if (location.name && location.address) {
          // Set default operating hours
          location.operatingHours = {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: true },
            sunday: { open: '09:00', close: '17:00', closed: true }
          }
          
          data.push(location)
        }
      }

      setParsedData(data)
      setShowPreview(true)
    } catch (err) {
      console.error('File parsing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setLoading(false)
    }
  }

  // Validate location data
  const validateLocation = (location: BulkLocationData): string[] => {
    const errors: string[] = []
    
    if (!location.name?.trim()) {
      errors.push('Name is required')
    }
    
    if (!location.address?.trim()) {
      errors.push('Address is required')
    }

    if (location.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(location.email)) {
      errors.push('Invalid email format')
    }

    if (location.website && !location.website.match(/^https?:\/\/.+/)) {
      errors.push('Website must start with http:// or https://')
    }

    return errors
  }

  // Submit bulk locations
  const handleSubmit = async () => {
    if (!user || !provider) {
      setError('Provider information not available')
      return
    }

    const locationsToProcess = activeTab === 'manual' ? manualLocations : parsedData
    
    if (locationsToProcess.length === 0) {
      setError('No locations to submit')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const results: BulkPostingResults = {
      successful: 0,
      failed: 0,
      errors: []
    }

    try {
      for (let i = 0; i < locationsToProcess.length; i++) {
        const location = locationsToProcess[i]
        if (!location) continue
        
        const validationErrors = validateLocation(location)
        
        if (validationErrors.length > 0) {
          results.failed++
          results.errors.push({
            row: i + 1,
            error: validationErrors.join(', '),
            location: location.name
          })
          continue
        }

        try {
          // Create location data
          const locationData: CreateLocationData = {
            name: location.name,
            address: location.address,
            description: location.description || '',
            coordinates: { latitude: 0, longitude: 0 }, // TODO: Add geocoding
            providerId: provider.id,
            status: 'pending', // New locations require admin approval
            currentStatus: 'open',
            operatingHours: location.operatingHours,
            services: location.services || [],
            phone: location.phone,
            email: location.email,
            website: location.website,
            accessibilityFeatures: location.accessibilityFeatures || [],
            languages: location.languages || ['english'],
            capacity: location.capacity || 0,
            currentCapacity: 0,
            eligibilityRequirements: location.eligibilityRequirements || [],
            isVerified: false,
            totalVisits: 0,
            reviewCount: 0,
            averageRating: 0
          }

          await locationService.createLocation(locationData)
          results.successful++
        } catch (err) {
          console.error(`Failed to create location ${i + 1}:`, err)
          results.failed++
          results.errors.push({
            row: i + 1,
            error: err instanceof Error ? err.message : 'Unknown error',
            location: location.name
          })
        }
      }

      setResults(results)
      
      if (results.successful > 0) {
        setSuccess(`Successfully created ${results.successful} location${results.successful > 1 ? 's' : ''}!`)
        
        // Reset form if all successful
        if (results.failed === 0) {
          if (activeTab === 'manual') {
            setManualLocations([{
              name: '',
              address: '',
              description: '',
              phone: '',
              email: '',
              website: '',
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
              capacity: 0,
              eligibilityRequirements: []
            }])
          } else {
            setUploadedFile(null)
            setParsedData([])
            setShowPreview(false)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }
        }
      }

      if (results.failed > 0) {
        setError(`${results.failed} location${results.failed > 1 ? 's' : ''} failed to create. See details below.`)
      }
    } catch (err) {
      console.error('Bulk submission error:', err)
      setError('An unexpected error occurred during submission')
    } finally {
      setLoading(false)
    }
  }

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [
      'name',
      'address', 
      'description',
      'phone',
      'email',
      'website',
      'capacity',
      'services',
      'languages',
      'accessibility',
      'eligibility'
    ]
    
    const csvContent = headers.join(',') + '\n' +
      'Example Food Pantry,"123 Main St, City, State 12345","Community food assistance program","(555) 123-4567","info@example.org","https://example.org",50,"food_pantry;emergency_food","english;spanish","wheelchair_accessible","low_income"'
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-locations-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!provider) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Provider Profile Required</h2>
          <p className="text-gray-600 mb-6">
            You need to have a verified provider profile to add locations in bulk.
          </p>
          <a
            href="/provider-register"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register as Provider
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h2>
        <div className="text-blue-800 space-y-2">
          <p>You can add multiple locations using one of two methods:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Manual Entry:</strong> Fill out the form below for each location</li>
            <li><strong>File Upload:</strong> Upload a CSV or Excel file with your location data</li>
          </ul>
          <p className="text-sm">
            All new locations will require admin approval before appearing in search results.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            File Upload
          </button>
        </nav>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          {manualLocations.map((location, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Location {index + 1}
                </h3>
                {manualLocations.length > 1 && (
                  <button
                    onClick={() => removeManualLocation(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div>
                  <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    value={location.name}
                    onChange={(e) => updateManualLocation(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Downtown Food Pantry"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`address-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    id={`address-${index}`}
                    value={location.address}
                    onChange={(e) => updateManualLocation(index, 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main St, City, State 12345"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`phone-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id={`phone-${index}`}
                    value={location.phone || ''}
                    onChange={(e) => updateManualLocation(index, 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id={`email-${index}`}
                    value={location.email || ''}
                    onChange={(e) => updateManualLocation(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="info@location.org"
                  />
                </div>

                <div>
                  <label htmlFor={`website-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id={`website-${index}`}
                    value={location.website || ''}
                    onChange={(e) => updateManualLocation(index, 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://location.org"
                  />
                </div>

                <div>
                  <label htmlFor={`capacity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id={`capacity-${index}`}
                    value={location.capacity || ''}
                    onChange={(e) => updateManualLocation(index, 'capacity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50"
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id={`description-${index}`}
                  value={location.description || ''}
                  onChange={(e) => updateManualLocation(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the services and any important information..."
                />
              </div>

              {/* Services */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {serviceOptions.map((service) => (
                    <label key={service.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={location.services?.includes(service.id) || false}
                        onChange={() => toggleService(index, service.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              onClick={addManualLocation}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Another Location
            </button>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Locations File</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV or Excel file with your location data. 
                <button
                  onClick={downloadTemplate}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  Download template
                </button>
              </p>
            </div>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {uploadedFile && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  File uploaded: {uploadedFile.name} ({parsedData.length} locations found)
                </p>
              </div>
            )}

            {/* File Preview */}
            {showPreview && parsedData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Preview Data</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.slice(0, 5).map((location, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">{location.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{location.address}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{location.phone || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">
                              {location.services?.join(', ') || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedData.length > 5 && (
                    <div className="bg-gray-50 px-3 py-2 text-sm text-gray-500">
                      And {parsedData.length - 5} more locations...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Results</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="text-green-800">
                <div className="text-lg font-semibold">{results.successful}</div>
                <div className="text-sm">Successful</div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800">
                <div className="text-lg font-semibold">{results.failed}</div>
                <div className="text-sm">Failed</div>
              </div>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Errors:</h4>
              <div className="space-y-2">
                {results.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="text-sm">
                      <span className="font-medium text-red-800">
                        Row {error.row}{error.location ? ` (${error.location})` : ''}:
                      </span>
                      <span className="text-red-700 ml-2">{error.error}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || (activeTab === 'manual' && manualLocations.every(l => !l.name && !l.address)) || (activeTab === 'upload' && parsedData.length === 0)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Submit {activeTab === 'manual' ? manualLocations.filter(l => l.name && l.address).length : parsedData.length} Location{((activeTab === 'manual' ? manualLocations.filter(l => l.name && l.address).length : parsedData.length) !== 1) ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  )
} 