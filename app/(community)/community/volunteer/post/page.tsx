'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { volunteerService } from '@/lib/communityService'
import { ProviderService } from '@/lib/databaseService'
import Header from '@/components/layout/Header'
import type { CreateVolunteerOpportunityData, Provider } from '@/types/database'

interface FormData {
  title: string
  description: string
  organization: string
  location: string
  address: string
  isRemote: boolean
  isOngoing: boolean
  startDate: string
  endDate: string
  schedule: string
  timeCommitment: string
  estimatedHours: string
  skills: string[]
  requirements: string[]
  ageRestriction: string
  backgroundCheckRequired: boolean
  trainingRequired: boolean
  spotsTotal: string
  contactEmail: string
  contactPhone: string
  applicationUrl: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  category: 'food_distribution' | 'kitchen_help' | 'delivery' | 'events' | 'admin' | 'other'
}

interface FormErrors {
  [key: string]: string
}

export default function PostVolunteerOpportunityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')
  const [providers, setProviders] = useState<Provider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    organization: '',
    location: '',
    address: '',
    isRemote: false,
    isOngoing: true,
    startDate: '',
    endDate: '',
    schedule: '',
    timeCommitment: '',
    estimatedHours: '',
    skills: [],
    requirements: [],
    ageRestriction: '',
    backgroundCheckRequired: false,
    trainingRequired: false,
    spotsTotal: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    applicationUrl: '',
    urgency: 'normal',
    category: 'food_distribution'
  })

  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const loadProviders = async () => {
      if (!user) return

      try {
        setLoadingProviders(true)
        const providerService = new ProviderService()
        const userProviders = await providerService.getAllByUserId(user.uid)
        setProviders(userProviders)

        // If there's only one provider, auto-select it
        if (userProviders.length === 1) {
          const provider = userProviders[0]
          setFormData(prev => ({
            ...prev,
            organization: provider.id,
            contactEmail: provider.email,
            contactPhone: provider.phone || ''
          }))
        }
      } catch (error) {
        console.error('Error loading providers:', error)
        setError('Failed to load your organizations')
      } finally {
        setLoadingProviders(false)
      }
    }

    loadProviders()
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.timeCommitment.trim()) {
      newErrors.timeCommitment = 'Time commitment is required'
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }))
      setRequirementInput('')
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to post an opportunity')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Find the selected provider
      const selectedProvider = providers.find(p => p.id === formData.organization)
      if (!selectedProvider) {
        throw new Error('Please select an organization')
      }

      // Create the opportunity data with proper types
      const opportunityData: CreateVolunteerOpportunityData = {
        title: formData.title,
        description: formData.description,
        organization: selectedProvider.organizationName,
        organizationId: selectedProvider.id, // Store the provider ID
        location: formData.location,
        isRemote: formData.isRemote,
        isOngoing: formData.isOngoing,
        timeCommitment: formData.timeCommitment,
        skills: formData.skills,
        requirements: formData.requirements,
        backgroundCheckRequired: formData.backgroundCheckRequired,
        trainingRequired: formData.trainingRequired,
        contactEmail: formData.contactEmail,
        urgency: formData.urgency,
        category: formData.category,
        createdBy: user.uid
      }

      // Add optional fields if they have values
      if (formData.address) opportunityData.address = formData.address
      if (formData.schedule) opportunityData.schedule = formData.schedule
      if (formData.ageRestriction) opportunityData.ageRestriction = formData.ageRestriction
      if (formData.contactPhone) opportunityData.contactPhone = formData.contactPhone
      if (formData.applicationUrl) opportunityData.applicationUrl = formData.applicationUrl
      
      // Handle date and number conversions
      if (formData.startDate) {
        opportunityData.startDate = new Date(formData.startDate)
      }
      if (formData.endDate) {
        opportunityData.endDate = new Date(formData.endDate)
      }
      if (formData.spotsTotal) {
        opportunityData.spotsTotal = parseInt(formData.spotsTotal)
      }
      if (formData.estimatedHours) {
        opportunityData.estimatedHours = parseInt(formData.estimatedHours)
      }

      const opportunityId = await volunteerService.create(opportunityData)
      router.push(`/community/volunteer/${opportunityId}`)
    } catch (error) {
      console.error('Error creating opportunity:', error)
      setError(error instanceof Error ? error.message : 'Failed to create opportunity')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Please Log In
            </h1>
            <p className="text-gray-600 mb-6">
              You must be logged in to post volunteer opportunities.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Log In
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Post a Volunteer Opportunity
          </h1>

          {loadingProviders ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your organizations...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You need to register an organization before posting volunteer opportunities.
              </p>
              <Link
                href="/add-organization"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Register Organization
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {/* Organization Selection */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <div className="flex gap-2">
                  <select
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => {
                      const provider = providers.find(p => p.id === e.target.value)
                      setFormData(prev => ({
                        ...prev,
                        organization: e.target.value,
                        contactEmail: provider?.email ?? prev.contactEmail,
                        contactPhone: provider?.phone ?? prev.contactPhone
                      }))
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  >
                    <option value="">Select an organization</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.organizationName}
                      </option>
                    ))}
                  </select>
                  {formData.organization && (
                    <Link
                      href={`/update-listing?id=${formData.organization}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </Link>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Weekend Food Pantry Assistant"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe the volunteer opportunity, responsibilities, and impact..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & Schedule */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Location & Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Downtown Los Angeles"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 123 Main St"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isRemote}
                        onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">This is a remote opportunity</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Commitment *
                    </label>
                    <input
                      type="text"
                      id="timeCommitment"
                      value={formData.timeCommitment}
                      onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.timeCommitment ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 4 hours/week"
                    />
                    {errors.timeCommitment && (
                      <p className="mt-1 text-sm text-red-600">{errors.timeCommitment}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Total Hours
                    </label>
                    <input
                      type="number"
                      id="estimatedHours"
                      value={formData.estimatedHours}
                      onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isOngoing}
                        onChange={(e) => handleInputChange('isOngoing', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">This is an ongoing opportunity</span>
                    </label>
                  </div>

                  {!formData.isOngoing && (
                    <>
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Requirements & Skills</h2>
                
                {/* Skills */}
                <div className="mb-4">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Food handling certification"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Add
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div className="mb-4">
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Requirements
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="requirements"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Must be 18 or older"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Add
                    </button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.requirements.map((requirement, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
                        >
                          {requirement}
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="ml-1 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ageRestriction" className="block text-sm font-medium text-gray-700 mb-1">
                      Age Restriction
                    </label>
                    <input
                      type="text"
                      id="ageRestriction"
                      value={formData.ageRestriction}
                      onChange={(e) => handleInputChange('ageRestriction', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 18+"
                    />
                  </div>

                  <div>
                    <label htmlFor="spotsTotal" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Spots Available
                    </label>
                    <input
                      type="number"
                      id="spotsTotal"
                      value={formData.spotsTotal}
                      onChange={(e) => handleInputChange('spotsTotal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.backgroundCheckRequired}
                        onChange={(e) => handleInputChange('backgroundCheckRequired', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Background check required</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.trainingRequired}
                        onChange={(e) => handleInputChange('trainingRequired', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Training required</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Application URL
                    </label>
                    <input
                      type="url"
                      id="applicationUrl"
                      value={formData.applicationUrl}
                      onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Urgency */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Category & Priority</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="food_distribution">Food Distribution</option>
                      <option value="kitchen_help">Kitchen Help</option>
                      <option value="delivery">Delivery</option>
                      <option value="events">Events</option>
                      <option value="admin">Administrative</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Level *
                    </label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Need</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/community/volunteer"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
} 