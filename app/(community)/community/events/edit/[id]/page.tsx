'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { HeaderAd, SidebarAd } from '@/components/ui/AdSense'
import { CommunityEventsService } from '@/lib/communityService'
import { ProviderService } from '@/lib/databaseService'
import { useAuth } from '@/hooks/useAuth'
import type { CommunityEvent, Provider, UpdateCommunityEventData } from '@/types/database'

interface Props {
  params: Promise<{
    id: string
  }>
}

interface FormData {
  title: string
  description: string
  organization: string
  location: string
  address: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  type: 'workshop' | 'distribution' | 'fundraiser' | 'other'
  capacity: string
  registrationRequired: boolean
  registrationUrl: string
  contactEmail: string
  contactPhone: string
  isVirtual: boolean
}

interface ValidationErrors {
  [key: string]: string
}

export default function EditEventPage({ params }: Props) {
  const { id: eventId } = React.use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<CommunityEvent | null>(null)
  const [managedOrganizations, setManagedOrganizations] = useState<Provider[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    organization: '',
    location: '',
    address: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    type: 'distribution',
    capacity: '',
    registrationRequired: false,
    registrationUrl: '',
    contactEmail: '',
    contactPhone: '',
    isVirtual: false
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Load event and organizations
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        // Load event
        const eventsService = new CommunityEventsService()
        const eventData = await eventsService.getEvent(eventId)
        
        if (!eventData) {
          setError('Event not found')
          return
        }

        // Check if user has permission to edit
        if (eventData.createdBy !== user.uid) {
          setError('You do not have permission to edit this event')
          return
        }

        setEvent(eventData)

        // Load organizations
        const providerService = new ProviderService()
        const providers = await providerService.getAllByUserId(user.uid)
        setManagedOrganizations(providers)

        // Set form data
        const startDate = eventData.startDate instanceof Date 
          ? eventData.startDate 
          : eventData.startDate.toDate()
        const endDate = eventData.endDate instanceof Date 
          ? eventData.endDate 
          : eventData.endDate.toDate()

        if (!eventData.title || !eventData.description || !eventData.location || !eventData.type || !eventData.contactEmail || !eventData.organizationId) {
          setError('Invalid event data')
          return
        }

        const event = eventData as Required<Pick<CommunityEvent, 'title' | 'description' | 'location' | 'type' | 'contactEmail' | 'organizationId'>> & CommunityEvent

        setFormData({
          title: event.title,
          description: event.description,
          organization: event.organizationId || '',
          location: event.location,
          address: event.address || '',
          startDate: startDate.toISOString().split('T')[0] || '',
          startTime: startDate.toTimeString().slice(0, 5),
          endDate: endDate.toISOString().split('T')[0] || '',
          endTime: endDate.toTimeString().slice(0, 5),
          type: event.type as FormData['type'],
          capacity: event.capacity?.toString() || '',
          registrationRequired: event.registrationRequired || false,
          registrationUrl: event.registrationUrl || '',
          contactEmail: event.contactEmail,
          contactPhone: event.contactPhone || '',
          isVirtual: event.isVirtual || false
        })
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load event data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, eventId])

  // Redirect if not logged in
  if (!user) {
    router.push(`/login?redirect=/community/events/edit/${eventId}`)
    return null
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    if (!formData.organization) {
      errors.organization = 'Organization is required'
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required'
    }
    if (!formData.isVirtual && !formData.address.trim()) {
      errors.address = 'Address is required for in-person events'
    }
    if (!formData.startDate) {
      errors.startDate = 'Start date is required'
    }
    if (!formData.startTime) {
      errors.startTime = 'Start time is required'
    }
    if (!formData.endDate) {
      errors.endDate = 'End date is required'
    }
    if (!formData.endTime) {
      errors.endTime = 'End time is required'
    }
    if (!formData.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required'
    }
    if (formData.registrationRequired && !formData.registrationUrl.trim()) {
      errors.registrationUrl = 'Registration URL is required when registration is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !event) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const eventsService = new CommunityEventsService()

      // Convert dates and times to timestamps
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      // Get the selected organization's details
      const selectedOrg = managedOrganizations.find(org => org.id === formData.organization)
      if (!selectedOrg) {
        throw new Error('Please select a valid organization')
      }

      const eventData: UpdateCommunityEventData = {
        title: formData.title,
        description: formData.description,
        organization: selectedOrg.organizationName,
        organizationId: selectedOrg.id,
        location: formData.location,
        address: formData.address,
        startDate: startDateTime,
        endDate: endDateTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: formData.type,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        registrationRequired: formData.registrationRequired,
        registrationUrl: formData.registrationUrl,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        isVirtual: formData.isVirtual,
        eventStatus: startDateTime > new Date() ? 'upcoming' : 'ongoing'
      }

      await eventsService.update(event.id, eventData)
      router.push(`/community/events/${event.id}`)
    } catch (err) {
      console.error('Error updating event:', err)
      setError('Failed to update event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <HeaderAd />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <HeaderAd />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-red-600 text-xl font-semibold mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Event not found'}</p>
            <Link
              href={`/community/events/${eventId}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              ← Back to Event
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <HeaderAd />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/community/events" className="hover:text-gray-700">
                Events
              </Link>
            </li>
            <li>•</li>
            <li>
              <Link href={`/community/events/${event.id}`} className="hover:text-gray-700">
                {event.title}
              </Link>
            </li>
            <li>•</li>
            <li>Edit</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`mt-1 block w-full border ${
                        validationErrors.title ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className={`mt-1 block w-full border ${
                        validationErrors.description ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>

                  {/* Organization */}
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                      Organization
                    </label>
                    <select
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      className={`mt-1 block w-full border ${
                        validationErrors.organization ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select an organization</option>
                      {managedOrganizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.organizationName}
                        </option>
                      ))}
                    </select>
                    {validationErrors.organization && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.organization}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location Name
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`mt-1 block w-full border ${
                        validationErrors.location ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {validationErrors.location && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                    )}
                  </div>

                  {/* Virtual Event Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVirtual"
                      checked={formData.isVirtual}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVirtual: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVirtual" className="ml-2 block text-sm text-gray-700">
                      This is a virtual event
                    </label>
                  </div>

                  {/* Address (only if not virtual) */}
                  {!formData.isVirtual && (
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className={`mt-1 block w-full border ${
                          validationErrors.address ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {validationErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                      )}
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className={`mt-1 block w-full border ${
                          validationErrors.startDate ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {validationErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className={`mt-1 block w-full border ${
                          validationErrors.startTime ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {validationErrors.startTime && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.startTime}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className={`mt-1 block w-full border ${
                          validationErrors.endDate ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {validationErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className={`mt-1 block w-full border ${
                          validationErrors.endTime ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {validationErrors.endTime && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.endTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Event Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Event Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FormData['type'] }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="distribution">Distribution</option>
                      <option value="workshop">Workshop</option>
                      <option value="fundraiser">Fundraiser</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Capacity (optional)
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Registration */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="registrationRequired"
                        checked={formData.registrationRequired}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationRequired: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="registrationRequired" className="ml-2 block text-sm text-gray-700">
                        Registration required
                      </label>
                    </div>

                    {formData.registrationRequired && (
                      <div>
                        <label htmlFor="registrationUrl" className="block text-sm font-medium text-gray-700">
                          Registration URL
                        </label>
                        <input
                          type="url"
                          id="registrationUrl"
                          value={formData.registrationUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, registrationUrl: e.target.value }))}
                          className={`mt-1 block w-full border ${
                            validationErrors.registrationUrl ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="https://"
                        />
                        {validationErrors.registrationUrl && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.registrationUrl}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className={`mt-1 block w-full border ${
                          validationErrors.contactEmail ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {validationErrors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.contactEmail}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                        Contact Phone (optional)
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/community/events/${event.id}`}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips</h2>
              <ul className="space-y-4 text-sm text-gray-600">
                <li>
                  <strong className="block text-gray-900">Event Title</strong>
                  Make it clear and descriptive. Include key information like type of event or food being distributed.
                </li>
                <li>
                  <strong className="block text-gray-900">Description</strong>
                  Include important details like what to bring, requirements, and any special instructions.
                </li>
                <li>
                  <strong className="block text-gray-900">Location</strong>
                  For in-person events, provide clear directions and any parking information.
                </li>
                <li>
                  <strong className="block text-gray-900">Virtual Events</strong>
                  Include platform information and how attendees will receive access details.
                </li>
              </ul>
            </div>

            {/* Sidebar Ad */}
            <div className="mt-6">
              <SidebarAd />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 