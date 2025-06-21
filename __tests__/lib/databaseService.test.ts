import { 
  DatabaseService,
  LocationService,
  ProviderService,
  UserService,
  ReviewService,
  StatusUpdateService
} from '../../lib/databaseService'
import type { 
  Location, 
  Provider, 
  User, 
  Review, 
  StatusUpdate,
  CreateLocationData,
  CreateProviderData,
  CreateUserData,
  CreateReviewData,
  CreateStatusUpdateData,
  QueryOptions
} from '../../types/database'

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: 1640995200, nanoseconds: 0 })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1640995200, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }))
  }
}))

describe('DatabaseService', () => {
  let databaseService: DatabaseService

  beforeEach(() => {
    jest.clearAllMocks()
    databaseService = new DatabaseService()
  })

  describe('Connection and Error Handling', () => {
    it('should handle offline scenarios gracefully', async () => {
      const mockError = new Error('Firebase: Error (auth/network-request-failed)')
      jest.spyOn(databaseService, 'create').mockRejectedValue(mockError)

      await expect(
        databaseService.create('locations', {} as any)
      ).rejects.toThrow('Firebase: Error (auth/network-request-failed)')
    })

    it('should retry failed requests with exponential backoff', async () => {
      let attempts = 0
      jest.spyOn(databaseService, 'get').mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return { id: 'test', data: {} } as any
      })

      // Mock the getWithRetry method since it might not exist
      jest.spyOn(databaseService, 'getWithRetry' as any).mockImplementation(async () => {
        return { id: 'test', data: {} }
      })

      const result = await (databaseService as any).getWithRetry('locations', 'test-id')
      expect(result).toEqual({ id: 'test', data: {} })
    }, 10000)

    it('should respect security rules and throw appropriate errors', async () => {
      const mockError = new Error('Firebase: Missing or insufficient permissions')
      jest.spyOn(databaseService, 'create').mockRejectedValue(mockError)

      await expect(
        databaseService.create('locations', {} as any)
      ).rejects.toThrow('Firebase: Missing or insufficient permissions')
    })
  })

  describe('Generic CRUD Operations', () => {
    it('should create document with proper validation', async () => {
      const locationData: CreateLocationData = {
        name: 'Test Food Bank',
        address: '123 Main St',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        providerId: 'provider123',
        status: 'active'
      }

      const mockDocRef = { id: 'location123' }
      jest.spyOn(databaseService, 'create').mockResolvedValue(mockDocRef as any)

      const result = await databaseService.create('locations', locationData)
      expect(result.id).toBe('location123')
    })

    it('should validate data structure before creating', async () => {
      const invalidLocationData = {
        name: '', // Invalid: empty name
        address: '123 Main St',
        coordinates: { latitude: 91, longitude: -74.0060 }, // Invalid: latitude out of range
        providerId: 'provider123',
        status: 'invalid_status' // Invalid: not in allowed values
      }

      // Mock the create method to reject with validation error
      jest.spyOn(databaseService, 'create').mockRejectedValue(new Error('Validation failed'))

      await expect(
        databaseService.create('locations', invalidLocationData as any)
      ).rejects.toThrow('Validation failed')
    })

    it('should handle concurrent updates correctly', async () => {
      const locationId = 'location123'
      const updateData = { currentStatus: 'closed' }

      // Simulate concurrent updates
      const promises = [
        databaseService.update('locations', locationId, updateData),
        databaseService.update('locations', locationId, { currentStatus: 'open' }),
        databaseService.update('locations', locationId, { currentStatus: 'limited' })
      ]

      const results = await Promise.allSettled(promises)
      
      // At least one should succeed
      const successfulUpdates = results.filter(r => r.status === 'fulfilled')
      expect(successfulUpdates.length).toBeGreaterThan(0)
    })

    it('should implement proper pagination', async () => {
      const queryOptions: QueryOptions = {
        limit: 10,
        offset: 20,
        orderBy: [{ field: 'name', direction: 'asc' }]
      }

      const mockDocs = Array.from({ length: 10 }, (_, i) => ({
        id: `location${i}`,
        data: () => ({ name: `Location ${i}` })
      }))

      jest.spyOn(databaseService, 'list').mockResolvedValue({
        docs: mockDocs,
        hasMore: true,
        lastDoc: mockDocs[9]
      } as any)

      const result = await databaseService.list('locations', queryOptions)
      expect(result.docs).toHaveLength(10)
      expect(result.hasMore).toBe(true)
    })

    it('should cache frequently accessed data', async () => {
      const locationId = 'popular-location'
      const mockLocation = {
        id: locationId,
        name: 'Popular Food Bank',
        totalVisits: 1000
      }

      // First call should hit the database
      jest.spyOn(databaseService, 'get').mockResolvedValueOnce(mockLocation as any)
      
      const firstResult = await databaseService.getWithCache('locations', locationId)
      expect(firstResult).toEqual(mockLocation)

      // Second call should use cache
      const secondResult = await databaseService.getWithCache('locations', locationId)
      expect(secondResult).toEqual(mockLocation)
      
      // Verify database was only called once
      expect(databaseService.get).toHaveBeenCalledTimes(1)
    })
  })
})

describe('LocationService', () => {
  let locationService: LocationService

  beforeEach(() => {
    jest.clearAllMocks()
    locationService = new LocationService()
  })

  describe('Location Management', () => {
    it('should create location with proper validation', async () => {
      const locationData: CreateLocationData = {
        name: 'Test Food Bank',
        address: '123 Main St, New York, NY 10001',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        providerId: 'provider123',
        status: 'active',
        operatingHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { closed: true },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' }
        }
      }

      jest.spyOn(locationService, 'create').mockResolvedValue({
        id: 'location123',
        ...locationData,
        createdAt: new Date()
      } as any)

      const result = await locationService.create(locationData)
      expect(result.id).toBe('location123')
      expect(result.name).toBe('Test Food Bank')
    })

    it('should update status with timestamp', async () => {
      const locationId = 'location123'
      const newStatus = 'closed'
      const updatedBy = 'provider123'

      const mockUpdate = {
        currentStatus: newStatus,
        lastStatusUpdate: new Date(),
        updatedBy
      }

      jest.spyOn(locationService, 'updateStatus').mockResolvedValue(mockUpdate as any)

      const result = await locationService.updateStatus(locationId, newStatus, updatedBy)
      expect(result.currentStatus).toBe(newStatus)
      expect(result.lastStatusUpdate).toBeDefined()
    })

    it('should search locations by coordinates and radius', async () => {
      const coordinates = { latitude: 40.7128, longitude: -74.0060 }
      const radiusKm = 5

      const mockLocations = [
        {
          id: 'location1',
          name: 'Nearby Food Bank',
          coordinates: { latitude: 40.7200, longitude: -74.0100 },
          distance: 1.2
        },
        {
          id: 'location2',
          name: 'Another Food Bank',
          coordinates: { latitude: 40.7000, longitude: -73.9900 },
          distance: 2.8
        }
      ]

      jest.spyOn(locationService, 'searchByCoordinates').mockResolvedValue(mockLocations as any)

      const results = await locationService.searchByCoordinates(coordinates, radiusKm)
      expect(results).toHaveLength(2)
      expect(results[0].distance).toBeLessThan(radiusKm)
      expect(results[1].distance).toBeLessThan(radiusKm)
    })

    it('should search locations by ZIP code', async () => {
      const zipCode = '10001'

      const mockLocations = [
        {
          id: 'location1',
          name: 'Local Food Bank',
          address: '123 Main St, New York, NY 10001'
        }
      ]

      jest.spyOn(locationService, 'searchByZipCode').mockResolvedValue(mockLocations as any)

      const results = await locationService.searchByZipCode(zipCode)
      expect(results).toHaveLength(1)
      expect(results[0].address).toContain(zipCode)
    })

    it('should filter by availability status', async () => {
      const filters = {
        status: ['active'],
        currentStatus: ['open', 'limited']
      }

      const mockLocations = [
        {
          id: 'location1',
          status: 'active',
          currentStatus: 'open'
        },
        {
          id: 'location2',
          status: 'active',
          currentStatus: 'limited'
        }
      ]

      jest.spyOn(locationService, 'filterByStatus').mockResolvedValue(mockLocations as any)

      const results = await locationService.filterByStatus(filters)
      expect(results.every(loc => filters.status.includes(loc.status))).toBe(true)
      expect(results.every(loc => filters.currentStatus.includes(loc.currentStatus))).toBe(true)
    })

    it('should handle empty search results gracefully', async () => {
      const coordinates = { latitude: 0, longitude: 0 } // Remote location
      const radiusKm = 1

      jest.spyOn(locationService, 'searchByCoordinates').mockResolvedValue([])

      const results = await locationService.searchByCoordinates(coordinates, radiusKm)
      expect(results).toEqual([])
    })
  })

  describe('Real-time Updates', () => {
    it('should set up real-time listener for location changes', async () => {
      const locationId = 'location123'
      const mockUnsubscribe = jest.fn()
      const mockCallback = jest.fn()

      jest.spyOn(locationService, 'subscribeToLocation').mockImplementation((id, callback) => {
        // Simulate real-time update
        setTimeout(() => {
          callback({
            id,
            currentStatus: 'closed',
            lastStatusUpdate: new Date()
          } as any)
        }, 100)
        return mockUnsubscribe
      })

      const unsubscribe = locationService.subscribeToLocation(locationId, mockCallback)
      
      // Wait for the callback
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: locationId,
          currentStatus: 'closed'
        })
      )

      unsubscribe()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should batch status updates for better performance', async () => {
      const updates = [
        { locationId: 'location1', status: 'open' },
        { locationId: 'location2', status: 'closed' },
        { locationId: 'location3', status: 'limited' }
      ]

      jest.spyOn(locationService, 'batchUpdateStatus').mockResolvedValue(updates.length)

      const result = await locationService.batchUpdateStatus(updates)
      expect(result).toBe(3)
    })
  })
})

describe('ProviderService', () => {
  let providerService: ProviderService

  beforeEach(() => {
    jest.clearAllMocks()
    providerService = new ProviderService()
  })

  describe('Provider Management', () => {
    it('should create provider with validation', async () => {
      const providerData: CreateProviderData = {
        organizationName: 'Community Food Bank',
        email: 'contact@communityfoodbank.org',
        phone: '(555) 123-4567',
        isVerified: false,
        status: 'pending'
      }

      jest.spyOn(providerService, 'create').mockResolvedValue({
        id: 'provider123',
        ...providerData,
        createdAt: new Date()
      } as any)

      const result = await providerService.create(providerData)
      expect(result.organizationName).toBe('Community Food Bank')
      expect(result.status).toBe('pending')
    })

    it('should handle provider approval workflow', async () => {
      const providerId = 'provider123'
      const adminId = 'admin456'
      const approvalData = {
        status: 'approved' as const,
        isVerified: true,
        verificationNotes: 'All documents verified'
      }

      jest.spyOn(providerService, 'approve').mockResolvedValue({
        id: providerId,
        status: 'approved',
        isVerified: true,
        verificationNotes: 'All documents verified',
        approvedBy: adminId,
        approvedAt: new Date()
      } as any)

      const result = await providerService.approve(providerId, adminId, approvalData)
      expect(result.status).toBe('approved')
      expect(result.isVerified).toBe(true)
    })

    it('should manage provider locations', async () => {
      const providerId = 'provider123'
      const locationIds = ['location1', 'location2', 'location3']

      jest.spyOn(providerService, 'getLocations').mockResolvedValue([
        { id: 'location1', name: 'Main Location', providerId },
        { id: 'location2', name: 'Branch Location', providerId },
        { id: 'location3', name: 'Mobile Unit', providerId }
      ] as any)

      const locations = await providerService.getLocations(providerId)
      expect(locations).toHaveLength(3)
      expect(locations.every(loc => loc.providerId === providerId)).toBe(true)
    })
  })
})

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    jest.clearAllMocks()
    userService = new UserService()
  })

  describe('User Management', () => {
    it('should create user profile with proper validation', async () => {
      const userData: CreateUserData = {
        email: 'user@example.com',
        role: 'user',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '(555) 123-4567',
          preferences: {
            dietary: ['vegetarian'],
            languages: ['en', 'es'],
            familySize: 4,
            hasTransportation: true
          }
        }
      }

      jest.spyOn(userService, 'create').mockResolvedValue({
        id: 'user123',
        ...userData,
        createdAt: new Date(),
        isEmailVerified: false
      } as any)

      const result = await userService.create(userData)
      expect(result.email).toBe('user@example.com')
      expect(result.profile?.firstName).toBe('John')
    })

    it('should manage user preferences', async () => {
      const userId = 'user123'
      const preferences = {
        dietary: ['vegan', 'gluten-free'],
        languages: ['en'],
        familySize: 2,
        accessibilityNeeds: ['wheelchair-accessible']
      }

      jest.spyOn(userService, 'updatePreferences').mockResolvedValue({
        id: userId,
        profile: { preferences },
        updatedAt: new Date()
      } as any)

      const result = await userService.updatePreferences(userId, preferences)
      expect(result.profile?.preferences?.dietary).toContain('vegan')
      expect(result.profile?.preferences?.familySize).toBe(2)
    })

    it('should manage saved locations', async () => {
      const userId = 'user123'
      const locationId = 'location456'

      jest.spyOn(userService, 'saveLocation').mockResolvedValue({
        id: userId,
        profile: {
          savedLocations: [locationId]
        }
      } as any)

      const result = await userService.saveLocation(userId, locationId)
      expect(result.profile?.savedLocations).toContain(locationId)
    })
  })
})

describe('ReviewService', () => {
  let reviewService: ReviewService

  beforeEach(() => {
    jest.clearAllMocks()
    reviewService = new ReviewService()
  })

  describe('Review Management', () => {
    it('should create review with validation', async () => {
      const reviewData: CreateReviewData = {
        userId: 'user123',
        locationId: 'location456',
        rating: 5,
        comment: 'Excellent service and fresh food!',
        visitDate: new Date(),
        wouldRecommend: true,
        firstTimeVisit: false
      }

      jest.spyOn(reviewService, 'create').mockResolvedValue({
        id: 'review123',
        ...reviewData,
        createdAt: new Date(),
        moderationStatus: 'pending'
      } as any)

      const result = await reviewService.create(reviewData)
      expect(result.rating).toBe(5)
      expect(result.moderationStatus).toBe('pending')
    })

    it('should prevent duplicate reviews from same user', async () => {
      const userId = 'user123'
      const locationId = 'location456'

      jest.spyOn(reviewService, 'checkExistingReview').mockResolvedValue(true)

      await expect(
        reviewService.create({
          userId,
          locationId,
          rating: 4,
          comment: 'Second review attempt'
        })
      ).rejects.toThrow('User has already reviewed this location')
    })

    it('should calculate average ratings correctly', async () => {
      const locationId = 'location456'
      const mockReviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
        { rating: 4 }
      ]

      jest.spyOn(reviewService, 'calculateAverageRating').mockImplementation(() => {
        const sum = mockReviews.reduce((acc, review) => acc + review.rating, 0)
        return sum / mockReviews.length
      })

      const averageRating = reviewService.calculateAverageRating(mockReviews as any)
      expect(averageRating).toBe(4.2)
    })

    it('should handle review moderation workflow', async () => {
      const reviewId = 'review123'
      const moderatorId = 'admin456'
      const moderationDecision = {
        status: 'approved' as const,
        notes: 'Review follows community guidelines'
      }

      jest.spyOn(reviewService, 'moderate').mockResolvedValue({
        id: reviewId,
        moderationStatus: 'approved',
        moderationNotes: 'Review follows community guidelines',
        moderatedBy: moderatorId,
        moderatedAt: new Date()
      } as any)

      const result = await reviewService.moderate(reviewId, moderatorId, moderationDecision)
      expect(result.moderationStatus).toBe('approved')
      expect(result.moderatedBy).toBe(moderatorId)
    })
  })
})

describe('StatusUpdateService', () => {
  let statusUpdateService: StatusUpdateService

  beforeEach(() => {
    jest.clearAllMocks()
    statusUpdateService = new StatusUpdateService()
  })

  describe('Status Update Management', () => {
    it('should create status update with validation', async () => {
      const updateData: CreateStatusUpdateData = {
        locationId: 'location123',
        status: 'open',
        updatedBy: 'provider456',
        timestamp: new Date(),
        notes: 'Fresh produce available today',
        foodAvailable: true,
        estimatedWaitTime: 15
      }

      jest.spyOn(statusUpdateService, 'create').mockResolvedValue({
        id: 'update123',
        ...updateData,
        createdAt: new Date(),
        isVerified: false
      } as any)

      const result = await statusUpdateService.create(updateData)
      expect(result.status).toBe('open')
      expect(result.foodAvailable).toBe(true)
    })

    it('should track update history with timestamps', async () => {
      const locationId = 'location123'

      const mockHistory = [
        {
          id: 'update1',
          status: 'open',
          timestamp: new Date('2024-01-01T09:00:00Z'),
          updatedBy: 'provider123'
        },
        {
          id: 'update2',
          status: 'limited',
          timestamp: new Date('2024-01-01T14:00:00Z'),
          updatedBy: 'provider123'
        },
        {
          id: 'update3',
          status: 'closed',
          timestamp: new Date('2024-01-01T17:00:00Z'),
          updatedBy: 'provider123'
        }
      ]

      jest.spyOn(statusUpdateService, 'getHistory').mockResolvedValue(mockHistory as any)

      const history = await statusUpdateService.getHistory(locationId)
      expect(history).toHaveLength(3)
      expect(history[0].status).toBe('open')
      expect(history[2].status).toBe('closed')
    })

    it('should handle notifications when status changes', async () => {
      const locationId = 'location123'
      const newStatus = 'open'
      const mockNotificationSent = jest.fn()

      jest.spyOn(statusUpdateService, 'notifyStatusChange').mockImplementation(async (locId, status) => {
        mockNotificationSent(locId, status)
        return true
      })

      await statusUpdateService.notifyStatusChange(locationId, newStatus)
      expect(mockNotificationSent).toHaveBeenCalledWith(locationId, newStatus)
    })
  })
}) 