'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { volunteerService } from '@/lib/communityService'
import Header from '@/components/layout/Header'
import type { VolunteerOpportunity, UpdateVolunteerOpportunityData } from '@/types/database'

export default function EditVolunteerOpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const opportunityId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')
  const [opportunity, setOpportunity] = useState<VolunteerOpportunity | null>(null)
  
  const [formData, setFormData] = useState<UpdateVolunteerOpportunityData>({
    title: '',
    description: '',
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
    contactEmail: '',
    contactPhone: '',
    applicationUrl: '',
    urgency: 'normal',
    category: 'food_distribution'
  })

  useEffect(() => {
    const loadOpportunity = async () => {
      if (!user || !opportunityId) return

      try {
        setLoading(true)
        const data = await volunteerService.getOpportunity(opportunityId)
        
        if (!data) {
          setError('Opportunity not found')
          return
        }

        // Check if user has permission to edit
        if (data.createdBy !== user.uid && data.organizationId !== user.profile?.organizationId) {
          setError('You do not have permission to edit this opportunity')
          return
        }

        setOpportunity(data)
        setFormData({
          title: data.title,
          description: data.description,
          location: data.location,
          address: data.address || '',
          isRemote: data.isRemote || false,
          isOngoing: data.isOngoing || true,
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
          schedule: data.schedule || '',
          timeCommitment: data.timeCommitment,
          estimatedHours: data.estimatedHours?.toString() || '',
          skills: data.skills || [],
          requirements: data.requirements || [],
          ageRestriction: data.ageRestriction || '',
          backgroundCheckRequired: data.backgroundCheckRequired || false,
          trainingRequired: data.trainingRequired || false,
          spotsTotal: data.spotsTotal?.toString() || '',
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || '',
          applicationUrl: data.applicationUrl || '',
          urgency: data.urgency || 'normal',
          category: data.category || 'food_distribution'
        })
      } catch (error) {
        console.error('Error loading opportunity:', error)
        setError('Failed to load opportunity')
      } finally {
        setLoading(false)
      }
    }

    loadOpportunity()
  }, [user, opportunityId])

  const handleInputChange = (field: keyof UpdateVolunteerOpportunityData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    
    if (!user || !opportunity) {
      setError('You must be logged in to update an opportunity')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await volunteerService.update(opportunityId, formData)
      router.push(`/community/volunteer/${opportunityId}`)
    } catch (error) {
      console.error('Error updating opportunity:', error)
      setError(error instanceof Error ? error.message : 'Failed to update opportunity')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading opportunity...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">{error || 'Opportunity not found'}</div>
            <Link href="/community/volunteer" className="mt-4 inline-block text-blue-600 hover:underline">
              Return to opportunities
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/community" className="hover:text-blue-600">Community</Link>
          <span className="mx-2">/</span>
          <Link href="/community/volunteer" className="hover:text-blue-600">Volunteer Opportunities</Link>
          <span className="mx-2">/</span>
          <Link href={`/community/volunteer/${opportunity.id}`} className="hover:text-blue-600">{opportunity.title}</Link>
          <span className="mx-2">/</span>
          <span>Edit</span>
        </nav>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Volunteer Opportunity
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    required
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
                    required
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
                href={`/community/volunteer/${opportunity.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  saving ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 