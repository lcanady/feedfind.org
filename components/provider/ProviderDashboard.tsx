'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'
import { ProviderService, LocationService, StatusUpdateService } from '../../lib/databaseService'
import { CommunityEventsService } from '../../lib/communityService'
import { useAuth } from '../../hooks/useAuth'
import type { Provider, Location, StatusUpdate, CurrentLocationStatus, CommunityEvent, OrganizationRole, OrganizationMember } from '../../types/database'
import { ProviderRegistrationForm } from './ProviderRegistrationForm'
import { VolunteerManagement } from './VolunteerManagement'
import Link from 'next/link'

export interface ProviderDashboardProps {
  providerId: string
  onLocationUpdate?: (locationId: string, data: Partial<Location>) => void
  onStatusUpdate?: (locationId: string, status: CurrentLocationStatus) => void
  className?: string
}

interface DashboardData {
  provider: Provider;
  locations: Location[];
  recentUpdates: StatusUpdate[];
}

interface OrganizationPermissions {
  canManageLocations: boolean;
  canUpdateStatus: boolean;
  canManageEvents: boolean;
  canManageResources: boolean;
  canManageVolunteers: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
}

interface LocationFormData {
  name: string
  address: string
  description: string
  capacity: number
  currentCapacity: number
}

interface LoadingStates {
  provider: boolean;
  locations: boolean;
  updates: boolean;
  events?: boolean;
}

interface LoadingErrors {
  provider?: string;
  locations?: string;
  updates?: string;
  events?: string;
}

interface MemberFormData {
  userId: string;
  role: OrganizationRole;
  addedAt: Date | Timestamp;
  addedBy: string;
  lastActive: Date | Timestamp;
  email?: string;
  status?: 'pending' | 'approved' | 'rejected';
  permissions: {
    canManageLocations: boolean;
    canUpdateStatus: boolean;
    canManageEvents: boolean;
    canManageResources: boolean;
    canManageVolunteers: boolean;
    canManageMembers: boolean;
    canManageSettings: boolean;
  };
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  providerId,
  onLocationUpdate,
  onStatusUpdate,
  className = ''
}) => {
  const { user, isProvider, isAdminOrSuperuser, getCurrentOrganizationRole, hasOrganizationPermission } = useAuth()
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    provider: true,
    locations: true,
    updates: true
  })
  const [loadingErrors, setLoadingErrors] = useState<LoadingErrors>({})
  const [error, setError] = useState<string>('')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'volunteers' | 'events' | 'members'>('overview')
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '' as CurrentLocationStatus | '',
    notes: '',
    estimatedWaitTime: '',
    foodAvailable: true
  })
  const [editForm, setEditForm] = useState<LocationFormData>({
    name: '',
    address: '',
    description: '',
    capacity: 0,
    currentCapacity: 0
  })
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [eventError, setEventError] = useState<string>('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [permissions, setPermissions] = useState<OrganizationPermissions | null>(null)
  const [members, setMembers] = useState<MemberFormData[]>([])
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberFormData | null>(null)
  const [memberForm, setMemberForm] = useState<MemberFormData>({
    userId: '',
    role: 'worker',
    addedAt: new Date(),
    addedBy: user?.uid || '',
    lastActive: new Date(),
    email: '',
    status: 'pending',
    permissions: {
      canManageLocations: false,
      canUpdateStatus: true,
      canManageEvents: true,
      canManageResources: true,
      canManageVolunteers: false,
      canManageMembers: false,
      canManageSettings: false
    }
  })

  // Services - memoized to prevent recreation on every render
  const providerService = useMemo(() => new ProviderService(), [])
  const locationService = useMemo(() => new LocationService(), [])
  const statusUpdateService = useMemo(() => new StatusUpdateService(), [])
  const communityEventsService = useMemo(() => new CommunityEventsService(), [])

  // Check access permissions
  const hasAccess = useCallback(() => {
    if (!user) return false
    
    // Allow access if user is admin/superuser or has any role in the organization
    return isAdminOrSuperuser || (data?.provider?.members?.[user.uid] !== undefined)
  }, [user, isAdminOrSuperuser, data?.provider])

  // Check if user can edit (providers can edit their own, admins/superusers can edit any)
  const canEdit = useCallback(async () => {
    if (!user) return false
    
    // Admins/superusers can edit anything
    if (isAdminOrSuperuser) return true

    // Check organization role and permissions
    const orgRole = getCurrentOrganizationRole()
    if (!orgRole) return false

    // Owners and admins can edit everything
    if (orgRole === 'owner' || orgRole === 'admin') return true

    // Workers need specific permissions
    return permissions?.canManageLocations || false
  }, [user, isAdminOrSuperuser, getCurrentOrganizationRole, permissions])

  // Check if user can update status
  const canUpdateStatus = useCallback(async () => {
    if (!user) return false
    
    // Admins/superusers can update any status
    if (isAdminOrSuperuser) return true

    // Check organization role and permissions
    const orgRole = getCurrentOrganizationRole()
    if (!orgRole) return false

    // Owners and admins can update status
    if (orgRole === 'owner' || orgRole === 'admin') return true

    // Workers need specific permissions
    return permissions?.canUpdateStatus || false
  }, [user, isAdminOrSuperuser, getCurrentOrganizationRole, permissions])

  // Check if user can manage events
  const canManageEvents = useCallback(async () => {
    if (!user) return false
    
    // Admins/superusers can manage any events
    if (isAdminOrSuperuser) return true

    // Check organization role and permissions
    const orgRole = getCurrentOrganizationRole()
    if (!orgRole) return false

    // Owners and admins can manage events
    if (orgRole === 'owner' || orgRole === 'admin') return true

    // Workers need specific permissions
    return permissions?.canManageEvents || false
  }, [user, isAdminOrSuperuser, getCurrentOrganizationRole, permissions])

  // Check if this is an admin view (admin/superuser viewing another provider's dashboard)
  const isAdminView = useCallback(() => {
    return isAdminOrSuperuser && user?.uid !== providerId
  }, [isAdminOrSuperuser, user?.uid, providerId])

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setError('')
      setLoadingErrors({})
      setShowRegistrationForm(false)

      // Check access first
      if (!user) {
        throw new Error('You must be logged in to view this dashboard.')
      }

      // Load provider data
      let provider: Provider | null = null
      try {
        setLoadingStates(prev => ({ ...prev, provider: true }))
        provider = await providerService.getById(providerId)
        setLoadingStates(prev => ({ ...prev, provider: false }))

        // Set permissions based on organization role
        if (provider) {
          const member = provider.members?.[user.uid]
          if (member) {
            setPermissions(member.permissions || {
              canManageLocations: member.role === 'owner' || member.role === 'admin',
              canUpdateStatus: true, // All members can update status
              canManageEvents: true, // All members can manage events
              canManageResources: true, // All members can manage resources
              canManageVolunteers: member.role === 'owner' || member.role === 'admin',
              canManageMembers: member.role === 'owner' || member.role === 'admin',
              canManageSettings: member.role === 'owner'
            })
          } else if (isAdminOrSuperuser) {
            // Admins have all permissions
            setPermissions({
              canManageLocations: true,
              canUpdateStatus: true,
              canManageEvents: true,
              canManageResources: true,
              canManageVolunteers: true,
              canManageMembers: true,
              canManageSettings: true
            })
          } else {
            setPermissions(null)
          }
        }
      } catch (err) {
        setLoadingStates(prev => ({ ...prev, provider: false }))
        setLoadingErrors(prev => ({ ...prev, provider: err instanceof Error ? err.message : 'Failed to load provider data' }))
        throw err
      }
      
      if (!provider) {
        if (isProvider && user?.uid === providerId && !isAdminOrSuperuser) {
          setShowRegistrationForm(true)
          return
        }
        
        if (isAdminOrSuperuser) {
          throw new Error(`Provider with ID "${providerId}" not found in the database. Please verify the provider ID is correct.`)
        } else {
          throw new Error('Provider profile not found. You may need to complete your provider registration or your account may be pending approval.')
        }
      }

      // Initialize dashboard data
      const dashboardData: DashboardData = {
        provider,
        locations: [],
        recentUpdates: []
      }

      // Load locations with error handling
      try {
        setLoadingStates(prev => ({ ...prev, locations: true }))
        const locationsResult = await locationService.getByProviderId(providerId)
        if (Array.isArray(locationsResult)) {
          dashboardData.locations = locationsResult
        }
        setLoadingStates(prev => ({ ...prev, locations: false }))
      } catch (err) {
        setLoadingStates(prev => ({ ...prev, locations: false }))
        setLoadingErrors(prev => ({ ...prev, locations: err instanceof Error ? err.message : 'Failed to load locations' }))
        console.error('Failed to load locations:', err)
      }
      
      // Load recent updates with error handling
      try {
        setLoadingStates(prev => ({ ...prev, updates: true }))
        const updatesResult = await statusUpdateService.getRecentByProviderId(providerId)
        if (Array.isArray(updatesResult)) {
          dashboardData.recentUpdates = updatesResult
        }
        setLoadingStates(prev => ({ ...prev, updates: false }))
      } catch (err) {
        setLoadingStates(prev => ({ ...prev, updates: false }))
        setLoadingErrors(prev => ({ ...prev, updates: err instanceof Error ? err.message : 'Failed to load status updates' }))
        console.error('Failed to load status updates:', err)
      }

      // Set the complete dashboard data
      setData(dashboardData)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      setLoadingStates({
        provider: false,
        locations: false,
        updates: false
      })
    }
  }, [providerId, providerService, locationService, statusUpdateService, isProvider, user?.uid, isAdminOrSuperuser])

  // Load events when events tab is active
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (activeTab === 'events') {
      const loadEvents = async () => {
        setLoadingEvents(true)
        setEventError('')
        try {
          unsubscribe = communityEventsService.subscribeToEvents((updatedEvents) => {
            // Filter events for this provider
            const providerEvents = updatedEvents.filter(event => event.organizationId === providerId)
            setEvents(providerEvents)
            setLoadingEvents(false)
          })
        } catch (err) {
          console.error('Failed to load events:', err)
          setEventError(err instanceof Error ? err.message : 'Failed to load events')
          setLoadingEvents(false)
        }
      }

      loadEvents()
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [activeTab, providerId, communityEventsService])

  // Load members when the members tab is active
  useEffect(() => {
    if (activeTab === 'members' && data?.provider?.members) {
      const membersList = Object.entries(data.provider.members).map(([userId, member]) => ({
        ...member,
        userId,
        lastActive: member.lastActive || new Date(),
        status: 'approved' as const,
        permissions: member.permissions || {
          canManageLocations: member.role === 'owner' || member.role === 'admin',
          canUpdateStatus: true,
          canManageEvents: true,
          canManageResources: true,
          canManageVolunteers: member.role === 'owner' || member.role === 'admin',
          canManageMembers: member.role === 'owner' || member.role === 'admin',
          canManageSettings: member.role === 'owner'
        }
      }))
      setMembers(membersList)
    }
  }, [activeTab, data?.provider?.members])

  // Handle provider creation
  const handleProviderCreated = useCallback((newProvider: Provider) => {
    const newData: DashboardData = {
      provider: newProvider,
      locations: [],
      recentUpdates: []
    }
    setData(newData)
    setShowRegistrationForm(false)
    setError('')
    
    // Reload data to get locations
    setTimeout(() => {
      loadDashboardData()
    }, 0)
  }, [loadDashboardData])

  // Handle registration form cancel
  const handleRegistrationCancel = useCallback(() => {
    setShowRegistrationForm(false)
    // Redirect to home or show appropriate message
    window.location.href = '/'
  }, [])

  // Initial data load
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Status update handler
  const handleStatusUpdate = async (locationId: string, status: CurrentLocationStatus, notes?: string) => {
    const canUpdate = await canUpdateStatus()
    if (!canUpdate) {
      setError('You do not have permission to update location status.')
      return
    }

    try {
      const updateData: any = {
        status,
        notes: notes || statusUpdateForm.notes,
        foodAvailable: statusUpdateForm.foodAvailable,
        updatedBy: user?.uid || '',
        timestamp: new Date()
      }

      // Only include estimatedWaitTime if it's a valid number
      if (statusUpdateForm.estimatedWaitTime && statusUpdateForm.estimatedWaitTime.trim() !== '') {
        updateData.estimatedWaitTime = parseInt(statusUpdateForm.estimatedWaitTime)
      }

      await statusUpdateService.updateLocationStatus(locationId, updateData)

      // Callback to parent
      if (onStatusUpdate) {
        onStatusUpdate(locationId, status)
      }

      // Reload data
      await loadDashboardData()
      setShowStatusModal(false)
      setStatusUpdateForm({
        status: '',
        notes: '',
        estimatedWaitTime: '',
        foodAvailable: true
      })

      // Announce success to screen readers
      const announcement = `Status updated to ${status} for location`
      const ariaLive = document.createElement('div')
      ariaLive.setAttribute('aria-live', 'polite')
      ariaLive.setAttribute('aria-atomic', 'true')
      ariaLive.className = 'sr-only'
      ariaLive.textContent = announcement
      document.body.appendChild(ariaLive)
      setTimeout(() => document.body.removeChild(ariaLive), 1000)
    } catch (err) {
      console.error('Failed to update status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  // Bulk status update handler
  const handleBulkStatusUpdate = async (status: CurrentLocationStatus, locationIds: string[]) => {
    const canUpdate = await canUpdateStatus()
    if (!canUpdate) {
      setError('You do not have permission to update location status.')
      return
    }

    try {
      const updateData: any = {
        status,
        notes: statusUpdateForm.notes,
        updatedBy: user?.uid || '',
        timestamp: new Date()
      }

      // Only include estimatedWaitTime if it's a valid number
      if (statusUpdateForm.estimatedWaitTime && statusUpdateForm.estimatedWaitTime.trim() !== '') {
        updateData.estimatedWaitTime = parseInt(statusUpdateForm.estimatedWaitTime)
      }

      for (const locationId of locationIds) {
        await statusUpdateService.updateLocationStatus(locationId, updateData)
      }

      await loadDashboardData()
      setShowBulkUpdateModal(false)
      setSelectedLocations([])
      setStatusUpdateForm({
        status: '',
        notes: '',
        estimatedWaitTime: '',
        foodAvailable: true
      })
    } catch (err) {
      console.error('Failed to bulk update status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update statuses')
    }
  }

  // Location edit handler
  const handleLocationEdit = async (locationId: string, updates: Partial<Location>) => {
    const canEditLocation = await canEdit()
    if (!canEditLocation) {
      setError('You do not have permission to edit location details.')
      return
    }

    try {
      await locationService.update('locations', locationId, updates)

      if (onLocationUpdate) {
        onLocationUpdate(locationId, updates)
      }

      await loadDashboardData()
      setShowEditModal(false)
      setSelectedLocation(null)
    } catch (err) {
      console.error('Failed to update location:', err)
      setError(err instanceof Error ? err.message : 'Failed to update location')
    }
  }

  // Open edit modal
  const openEditModal = (location: Location) => {
    setSelectedLocation(location)
    setEditForm({
      name: location.name,
      address: location.address,
      description: location.description || '',
      capacity: location.capacity || 0,
      currentCapacity: location.currentCapacity || 0
    })
    setShowEditModal(true)
  }

  // Open status modal
  const openStatusModal = (location: Location) => {
    setSelectedLocation(location)
    setStatusUpdateForm({
      status: location.currentStatus || '',
      notes: '',
      estimatedWaitTime: location.estimatedWaitTime?.toString() || '',
      foodAvailable: true // Default value since this is for status updates, not location
    })
    setShowStatusModal(true)
  }

  // Handle checkbox selection for bulk operations
  const handleLocationSelect = (locationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations(prev => [...prev, locationId])
    } else {
      setSelectedLocations(prev => prev.filter(id => id !== locationId))
    }
  }

  // Retry function
  const handleRetry = () => {
    setError('')
    loadDashboardData()
  }

  // Status counts
  const statusCounts = data?.locations.reduce((acc, location) => {
    const status = location.currentStatus || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleDateString()
  }

  const formatTime = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  // Update loading indicator in render
  const isLoading = Object.values(loadingStates).some(Boolean)
  const isInitialLoad = Object.values(loadingStates).every(Boolean)

  // Handle member update
  const handleMemberUpdate = async (memberId: string, updates: Partial<MemberFormData>) => {
    try {
      if (!data?.provider) return

      const canManage = await canEdit()
      if (!canManage) {
        setError('You do not have permission to manage members')
        return
      }

      // Update member in provider document
      await providerService.updateProvider(providerId, {
        [`members.${memberId}`]: {
          ...data.provider.members?.[memberId],
          ...updates,
          updatedAt: new Date()
        }
      })

      // Reload dashboard data
      await loadDashboardData()
      setShowMemberModal(false)
      setSelectedMember(null)
      setError('Member updated successfully')
    } catch (err) {
      console.error('Failed to update member:', err)
      setError('Failed to update member')
    }
  }

  // Handle new member invitation
  const handleMemberInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const canManage = await canEdit()
      if (!canManage) {
        setError('You do not have permission to manage members')
        return
      }

      // Add new member to provider document
      await providerService.updateProvider(providerId, {
        [`members.temp_${Date.now()}`]: {
          email: memberForm.email,
          role: memberForm.role,
          status: 'pending',
          addedAt: new Date(),
          addedBy: user?.uid,
          permissions: memberForm.permissions
        }
      })

      // Reload dashboard data
      await loadDashboardData()
      setShowMemberModal(false)
      setMemberForm({
        userId: '',
        email: '',
        role: 'worker',
        addedAt: new Date(),
        addedBy: user?.uid || '',
        lastActive: new Date(),
        status: 'pending',
        permissions: {
          canManageLocations: false,
          canUpdateStatus: true,
          canManageEvents: true,
          canManageResources: true,
          canManageVolunteers: false,
          canManageMembers: false,
          canManageSettings: false
        }
      })
      setError('Member invited successfully')
    } catch (err) {
      console.error('Failed to invite member:', err)
      setError('Failed to invite member')
    }
  }

  const handleAddMember = () => {
    const newMemberForm: MemberFormData = {
      userId: '',
      role: 'worker',
      addedAt: new Date(),
      addedBy: user?.uid || '',
      lastActive: new Date(),
      email: '',
      status: 'pending',
      permissions: {
        canManageLocations: false,
        canUpdateStatus: true,
        canManageEvents: true,
        canManageResources: true,
        canManageVolunteers: false,
        canManageMembers: false,
        canManageSettings: false
      }
    }
    setMemberForm(newMemberForm)
    setShowMemberModal(true)
  }

  const handleEditMember = (member: MemberFormData) => {
    setSelectedMember(member)
    setMemberForm(member)
    setShowMemberModal(true)
  }

  const handleSaveMember = async () => {
    try {
      if (!data?.provider) return

      const updatedMembers = { ...data.provider.members }
      
      if (memberForm.userId) {
        updatedMembers[memberForm.userId] = {
          userId: memberForm.userId,
          role: memberForm.role,
          addedAt: memberForm.addedAt,
          addedBy: memberForm.addedBy,
          lastActive: memberForm.lastActive,
          permissions: memberForm.permissions
        }
      }

      await providerService.update('providers', providerId, {
        members: updatedMembers
      })

      setShowMemberModal(false)
      setSelectedMember(null)
      const resetForm: MemberFormData = {
        userId: '',
        role: 'worker',
        addedAt: new Date(),
        addedBy: user?.uid || '',
        lastActive: new Date(),
        email: '',
        status: 'pending',
        permissions: {
          canManageLocations: false,
          canUpdateStatus: true,
          canManageEvents: true,
          canManageResources: true,
          canManageVolunteers: false,
          canManageMembers: false,
          canManageSettings: false
        }
      }
      setMemberForm(resetForm)
    } catch (error) {
      console.error('Error saving member:', error)
      setError('Failed to save member')
    }
  }

  const handleUpdatePermission = (permission: keyof MemberFormData['permissions'], value: boolean) => {
    setMemberForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  if (isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
        <div className="mt-2 text-sm text-gray-500">
          {loadingStates.provider && <p>Loading provider information...</p>}
          {loadingStates.locations && <p>Loading location data...</p>}
          {loadingStates.updates && <p>Loading status updates...</p>}
        </div>
      </div>
    )
  }

  // Show registration form if provider doesn't exist and user should create one
  if (showRegistrationForm) {
    return (
      <div className={className}>
        <ProviderRegistrationForm
          onProviderCreated={handleProviderCreated}
          onCancel={handleRegistrationCancel}
        />
      </div>
    )
  }

  if (error) {
    const isProviderNotFoundError = error.includes('Provider profile not found') || error.includes('Provider with ID')
    
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {isProviderNotFoundError ? 'Provider Profile Not Found' : 'Error Loading Dashboard'}
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 mr-3"
            >
              Try Again
            </button>
            
            {isProviderNotFoundError && !isAdminOrSuperuser && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Need to register as a provider?</h4>
                <p className="text-sm text-blue-800 mb-4">
                  If you're a food assistance organization, you can register to create your provider profile.
                </p>
                <a 
                  href="/add-organization" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register as Provider
                </a>
              </div>
            )}
            
            {isProviderNotFoundError && !isAdminOrSuperuser && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Already registered?</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Your provider account may still be pending approval.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Support Email:</strong> support@feedfind.org</p>
                  <p><strong>Support Phone:</strong> (555) 123-FEED</p>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <a 
                href="/" 
                className="text-blue-600 hover:underline text-sm"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data?.provider) {
    return (
      <div className={className}>
        <div className="text-center text-gray-500">
          <p>Provider not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Provider Dashboard
          {isAdminView() && (
            <span className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              Admin View
            </span>
          )}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{data.provider.organizationName}</h2>
            <p className="text-gray-600">{data.provider.contactPerson}</p>
            <p className="text-gray-600">{data.provider.email}</p>
            {data.provider.phone && (
              <p className="text-gray-600">{data.provider.phone}</p>
            )}
            <div className="mt-2 flex items-center space-x-3">
              {data.provider.isVerified ? (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  Pending Verification
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                data.provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                data.provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.provider.status}
              </span>
            </div>
            {isAdminView() && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Admin Note:</strong> You are viewing this dashboard as an administrator. 
                  You have full access to view and manage this provider's information.
                </p>
                {data.provider.adminNotes && (
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>Admin Notes:</strong> {data.provider.adminNotes}
                  </p>
                )}
              </div>
            )}
            {getCurrentOrganizationRole() && (
              <span className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Role: {getCurrentOrganizationRole()}
              </span>
            )}
          </div>
          {isAdminView() && (
            <div className="flex flex-col space-y-2 mt-4 sm:mt-0">
              <span className="text-sm text-gray-500">Provider ID: {providerId}</span>
              <span className="text-sm text-gray-500">
                Created: {data.provider.createdAt instanceof Date 
                  ? data.provider.createdAt.toLocaleDateString()
                  : new Date(data.provider.createdAt.toMillis()).toLocaleDateString()
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Warning Banner */}
      {isAdminView() && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-amber-800">Administrator Access</h3>
              <p className="text-sm text-amber-700">
                You are viewing this provider dashboard with administrative privileges. 
                Any changes you make will be logged and attributed to your admin account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Dashboard Navigation">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          {(permissions?.canManageLocations || isAdminOrSuperuser) && (
            <button
              onClick={() => setActiveTab('locations')}
              className={`${
                activeTab === 'locations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Locations
            </button>
          )}
          {(permissions?.canManageVolunteers || isAdminOrSuperuser) && (
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`${
                activeTab === 'volunteers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Volunteers
            </button>
          )}
          {(permissions?.canManageEvents || isAdminOrSuperuser) && (
            <button
              onClick={() => setActiveTab('events')}
              className={`${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Events
            </button>
          )}
          {(permissions?.canManageMembers || isAdminOrSuperuser) && (
            <button
              onClick={() => setActiveTab('members')}
              className={`${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Members
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Locations</h3>
              <p className="text-3xl font-bold text-gray-900">{data.locations.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Open Locations</h3>
              <p className="text-3xl font-bold text-green-600">{statusCounts.open || 0}</p>
              <p className="text-sm text-gray-500">{statusCounts.open || 0} open</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Limited Locations</h3>
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.limited || 0}</p>
              <p className="text-sm text-gray-500">{statusCounts.limited || 0} limited</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500">Closed Locations</h3>
              <p className="text-3xl font-bold text-red-600">{statusCounts.closed || 0}</p>
              <p className="text-sm text-gray-500">{statusCounts.closed || 0} closed</p>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
            {data.recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {data.recentUpdates.slice(0, 5).map((update, index) => {
                  // Find the location name from the locations array
                  const location = data.locations.find(loc => loc.id === update.locationId)
                  const locationName = location?.name || 'Unknown Location'
                  
                  return (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <p className="font-medium text-gray-900">{locationName}</p>
                        <p className="text-sm text-gray-600">{update.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          update.status === 'open' ? 'bg-green-100 text-green-800' :
                          update.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {update.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {update.timestamp instanceof Date 
                            ? update.timestamp.toLocaleDateString()
                            : new Date(update.timestamp.toMillis()).toLocaleDateString()
                          }
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">No recent updates</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'locations' && (permissions?.canManageLocations || isAdminOrSuperuser) && (
        <div>
          {/* Bulk Actions */}
          {selectedLocations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {selectedLocations.length} location(s) selected
                </p>
                <button
                  onClick={() => setShowBulkUpdateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Bulk update selected locations"
                  disabled={!canEdit()}
                >
                  {isAdminView() ? 'Admin Bulk Update' : 'Bulk Update'}
                </button>
              </div>
            </div>
          )}

          {/* Locations List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {data.locations.map((location) => (
                <div key={location.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location.id)}
                        onChange={(e) => handleLocationSelect(location.id, e.target.checked)}
                        className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Select ${location.name}`}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{location.name}</h4>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            location.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                            location.currentStatus === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            🟢 {location.currentStatus || 'Unknown'}
                          </span>
                          {location.capacity && location.currentCapacity !== undefined && (
                            <span className="text-sm text-gray-500">
                              {location.currentCapacity}/{location.capacity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openStatusModal(location)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Update status for ${location.name}`}
                        disabled={!canEdit()}
                      >
                        {isAdminView() ? 'Admin Update Status' : 'Update Status'}
                      </button>
                      <button
                        onClick={() => openEditModal(location)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-label={`Edit location details for ${location.name}`}
                        disabled={!canEdit()}
                      >
                        {isAdminView() ? 'Admin Edit' : 'Edit Location'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'volunteers' && (permissions?.canManageVolunteers || isAdminOrSuperuser) && (
        <VolunteerManagement providerId={providerId} />
      )}

      {activeTab === 'events' && (permissions?.canManageEvents || isAdminOrSuperuser) && (
        <div>
          {/* Events Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Events</h2>
            <Link
              href="/community/events/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Event
            </Link>
          </div>

          {/* Events List */}
          {loadingEvents ? (
            <div className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ) : eventError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{eventError}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
              <Link
                href="/community/events/new"
                className="text-blue-600 hover:text-blue-800"
              >
                Create your first event →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(event.startDate)}<br />
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </p>
                        </div>
                        {!event.isVirtual && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Location</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {event.location}
                              {event.address && <br />}
                              {event.address}
                            </p>
                          </div>
                        )}
                        {event.isVirtual && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Event Type</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              Virtual Event
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.eventStatus === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.eventStatus === 'ongoing' ? 'bg-green-100 text-green-800' :
                          event.eventStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.eventStatus}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/community/events/${event.id}`}
                        prefetch={false}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (permissions?.canManageMembers || isAdminOrSuperuser) && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Organization Members</h2>
            <button
              onClick={() => setShowMemberModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Member
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {members.map((member) => (
                <li key={member.userId} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.email}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'approved' ? 'bg-green-100 text-green-800' :
                          member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedMember(member)
                          setShowMemberModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        disabled={member.role === 'owner' && getCurrentOrganizationRole() !== 'owner'}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedLocation && (canUpdateStatus() || isAdminOrSuperuser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isAdminView() ? 'Admin Update Status' : 'Update Status'}: {selectedLocation.name}
            </h3>
            {isAdminView() && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-800">
                  ⚠️ You are making changes as an administrator. This action will be logged.
                </p>
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault()
              if (statusUpdateForm.status) {
                handleStatusUpdate(selectedLocation.id, statusUpdateForm.status as CurrentLocationStatus, statusUpdateForm.notes)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    value={statusUpdateForm.status}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, status: e.target.value as CurrentLocationStatus }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="open">Open</option>
                    <option value="limited">Limited</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="notes"
                    value={statusUpdateForm.notes}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional notes about the status update"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!statusUpdateForm.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditModal && selectedLocation && (permissions?.canManageLocations || isAdminOrSuperuser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Location: {selectedLocation.name}</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleLocationEdit(selectedLocation.id, {
                name: editForm.name,
                address: editForm.address,
                description: editForm.description,
                capacity: editForm.capacity,
                currentCapacity: editForm.currentCapacity
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    id="locationName"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    id="address"
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                      id="capacity"
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="currentCapacity" className="block text-sm font-medium text-gray-700">Current</label>
                    <input
                      id="currentCapacity"
                      type="number"
                      value={editForm.currentCapacity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, currentCapacity: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (canUpdateStatus() || isAdminOrSuperuser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Bulk Update Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update status for {selectedLocations.length} selected location(s)
            </p>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (statusUpdateForm.status) {
                handleBulkStatusUpdate(statusUpdateForm.status as CurrentLocationStatus, selectedLocations)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bulkStatus" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="bulkStatus"
                    value={statusUpdateForm.status}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, status: e.target.value as CurrentLocationStatus }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="open">Open</option>
                    <option value="limited">Limited</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bulkNotes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="bulkNotes"
                    value={statusUpdateForm.notes}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional notes for all selected locations"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUpdateModal(false)
                    setSelectedLocations([])
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!statusUpdateForm.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300"
                >
                  Update All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {selectedMember ? 'Edit Member' : 'Invite New Member'}
            </h3>
            <form onSubmit={selectedMember ? 
              (e) => {
                e.preventDefault()
                handleSaveMember()
              } : 
              handleMemberInvite
            }>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={!!selectedMember}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    value={memberForm.role}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, role: e.target.value as OrganizationRole }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={selectedMember?.role === 'owner' && getCurrentOrganizationRole() !== 'owner'}
                  >
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                    {getCurrentOrganizationRole() === 'owner' && (
                      <option value="owner">Owner</option>
                    )}
                  </select>
                </div>
                {selectedMember && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="status"
                      value={memberForm.status}
                      onChange={(e) => setMemberForm(prev => ({ 
                        ...prev, 
                        status: e.target.value as 'pending' | 'approved' | 'rejected'
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
                {memberForm.role === 'worker' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.permissions.canManageLocations}
                          onChange={(e) => setMemberForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canManageLocations: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Manage Locations</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.permissions.canUpdateStatus}
                          onChange={(e) => setMemberForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canUpdateStatus: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Update Status</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.permissions.canManageEvents}
                          onChange={(e) => setMemberForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canManageEvents: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Manage Events</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.permissions.canManageResources}
                          onChange={(e) => setMemberForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canManageResources: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Manage Resources</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.permissions.canManageVolunteers}
                          onChange={(e) => setMemberForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canManageVolunteers: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Manage Volunteers</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.permissions.canManageMembers}
                          onChange={(e) => setMemberForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canManageMembers: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Manage Members</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberModal(false)
                    setSelectedMember(null)
                    setMemberForm({
                      userId: '',
                      email: '',
                      role: 'worker',
                      addedAt: new Date(),
                      addedBy: user?.uid || '',
                      lastActive: new Date(),
                      status: 'pending',
                      permissions: {
                        canManageLocations: false,
                        canUpdateStatus: true,
                        canManageEvents: true,
                        canManageResources: true,
                        canManageVolunteers: false,
                        canManageMembers: false,
                        canManageSettings: false
                      }
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedMember ? 'Save Changes' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard 