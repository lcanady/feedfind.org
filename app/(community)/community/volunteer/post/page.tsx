'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { volunteerService } from '@/lib/communityService'
import { ProviderService } from '@/lib/databaseService'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'
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
            contactPhone: provider.phone ? provider.phone : prev.contactPhone
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
        createdBy: user.uid,
        spotsTotal: formData.spotsTotal ? parseInt(formData.spotsTotal) : undefined,
        spotsAvailable: formData.spotsTotal ? parseInt(formData.spotsTotal) : undefined
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
    <main id="main-content" className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Top Banner Ad */}
      <HeaderAd />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Volunteer Opportunity</h1>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Selection */}
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <select
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={(e) => {
                      const provider = providers.find(p => p.id === e.target.value)
                      setFormData(prev => ({
                        ...prev,
                        organization: e.target.value,
                        contactEmail: provider ? provider.email : prev.contactEmail,
                        contactPhone: provider && provider.phone ? provider.phone : prev.contactPhone
                      }))
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select an organization</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.organizationName}
                      </option>
                    ))}
                  </select>
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
            </div>

            {/* Bottom Banner Ad */}
            <FooterAd />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Sidebar Ad */}
              <SidebarAd />
              
              {/* Tips Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tips for Success</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Be clear about time commitments</li>
                  <li>• List any required skills</li>
                  <li>• Specify location details</li>
                  <li>• Include contact information</li>
                </ul>
              </div>

              {/* Help Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Having trouble posting your opportunity? Our support team is here to help.
                </p>
                <a 
                  href="mailto:support@feedfind.org"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Footer Ad */}
          <FooterAd />
          
          <div className="grid md:grid-cols-4 gap-6 text-sm mt-6">
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
                <li><Link href="/update-listing" className="text-blue-600 hover:underline">update your listing</Link></li>
                <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                <li><Link href="/bulkposting" className="text-blue-600 hover:underline">bulk posting</Link></li>
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