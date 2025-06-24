// @ts-nocheck
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  Unsubscribe,
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  BaseDocument,
  Location,
  Provider,
  User,
  Review,
  StatusUpdate,
  Service,
  CreateLocationData,
  CreateProviderData,
  CreateUserData,
  CreateReviewData,
  CreateStatusUpdateData,
  CreateServiceData,
  UpdateLocationData,
  UpdateProviderData,
  UpdateUserData,
  UpdateReviewData,
  UpdateServiceData,
  QueryOptions,
  ListenerOptions,
  DatabaseError,
  Coordinates,
  CurrentLocationStatus,
  UpdateStatus,
  LocationSearchResult,
  VolunteerOpportunity
} from '../types/database'
import { validateZipCode, calculateDistance, coordinatesToLatLng, geocodeZipCode, filterLocationsByDistance } from './locationService'

// Base Database Service Class
export class DatabaseService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Generic CRUD Operations
  async create<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Promise<DocumentReference> {
    try {
      this.validateData(data)
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async set<T extends DocumentData>(
    collectionName: string,
    id: string,
    data: T
  ): Promise<void> {
    try {
      this.validateData(data)
      const docRef = doc(db, collectionName, id)
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Invalidate cache
      this.cache.delete(`${collectionName}:${id}`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async get(collectionName: string, id: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      }
      return null
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getWithCache(collectionName: string, id: string): Promise<DocumentData | null> {
    const cacheKey = `${collectionName}:${id}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    const data = await this.get(collectionName, id)
    
    if (data) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
    }
    
    return data
  }

  async getWithRetry(
    collectionName: string, 
    id: string, 
    maxRetries: number = 3
  ): Promise<DocumentData | null> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.get(collectionName, id)
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError!
  }

  async update(
    collectionName: string,
    id: string,
    data: Partial<DocumentData>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      
      // Invalidate cache
      this.cache.delete(`${collectionName}:${id}`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
      
      // Invalidate cache
      this.cache.delete(`${collectionName}:${id}`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async list(
    collectionName: string,
    options?: QueryOptions
  ): Promise<{
    docs: QueryDocumentSnapshot<DocumentData>[]
    hasMore: boolean
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  }> {
    try {
      const constraints: QueryConstraint[] = []

      if (options?.where) {
        options.where.forEach(condition => {
          constraints.push(where(condition.field, condition.operator, condition.value))
        })
      }

      if (options?.orderBy) {
        options.orderBy.forEach(sort => {
          constraints.push(orderBy(sort.field, sort.direction))
        })
      }

      if (options?.limit) {
        constraints.push(limit(options.limit))
      }

      if (options?.offset) {
        // For offset-based pagination, we need to use startAfter
        // This is a simplified implementation
        constraints.push(limit((options.offset || 0) + (options.limit || 10)))
      }

      const q = query(collection(db, collectionName), ...constraints)
      const querySnapshot = await getDocs(q)
      
      let docs = querySnapshot.docs
      
      // Handle offset by slicing results (not efficient for large offsets)
      if (options?.offset) {
        docs = docs.slice(options.offset)
      }

      const hasMore = docs.length === (options?.limit || 10)
      const lastDoc = docs.length > 0 ? docs[docs.length - 1] : undefined

      return { docs, hasMore, lastDoc }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Real-time listeners
  subscribe(
    collectionName: string,
    id: string,
    callback: (data: DocumentData | null) => void,
    options?: ListenerOptions
  ): Unsubscribe {
    const docRef = doc(db, collectionName, id)
    
    return onSnapshot(
      docRef,
      { includeMetadataChanges: options?.includeMetadataChanges },
      (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          })
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error(`Subscription error for ${collectionName}/${id}:`, error)
        callback(null)
      }
    )
  }

  // Batch operations
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete'
    collection: string
    id?: string
    data?: any
  }>): Promise<void> {
    const batch = writeBatch(db)

    operations.forEach(op => {
      switch (op.type) {
        case 'create':
          const createRef = doc(collection(db, op.collection))
          batch.set(createRef, {
            ...op.data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          break

        case 'update':
          if (!op.id) throw new Error('ID required for update operation')
          const updateRef = doc(db, op.collection, op.id)
          batch.update(updateRef, {
            ...op.data,
            updatedAt: serverTimestamp()
          })
          break

        case 'delete':
          if (!op.id) throw new Error('ID required for delete operation')
          const deleteRef = doc(db, op.collection, op.id)
          batch.delete(deleteRef)
          break
      }
    })

    await batch.commit()
  }

  // Transaction support
  async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    return await runTransaction(db, updateFunction)
  }

  // Error handling
  private handleError(error: any): DatabaseError {
    console.error('Database error:', error)

    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          return {
            code: 'PERMISSION_DENIED',
            message: 'Permission denied: Insufficient permissions',
            details: error
          }
        case 'not-found':
          return {
            code: 'NOT_FOUND',
            message: 'Document not found',
            details: error
          }
        case 'unavailable':
        case 'deadline-exceeded':
          return {
            code: 'NETWORK_ERROR',
            message: 'Network error: Please check your connection',
            details: error
          }
        case 'invalid-argument':
          return {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed: Invalid data provided',
            details: error
          }
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'An unknown error occurred',
            details: error
          }
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error
    }
  }

  // Data validation
  private validateData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Validation failed: Data must be an object')
    }

    // Add specific validation logic here
    // This is a placeholder for more comprehensive validation
  }
}

// Location Service
export class LocationService extends DatabaseService {
  async createLocation(data: CreateLocationData): Promise<Location> {
    this.validateLocationData(data)
    
    const docRef = await super.create('locations', data)
    const created = await this.get('locations', docRef.id)
    return created as Location
  }

  async getById(locationId: string): Promise<Location | null> {
    try {
      const location = await super.get('locations', locationId)
      return location as Location | null
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getByProviderId(providerId: string): Promise<Location[]> {
    const results = await this.list('locations', {
      where: [{ field: 'providerId', operator: '==', value: providerId }]
    })

    return results.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Location[]
  }

  async updateStatus(
    locationId: string,
    status: CurrentLocationStatus,
    updatedBy: string,
    notes?: string
  ): Promise<Partial<Location>> {
    const updateData = {
      currentStatus: status,
      lastStatusUpdate: serverTimestamp(),
      updatedBy
    }

    await super.update('locations', locationId, updateData)

    // Create status update record
    const statusUpdateService = new StatusUpdateService()
    await statusUpdateService.create({
      locationId,
      status: status as UpdateStatus,
      updatedBy,
      timestamp: new Date(),
      notes
    })

    return {
      currentStatus: status,
      lastStatusUpdate: new Date()
    }
  }

  async searchByCoordinates(
    coordinates: Coordinates,
    radiusKm: number
  ): Promise<Array<Location & { distance: number }>> {
    try {
      // Convert radius from km to miles since calculateDistance returns miles
      const radiusMiles = radiusKm * 0.621371;

      // Get all locations (not just active ones for now)
      const results = await this.list('locations', {
        where: [] // Remove active-only filter temporarily for debugging
      });

      if (results.docs.length === 0) {
        console.log('No locations found in database');
        return [];
      }

      console.log(`Found ${results.docs.length} total locations`);

      const locationsWithDistance = results.docs
        .map(doc => {
          const docData = doc.data();
          const distance = calculateDistance(
            coordinatesToLatLng(coordinates),
            coordinatesToLatLng(docData.coordinates)
          );

          // Log each location's distance for debugging
          console.log(`Location ${docData.name}: ${distance.toFixed(2)} miles from search point`);

          return {
            id: doc.id,
            ...docData,
            distance
          };
        })
        .filter(location => {
          const withinRadius = location.distance <= radiusMiles;
          if (!withinRadius) {
            console.log(`Location ${location.name} filtered out: ${location.distance.toFixed(2)} miles > ${radiusMiles.toFixed(2)} miles radius`);
          }
          return withinRadius;
        })
        .sort((a, b) => a.distance - b.distance);

      console.log(`Returning ${locationsWithDistance.length} locations within ${radiusMiles.toFixed(2)} miles`);
      return locationsWithDistance as Array<Location & { distance: number }>;
    } catch (error) {
      console.error('Error in searchByCoordinates:', error);
      throw error;
    }
  }

  async searchByZipCode(zipCode: string): Promise<Location[]> {
    if (!validateZipCode(zipCode)) {
      throw new Error('Invalid ZIP code format')
    }

    // Get all active locations and filter by ZIP code in memory
    // In a real implementation, you'd store zipCode as a separate indexed field
    const results = await this.list('locations', {
      where: [{ field: 'status', operator: '==', value: 'active' }]
    })

    const filteredLocations = results.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(location => {
        // Extract ZIP code from address (assuming format: "Street, City, State ZIP")
        const addressStr = location.address as string
        const zipMatch = addressStr.match(/\b\d{5}(?:-\d{4})?\b/)
        return zipMatch && zipMatch[0] === zipCode
      })

    return filteredLocations as Location[]
  }

  async searchByText(searchText: string, filters?: { serviceTypes?: string[] }): Promise<Location[]> {
    // Get all active locations and do basic text search
    const results = await this.list('locations', {
      where: [{ field: 'status', operator: '==', value: 'active' }]
    })

    const searchTerms = searchText.toLowerCase().split(' ')
    
    const filteredLocations = results.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(location => {
        // Check if location matches service type filter
        if (filters?.serviceTypes?.length) {
          const locationTypes = location.serviceTypes || []
          if (!filters.serviceTypes.some(type => locationTypes.includes(type))) {
            return false
          }
        }

        const searchableText = [
          location.name,
          location.address,
          location.description || '',
          ...(location.serviceTypes || [])
        ].join(' ').toLowerCase()

        // Check if any search term is found in the searchable text
        return searchTerms.some(term => 
          term.length > 0 && searchableText.includes(term)
        )
      })

    return filteredLocations as Location[]
  }

  async filterByStatus(filters: {
    status?: string[]
    currentStatus?: string[]
  }): Promise<Location[]> {
    const constraints: QueryOptions['where'] = []

    if (filters.status && filters.status.length > 0) {
      constraints.push({
        field: 'status',
        operator: 'in',
        value: filters.status
      })
    }

    if (filters.currentStatus && filters.currentStatus.length > 0) {
      constraints.push({
        field: 'currentStatus',
        operator: 'in',
        value: filters.currentStatus
      })
    }

    const results = await this.list('locations', { where: constraints })
    
    return results.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Location[]
  }

  subscribeToLocation(
    locationId: string,
    callback: (location: Location | null) => void
  ): Unsubscribe {
    return super.subscribe('locations', locationId, callback)
  }

  async batchUpdateStatus(
    updates: Array<{ locationId: string; status: CurrentLocationStatus }>
  ): Promise<number> {
    const operations = updates.map(update => ({
      type: 'update' as const,
      collection: 'locations',
      id: update.locationId,
      data: {
        currentStatus: update.status,
        lastStatusUpdate: serverTimestamp()
      }
    }))

    await super.batchWrite(operations)
    return updates.length
  }

  private validateLocationData(data: CreateLocationData): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Location name is required')
    }

    if (!data.address || data.address.trim().length === 0) {
      throw new Error('Location address is required')
    }

    if (!data.coordinates) {
      throw new Error('Location coordinates are required')
    }

    const { latitude, longitude } = data.coordinates
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90')
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180')
    }

    if (!data.providerId) {
      throw new Error('Provider ID is required')
    }

    const validStatuses = ['active', 'inactive', 'pending', 'suspended']
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Invalid status: must be one of ${validStatuses.join(', ')}`)
    }
  }

  async getRecentListings(limit: number = 10, userQuery?: string): Promise<Location[]> {
    try {
      const results = await this.list('locations', {
        where: [
          { field: 'status', operator: '==', value: 'active' }
        ],
        orderBy: [{ field: 'updatedAt', direction: 'desc' }],
        limit: limit * 2 // Fetch more to account for filtering
      })

      let locations = results.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Location))

      // If we have a user query, filter and sort by distance
      if (userQuery) {
        locations = await filterLocationsByDistance(locations, userQuery)
      }

      return locations.slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent listings:', error)
      throw new Error('Failed to fetch recent listings')
    }
  }

  async testConnection(): Promise<{ connected: boolean; locationCount: number }> {
    try {
      console.log('Testing database connection...')
      const results = await this.list('locations', { limit: 1 })
      console.log('Database connection test successful')
      
      // Get count of all locations
      const allResults = await this.list('locations')
      return {
        connected: true,
        locationCount: allResults.docs.length
      }
    } catch (error) {
      console.error('Database connection test failed:', error)
      return {
        connected: false,
        locationCount: 0
      }
    }
  }
}

// Provider Service
export class ProviderService extends DatabaseService {
  async create(data: CreateProviderData): Promise<Provider> {
    this.validateProviderData(data)
    
    // Get the current user ID to use as the provider document ID
    // This ensures the provider ID matches the user's auth ID
    const { auth } = await import('./firebase')
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      throw new Error('User must be authenticated to create a provider profile')
    }
    
    // Use the user's UID as the provider document ID
    const providerId = currentUser.uid
    
    // Create provider document with specific ID
    await super.set('providers', providerId, data)
    const created = await this.get('providers', providerId)
    return created as Provider
  }

  async getById(providerId: string): Promise<Provider | null> {
    const provider = await this.get('providers', providerId)
    return provider as Provider | null
  }

  async getAnalytics(providerId: string): Promise<{
    totalVisits: number
    averageWaitTime: number
    statusUpdateCount: number
    userSatisfaction: number
    thisWeek: {
      visits: number
      updates: number
    }
    lastWeek: {
      visits: number
      updates: number
    }
  }> {
    // Mock analytics data for now - in production this would come from analytics service
    return {
      totalVisits: 1250,
      averageWaitTime: 15,
      statusUpdateCount: 45,
      userSatisfaction: 4.2,
      thisWeek: {
        visits: 180,
        updates: 12
      },
      lastWeek: {
        visits: 165,
        updates: 8
      }
    }
  }

  async approve(
    providerId: string,
    adminId: string,
    approvalData: {
      status: 'approved' | 'suspended'
      isVerified: boolean
      verificationNotes?: string
    }
  ): Promise<Provider> {
    const updateData = {
      ...approvalData,
      approvedBy: adminId,
      approvedAt: serverTimestamp()
    }

    await super.update('providers', providerId, updateData)
    const updated = await this.get('providers', providerId)
    return updated as Provider
  }

  async getLocations(providerId: string): Promise<Location[]> {
    const results = await this.list('locations', {
      where: [{ field: 'providerId', operator: '==', value: providerId }]
    })

    return results.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Location[]
  }

  async getAllByUserId(userId: string): Promise<Provider[]> {
    try {
      // First try to get provider with user ID as document ID (for compatibility)
      const singleProvider = await this.get('providers', userId)
      const providers: Provider[] = []
      
      if (singleProvider) {
        providers.push(singleProvider as Provider)
      }

      // Also search for providers with managedBy field set to user ID
      const results = await this.list('providers', {
        where: [{ field: 'managedBy', operator: '==', value: userId }]
      })

      const managedProviders = results.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Provider[]

      // Combine and deduplicate
      const allProviders = [...providers, ...managedProviders]
      const uniqueProviders = allProviders.filter((provider, index, self) => 
        index === self.findIndex(p => p.id === provider.id)
      )

      return uniqueProviders
    } catch (error) {
      console.error('Error getting providers by user ID:', error)
      return []
    }
  }

  async updateProvider(providerId: string, data: Partial<Provider>): Promise<void> {
    await super.update('providers', providerId, data)
  }

  private validateProviderData(data: CreateProviderData): void {
    if (!data.organizationName || data.organizationName.trim().length === 0) {
      throw new Error('Organization name is required')
    }

    if (data.organizationName.length > 100) {
      throw new Error('Organization name must be less than 100 characters')
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Valid email address is required')
    }

    if (data.phone && !this.isValidPhoneNumber(data.phone)) {
      throw new Error('Phone number must be in format (XXX) XXX-XXXX')
    }

    const validStatuses = ['pending', 'approved', 'suspended']
    if (data.status && !validStatuses.includes(data.status)) {
      throw new Error(`Invalid status: must be one of ${validStatuses.join(', ')}`)
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    return phoneRegex.test(phone)
  }
}

// User Service
export class UserService extends DatabaseService {
  async create(data: CreateUserData): Promise<User> {
    this.validateUserData(data)
    
    const docRef = await super.create('users', data)
    const created = await this.get('users', docRef.id)
    return created as User
  }

  async updatePreferences(
    userId: string,
    preferences: any
  ): Promise<User> {
    const updateData = {
      'profile.preferences': preferences
    }

    await super.update('users', userId, updateData)
    const updated = await this.get('users', userId)
    return updated as User
  }

  async saveLocation(userId: string, locationId: string): Promise<User> {
    const user = await this.get('users', userId) as User
    const savedLocations = user.profile?.savedLocations || []
    
    if (!savedLocations.includes(locationId)) {
      savedLocations.push(locationId)
    }

    const updateData = {
      'profile.savedLocations': savedLocations
    }

    await super.update('users', userId, updateData)
    const updated = await this.get('users', userId)
    return updated as User
  }

  private validateUserData(data: CreateUserData): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Valid email address is required')
    }

    const validRoles = ['user', 'provider', 'admin']
    if (!validRoles.includes(data.role)) {
      throw new Error(`Invalid role: must be one of ${validRoles.join(', ')}`)
    }

    if (data.profile?.phone && !this.isValidPhoneNumber(data.profile.phone)) {
      throw new Error('Phone number must be in format (XXX) XXX-XXXX')
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    return phoneRegex.test(phone)
  }
}

// Review Service
export class ReviewService extends DatabaseService {
  async create(data: CreateReviewData): Promise<Review> {
    // Check for existing review
    const existingReview = await this.checkExistingReview(data.userId, data.locationId)
    if (existingReview) {
      throw new Error('User has already reviewed this location')
    }

    this.validateReviewData(data)
    
    const docRef = await super.create('reviews', {
      ...data,
      moderationStatus: 'pending'
    })
    const created = await this.get('reviews', docRef.id)
    return created as Review
  }

  async checkExistingReview(userId: string, locationId: string): Promise<boolean> {
    const results = await this.list('reviews', {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'locationId', operator: '==', value: locationId }
      ],
      limit: 1
    })

    return results.docs.length > 0
  }

  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10 // Round to 1 decimal place
  }

  async moderate(
    reviewId: string,
    moderatorId: string,
    decision: {
      status: 'approved' | 'rejected'
      notes?: string
    }
  ): Promise<Review> {
    const updateData = {
      moderationStatus: decision.status,
      moderationNotes: decision.notes,
      moderatedBy: moderatorId,
      moderatedAt: serverTimestamp()
    }

    await super.update('reviews', reviewId, updateData)
    const updated = await this.get('reviews', reviewId)
    return updated as Review
  }

  private validateReviewData(data: CreateReviewData): void {
    if (!data.userId) {
      throw new Error('User ID is required')
    }

    if (!data.locationId) {
      throw new Error('Location ID is required')
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    if (data.comment && data.comment.length > 500) {
      throw new Error('Comment must be less than 500 characters')
    }
  }
}

// Status Update Service
export class StatusUpdateService extends DatabaseService {
  async create(data: CreateStatusUpdateData): Promise<StatusUpdate> {
    this.validateStatusUpdateData(data)
    
    const docRef = await super.create('updates', data)
    const created = await this.get('updates', docRef.id)
    return created as StatusUpdate
  }

  async getRecentByProviderId(providerId: string): Promise<StatusUpdate[]> {
    // Get all locations for this provider first
    const locationService = new LocationService()
    const locations = await locationService.getByProviderId(providerId)
    const locationIds = locations.map(loc => loc.id)

    if (locationIds.length === 0) {
      return []
    }

    const results = await this.list('updates', {
      where: [{ field: 'locationId', operator: 'in', value: locationIds }],
      orderBy: [{ field: 'timestamp', direction: 'desc' }],
      limit: 20
    })

    return results.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StatusUpdate[]
  }

  async updateLocationStatus(locationId: string, statusData: {
    status: CurrentLocationStatus
    notes?: string
    estimatedWaitTime?: number
    foodAvailable?: boolean
    updatedBy: string
    timestamp: Date
  }): Promise<StatusUpdate> {
    // Create status update record
    const updateData: CreateStatusUpdateData = {
      locationId,
      status: statusData.status as UpdateStatus,
      updatedBy: statusData.updatedBy,
      timestamp: statusData.timestamp,
      notes: statusData.notes,
      estimatedWaitTime: statusData.estimatedWaitTime,
      foodAvailable: statusData.foodAvailable
    }

    const statusUpdate = await this.create(updateData)

    // Also update the location's current status
    const locationService = new LocationService()
    await locationService.update('locations', locationId, {
      currentStatus: statusData.status,
      lastStatusUpdate: statusData.timestamp
    })

    return statusUpdate
  }

  async getHistory(locationId: string): Promise<StatusUpdate[]> {
    const results = await this.list('updates', {
      where: [{ field: 'locationId', operator: '==', value: locationId }],
      orderBy: [{ field: 'timestamp', direction: 'desc' }],
      limit: 50
    })

    return results.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StatusUpdate[]
  }

  async notifyStatusChange(locationId: string, status: string): Promise<boolean> {
    // Implementation for sending notifications
    // This would integrate with your notification service
    console.log(`Notifying status change for location ${locationId}: ${status}`)
    
    // Simulate notification sending
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 100)
    })
  }

  private validateStatusUpdateData(data: CreateStatusUpdateData): void {
    if (!data.locationId) {
      throw new Error('Location ID is required')
    }

    const validStatuses = ['open', 'closed', 'limited']
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Invalid status: must be one of ${validStatuses.join(', ')}`)
    }

    if (!data.updatedBy) {
      throw new Error('Updated by user ID is required')
    }

    if (!data.timestamp) {
      throw new Error('Timestamp is required')
    }

    if (data.notes && data.notes.length > 200) {
      throw new Error('Notes must be less than 200 characters')
    }
  }
}

// Service Management
export class ServiceService extends DatabaseService {
  async create(data: CreateServiceData): Promise<Service> {
    this.validateServiceData(data)
    
    const docRef = await super.create('services', data)
    const created = await this.get('services', docRef.id)
    return created as Service
  }

  async getByLocation(locationId: string): Promise<Service[]> {
    const results = await this.list('services', {
      where: [
        { field: 'locationId', operator: '==', value: locationId },
        { field: 'isActive', operator: '==', value: true }
      ]
    })

    return results.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[]
  }

  private validateServiceData(data: CreateServiceData): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Service name is required')
    }

    if (!data.locationId) {
      throw new Error('Location ID is required')
    }

    const validTypes = ['food_pantry', 'soup_kitchen', 'food_bank', 'mobile_pantry', 'other']
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid service type: must be one of ${validTypes.join(', ')}`)
    }

    if (data.description && data.description.length > 500) {
      throw new Error('Description must be less than 500 characters')
    }
  }
}

// Convenience function exports
const locationService = new LocationService()
export const getLocationById = (id: string) => locationService.getById(id) 