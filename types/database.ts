import { Timestamp } from 'firebase/firestore'

// Base Types
export interface BaseDocument {
  id: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  status: 'active' | 'inactive' | 'deleted'
}

// User role types
export type UserRole = 'user' | 'provider' | 'admin' | 'superuser'

// Location status types
export type LocationStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type CurrentLocationStatus = 'open' | 'closed' | 'limited'

// Provider status types
export type ProviderStatus = 'pending' | 'approved' | 'suspended'

// Service types
export type ServiceType = 
  | 'food_pantry' 
  | 'soup_kitchen' 
  | 'food_bank' 
  | 'mobile_pantry' 
  | 'other'

// Update status types
export type UpdateStatus = 'open' | 'closed' | 'limited'

// Geographic coordinates
export interface Coordinates {
  latitude: number
  longitude: number
}

// Operating hours structure
export interface OperatingHours {
  monday?: { open: string; close: string; closed?: boolean }
  tuesday?: { open: string; close: string; closed?: boolean }
  wednesday?: { open: string; close: string; closed?: boolean }
  thursday?: { open: string; close: string; closed?: boolean }
  friday?: { open: string; close: string; closed?: boolean }
  saturday?: { open: string; close: string; closed?: boolean }
  sunday?: { open: string; close: string; closed?: boolean }
  specialHours?: Array<{
    date: string
    open?: string
    close?: string
    closed: boolean
    note?: string
  }>
}

// User profile information
export interface UserProfile {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  preferences?: {
    dietary?: string[]
    languages?: string[]
    familySize?: number
    hasTransportation?: boolean
    accessibilityNeeds?: string[]
  }
  savedLocations?: string[] // Array of location IDs
  notificationSettings?: {
    email: boolean
    sms: boolean
    push: boolean
    statusUpdates: boolean
    newLocations: boolean
  }
}

// User document structure
export interface User extends BaseDocument {
  email: string
  role: UserRole
  profile?: UserProfile
  isEmailVerified?: boolean
  lastLoginAt?: Timestamp | Date
  termsAcceptedAt?: Timestamp | Date
  privacyPolicyAcceptedAt?: Timestamp | Date
}

// Provider document structure
export interface Provider extends BaseDocument {
  organizationName: string
  contactPerson?: string
  email: string
  phone?: string
  website?: string
  description?: string
  address?: string
  servicesOffered?: string[]
  operatingHours?: OperatingHours
  isVerified: boolean
  status: ProviderStatus
  verificationNotes?: string
  adminNotes?: string
  locationIds?: string[] // Array of location IDs managed by this provider
  managedBy?: string // User ID of who manages this provider (for multiple orgs per user)
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
}

// Location document structure
export interface Location extends BaseDocument {
  name: string
  description?: string
  address: string
  coordinates: Coordinates
  providerId: string
  status: LocationStatus
  currentStatus?: CurrentLocationStatus
  operatingHours?: OperatingHours
  services?: string[] // Array of service IDs
  
  // Contact information
  phone?: string
  email?: string
  website?: string
  
  // Accessibility and features
  accessibilityFeatures?: string[]
  languages?: string[]
  dietaryOptions?: string[]
  ageRestrictions?: string
  eligibilityRequirements?: string[]
  
  // Capacity and availability
  capacity?: number
  currentCapacity?: number
  estimatedWaitTime?: number
  
  // Location details
  parkingAvailable?: boolean
  publicTransportNearby?: boolean
  deliveryAvailable?: boolean
  
  // Admin fields
  isVerified?: boolean
  verificationNotes?: string
  adminNotes?: string
  
  // Analytics
  totalVisits?: number
  averageRating?: number
  reviewCount?: number
  lastStatusUpdate?: Timestamp | Date
}

// Service document structure
export interface Service extends BaseDocument {
  name: string
  description?: string
  locationId: string
  type: ServiceType
  isActive: boolean
  
  // Schedule information
  schedule?: OperatingHours
  frequency?: string // e.g., "weekly", "monthly", "daily"
  
  // Capacity and requirements
  capacity?: number
  currentAvailability?: number
  eligibilityRequirements?: string[]
  ageRestrictions?: string
  
  // Service details
  foodTypes?: string[]
  dietaryOptions?: string[]
  languages?: string[]
  registrationRequired?: boolean
  appointmentRequired?: boolean
  
  // Contact and booking
  contactPhone?: string
  contactEmail?: string
  bookingUrl?: string
  
  // Admin fields
  adminNotes?: string
}

// Review document structure
export interface Review extends BaseDocument {
  userId: string
  locationId: string
  rating: number // 1-5 scale
  reviewText: string
  timestamp: Timestamp | Date
  comment?: string
  visitDate?: Timestamp | Date
  
  // Review details
  servicesUsed?: string[]
  wouldRecommend?: boolean
  waitTime?: number
  staffFriendliness?: number
  facilityQuality?: number
  
  // Moderation
  isModerated?: boolean
  isApproved?: boolean
  moderationStatus?: 'pending' | 'approved' | 'rejected'
  moderationNotes?: string
  moderatedBy?: string
  moderatedAt?: Timestamp | Date
  
  // Community feedback
  helpfulCount?: number
  helpfulVotes?: number
  reportCount?: number
  isReported?: boolean
  
  // Additional context
  firstTimeVisit?: boolean
  familySize?: number
  transportationUsed?: string
}

// Review submission data (for creating new reviews)
export interface ReviewSubmission {
  locationId: string
  userId: string
  rating: number
  reviewText: string
  timestamp: any // Firestore serverTimestamp
  isModerated: boolean
  isApproved: boolean
  helpfulCount: number
  reportCount: number
}

// Review filtering options
export interface ReviewFilter {
  sortBy?: 'timestamp' | 'rating' | 'helpfulCount'
  sortOrder?: 'asc' | 'desc'
  limitCount?: number
  minRating?: number
  maxRating?: number
}

// Update document structure (for real-time status updates)
export interface StatusUpdate extends BaseDocument {
  locationId: string
  status: UpdateStatus
  updatedBy: string // User ID of who made the update
  timestamp: Timestamp | Date
  
  // Update details
  notes?: string
  foodAvailable?: boolean
  estimatedWaitTime?: number
  capacity?: {
    current: number
    maximum: number
  }
  
  // Verification
  isVerified?: boolean
  verificationMethod?: 'provider' | 'community' | 'staff' | 'automated'
  
  // Location context
  serviceIds?: string[] // Which services this update applies to
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  expiresAt?: Timestamp | Date
  
  // Admin fields
  adminNotes?: string
  confidence?: number // 0-100 confidence in accuracy
}

// Analytics document structure
export interface Analytics extends BaseDocument {
  date: Timestamp | Date
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  
  // User metrics
  userCount: number
  newUsers: number
  activeUsers: number
  returningUsers: number
  
  // Location metrics
  locationCount: number
  activeLocations: number
  newLocations: number
  
  // Provider metrics
  providerCount: number
  verifiedProviders: number
  newProviders: number
  
  // Usage metrics
  searchCount: number
  locationViews: number
  statusUpdates: number
  reviewsSubmitted: number
  
  // Geographic data
  topZipCodes?: Array<{
    zipCode: string
    searchCount: number
    userCount: number
  }>
  
  // Popular locations
  topLocations?: Array<{
    locationId: string
    views: number
    rating: number
  }>
}

// Configuration document structure
export interface Config extends BaseDocument {
  // Feature flags
  maintenanceMode: boolean
  newUserRegistration: boolean
  providerRegistration: boolean
  reviewSubmission: boolean
  
  // Content limits
  maxReviewLength: number
  maxDescriptionLength: number
  maxNotesLength: number
  
  // Search settings
  defaultSearchRadius: number
  maxSearchRadius: number
  searchResultsLimit: number
  
  // Notification settings
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  
  // Moderation settings
  autoModerationEnabled: boolean
  reviewModerationRequired: boolean
  providerApprovalRequired: boolean
  
  // API settings
  googleMapsApiKey?: string
  maxApiRequestsPerMinute: number
  
  // Contact information
  supportEmail: string
  adminEmail: string
  feedbackUrl?: string
}

// Admin document structure
export interface Admin extends BaseDocument {
  email: string
  role: 'admin' | 'moderator' | 'super_admin'
  permissions: string[]
  isActive: boolean
  
  // Admin details
  firstName?: string
  lastName?: string
  department?: string
  
  // Activity tracking
  lastLoginAt?: Timestamp | Date
  actionsPerformed?: number
  
  // Contact
  phone?: string
  emergencyContact?: string
}

// Search result structure (for client-side use)
export interface LocationSearchResult {
  location: Location
  provider: Provider
  services: Service[]
  distance?: number
  estimatedTravelTime?: number
  currentStatus?: CurrentLocationStatus
  lastUpdated?: Timestamp | Date
  rating?: number
  reviewCount?: number
}

// Utility types for database operations
export type CreateLocationData = Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateLocationData = Partial<Omit<Location, 'id' | 'createdAt'>>

export type CreateProviderData = Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProviderData = Partial<Omit<Provider, 'id' | 'createdAt'>>

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt'>>

export type CreateReviewData = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateReviewData = Partial<Omit<Review, 'id' | 'createdAt'>>

export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateServiceData = Partial<Omit<Service, 'id' | 'createdAt'>>

export type CreateStatusUpdateData = Omit<StatusUpdate, 'id' | 'createdAt' | 'updatedAt'>

// Database error types
export interface DatabaseError {
  code: string
  message: string
  details?: any
}

// Query options for database operations
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: {
    field: string
    direction: 'asc' | 'desc'
  }[]
  where?: Array<{
    field: string
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains'
    value: any
  }>
}

// Real-time listener options
export interface ListenerOptions {
  includeMetadataChanges?: boolean
  source?: 'default' | 'server' | 'cache'
}

// Community Types
export interface ForumPost extends BaseDocument {
  title: string
  content: string
  authorId: string
  authorName: string
  category: 'general' | 'resources' | 'local' | 'support' | 'providers'
  tags?: string[]
  
  // Post status
  isPinned?: boolean
  isLocked?: boolean
  isModerated?: boolean
  status: 'active' | 'hidden' | 'deleted'
  
  // Engagement
  likes: number
  replies: number
  views: number
  lastActivity?: Timestamp | Date
  
  // Moderation
  moderatedBy?: string
  moderatedAt?: Timestamp | Date
  moderationReason?: string
  reportCount?: number
  
  // Location context
  locationId?: string
  zipCode?: string
}

export interface ForumReply extends BaseDocument {
  postId: string
  parentReplyId?: string // For nested replies
  content: string
  authorId: string
  authorName: string
  
  // Reply status
  isModerated?: boolean
  status: 'active' | 'hidden' | 'deleted'
  
  // Engagement
  likes: number
  reportCount?: number
  
  // Moderation
  moderatedBy?: string
  moderatedAt?: Timestamp | Date
  moderationReason?: string
}

export interface VolunteerOpportunity extends BaseDocument {
  title: string
  description: string
  organization: string
  organizationId?: string
  
  // Location and logistics
  location: string
  address?: string
  coordinates?: Coordinates
  isRemote?: boolean
  
  // Timing
  isOngoing: boolean
  startDate?: Timestamp | Date
  endDate?: Timestamp | Date
  schedule?: string
  timeCommitment?: string
  estimatedHours?: number
  
  // Requirements
  skills?: string[]
  requirements?: string[]
  ageRestriction?: string
  backgroundCheckRequired?: boolean
  trainingRequired?: boolean
  
  // Capacity
  spotsTotal?: number
  spotsAvailable?: number
  spotsRegistered?: number
  
  // Contact
  contactEmail: string
  contactPhone?: string
  applicationUrl?: string
  
  // Status and categorization
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  category: 'food_distribution' | 'kitchen_help' | 'delivery' | 'events' | 'admin' | 'other'
  
  // Meta
  isVerified?: boolean
  verifiedBy?: string
  createdBy: string
  tags?: string[]

  // Registrations
  registrations?: {
    [userId: string]: {
      registeredAt: Timestamp | Date
      status: 'pending' | 'approved' | 'declined'
      notes?: string
    }
  }
}

export interface CommunityEvent extends BaseDocument {
  title: string
  description: string
  organization: string
  organizationId?: string
  
  // Location
  location: string
  address?: string
  coordinates?: Coordinates
  isVirtual?: boolean
  
  // Timing
  startDate: Timestamp | Date
  endDate: Timestamp | Date
  timezone: string
  
  // Details
  type: 'workshop' | 'distribution' | 'fundraiser' | 'other'
  capacity?: number
  registrationRequired: boolean
  registrationUrl?: string
  cost?: number
  
  // Registration
  registered?: number
  availableSlots?: number
  
  // Contact
  contactEmail: string
  contactPhone?: string
  
  // Meta
  isVerified?: boolean
  verifiedBy?: string
  createdBy: string
  tags?: string[]
  eventStatus?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

export type CommunityResourceCategory = 
  | 'government' 
  | 'local' 
  | 'transportation' 
  | 'family' 
  | 'national' 
  | 'housing' 
  | 'healthcare' 
  | 'education'

export type CommunityResourceType = 
  | 'guide'
  | 'website'
  | 'document'
  | 'video'
  | 'contact'

export interface CommunityResource {
  id: string
  title: string
  description: string
  category: CommunityResourceCategory
  type: CommunityResourceType
  authorId: string
  authorName: string
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  status: 'active' | 'inactive' | 'deleted'
  views: number
  likes: number
  shares: number
  tags?: string[]
  externalUrl?: string
  phoneNumber?: string
  likedBy?: Record<string, boolean>
}

export type CreateCommunityResourceData = Omit<CommunityResource, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'shares' | 'status'>

export interface CommunityEngagement extends BaseDocument {
  userId: string
  targetId: string // ID of post, reply, resource, etc.
  targetType: 'post' | 'reply' | 'resource' | 'event' | 'opportunity'
  action: 'like' | 'save' | 'share' | 'report' | 'view'
  
  // Additional context
  value?: number // For ratings, etc.
  metadata?: Record<string, any>
}

// Community Statistics
export interface CommunityStats extends BaseDocument {
  date: Timestamp | Date
  period: 'daily' | 'weekly' | 'monthly'
  
  // Forum stats
  postsCount: number
  repliesCount: number
  activeUsers: number
  newUsers: number
  
  // Content stats
  resourcesShared: number
  eventsPosted: number
  opportunitiesPosted: number
  
  // Engagement stats
  totalViews: number
  totalLikes: number
  totalShares: number
  
  // Top content
  topPosts?: Array<{
    postId: string
    title: string
    views: number
    replies: number
  }>
  
  topResources?: Array<{
    resourceId: string
    title: string
    views: number
    likes: number
  }>
}

// Create/Update types for community features
export type CreateForumPostData = Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'replies' | 'views'>
export type UpdateForumPostData = Partial<Omit<ForumPost, 'id' | 'createdAt' | 'authorId'>>

export type CreateForumReplyData = Omit<ForumReply, 'id' | 'createdAt' | 'updatedAt' | 'likes'>
export type UpdateForumReplyData = Partial<Omit<ForumReply, 'id' | 'createdAt' | 'authorId' | 'postId'>>

export type CreateVolunteerOpportunityData = Omit<VolunteerOpportunity, keyof BaseDocument | 'registrations' | 'spotsRegistered' | 'spotsAvailable'>
export type UpdateVolunteerOpportunityData = Partial<Omit<VolunteerOpportunity, keyof BaseDocument | 'registrations' | 'spotsRegistered'>>

export type CreateCommunityEventData = Omit<CommunityEvent, keyof BaseDocument>
export type UpdateCommunityEventData = Partial<Omit<CommunityEvent, 'id' | 'createdAt'>>

export type UpdateCommunityResourceData = Partial<Omit<CommunityResource, 'id' | 'createdAt' | 'authorId'>> 