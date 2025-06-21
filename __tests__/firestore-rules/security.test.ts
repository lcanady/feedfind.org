import {
  RulesTestEnvironment,
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'

const PROJECT_ID = 'feedfind-test'

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: await import('fs').then(fs => 
          fs.readFileSync('firestore.rules', 'utf8')
        ),
      },
    })
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  beforeEach(async () => {
    await testEnv.clearFirestore()
  })

  describe('Authentication Requirements', () => {
    it('should allow authenticated users to read public locations', async () => {
      const authenticatedDb = testEnv.authenticatedContext('user123').firestore()
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('locations').doc('location1').set({
          name: 'Test Food Bank',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active',
          currentStatus: 'open'
        })
      })

      await assertSucceeds(
        authenticatedDb.collection('locations').doc('location1').get()
      )
    })

    it('should allow unauthenticated users to read public locations', async () => {
      const unauthenticatedDb = testEnv.unauthenticatedContext().firestore()
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('locations').doc('location1').set({
          name: 'Test Food Bank',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active'
        })
      })

      await assertSucceeds(
        unauthenticatedDb.collection('locations').doc('location1').get()
      )
    })

    it('should prevent unauthenticated users from creating locations', async () => {
      const unauthenticatedDb = testEnv.unauthenticatedContext().firestore()

      await assertFails(
        unauthenticatedDb.collection('locations').doc('location1').set({
          name: 'Test Food Bank',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active'
        })
      )
    })
  })

  describe('User Access Controls', () => {
    it('should allow users to read and write their own user data', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()
      const userData = {
        email: 'user@example.com',
        createdAt: new Date(),
        role: 'user',
        profile: {
          phone: '(555) 123-4567',
          preferences: { dietary: ['vegetarian'] }
        }
      }

      await assertSucceeds(
        userDb.collection('users').doc('user123').set(userData)
      )

      await assertSucceeds(
        userDb.collection('users').doc('user123').get()
      )
    })

    it('should prevent users from accessing other users data', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user456').set({
          email: 'other@example.com',
          createdAt: new Date(),
          role: 'user'
        })
      })

      await assertFails(
        userDb.collection('users').doc('user456').get()
      )

      await assertFails(
        userDb.collection('users').doc('user456').set({
          email: 'malicious@example.com',
          createdAt: new Date()
        })
      )
    })

    it('should prevent role escalation attacks', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      await assertFails(
        userDb.collection('users').doc('user123').set({
          email: 'user@example.com',
          createdAt: new Date(),
          role: 'admin' // Attempting to escalate to admin
        })
      )
    })

    it('should validate user data structure', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      // Missing required email field
      await assertFails(
        userDb.collection('users').doc('user123').set({
          createdAt: new Date(),
          role: 'user'
        })
      )

      // Invalid email format
      await assertFails(
        userDb.collection('users').doc('user123').set({
          email: 'invalid-email',
          createdAt: new Date(),
          role: 'user'
        })
      )

      // Invalid phone format
      await assertFails(
        userDb.collection('users').doc('user123').set({
          email: 'user@example.com',
          createdAt: new Date(),
          role: 'user',
          profile: {
            phone: '555-123-4567' // Invalid format, should be (555) 123-4567
          }
        })
      )
    })
  })

  describe('Provider Permissions', () => {
    beforeEach(async () => {
      // Set up provider in the providers collection
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('provider123').set({
          organizationName: 'Test Food Bank',
          email: 'provider@example.com',
          createdAt: new Date(),
          isVerified: true,
          status: 'approved'
        })
      })
    })

    it('should only allow providers to update their own locations', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()
      const otherProviderDb = testEnv.authenticatedContext('provider456').firestore()

      const locationData = {
        name: 'Test Location',
        address: '123 Main St',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        providerId: 'provider123',
        status: 'active',
        currentStatus: 'open'
      }

      // Provider should be able to create their own location
      await assertSucceeds(
        providerDb.collection('locations').doc('location1').set(locationData)
      )

      // Other provider should not be able to update this location
      await assertFails(
        otherProviderDb.collection('locations').doc('location1').update({
          currentStatus: 'closed'
        })
      )
    })

    it('should prevent unauthorized admin access', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      await assertFails(
        userDb.collection('admins').doc('admin1').get()
      )

      await assertFails(
        userDb.collection('analytics').doc('stats').get()
      )
    })

    it('should validate provider data structure', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Missing required organizationName
      await assertFails(
        providerDb.collection('providers').doc('provider123').set({
          email: 'provider@example.com',
          createdAt: new Date()
        })
      )

      // Organization name too long
      await assertFails(
        providerDb.collection('providers').doc('provider123').set({
          organizationName: 'A'.repeat(101), // Over 100 character limit
          email: 'provider@example.com',
          createdAt: new Date()
        })
      )

      // Invalid status
      await assertFails(
        providerDb.collection('providers').doc('provider123').set({
          organizationName: 'Test Provider',
          email: 'provider@example.com',
          createdAt: new Date(),
          status: 'invalid_status'
        })
      )
    })
  })

  describe('Location Data Validation', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('provider123').set({
          organizationName: 'Test Food Bank',
          email: 'provider@example.com',
          createdAt: new Date()
        })
      })
    })

    it('should validate location coordinates', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Invalid latitude (out of range)
      await assertFails(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 91, longitude: -74.0060 }, // Invalid latitude
          providerId: 'provider123',
          status: 'active'
        })
      )

      // Invalid longitude (out of range)
      await assertFails(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: 181 }, // Invalid longitude
          providerId: 'provider123',
          status: 'active'
        })
      )

      // Valid coordinates should succeed
      await assertSucceeds(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active'
        })
      )
    })

    it('should validate location status values', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Invalid status
      await assertFails(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'invalid_status'
        })
      )

      // Valid status should succeed
      await assertSucceeds(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active'
        })
      )
    })

    it('should validate currentStatus values', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Invalid currentStatus
      await assertFails(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active',
          currentStatus: 'invalid_current_status'
        })
      )

      // Valid currentStatus should succeed
      await assertSucceeds(
        providerDb.collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active',
          currentStatus: 'open'
        })
      )
    })
  })

  describe('Review System Security', () => {
    it('should allow authenticated users to create reviews for locations they visited', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      await assertSucceeds(
        userDb.collection('reviews').doc('review1').set({
          userId: 'user123',
          locationId: 'location1',
          rating: 5,
          comment: 'Great service and fresh food!',
          createdAt: new Date(),
          visitDate: new Date()
        })
      )
    })

    it('should prevent users from creating reviews with other user IDs', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      await assertFails(
        userDb.collection('reviews').doc('review1').set({
          userId: 'user456', // Different user ID
          locationId: 'location1',
          rating: 5,
          comment: 'Fake review',
          createdAt: new Date()
        })
      )
    })

    it('should validate review rating range', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      // Rating too low
      await assertFails(
        userDb.collection('reviews').doc('review1').set({
          userId: 'user123',
          locationId: 'location1',
          rating: 0,
          createdAt: new Date()
        })
      )

      // Rating too high
      await assertFails(
        userDb.collection('reviews').doc('review1').set({
          userId: 'user123',
          locationId: 'location1',
          rating: 6,
          createdAt: new Date()
        })
      )
    })

    it('should validate review comment length', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      // Comment too long
      await assertFails(
        userDb.collection('reviews').doc('review1').set({
          userId: 'user123',
          locationId: 'location1',
          rating: 5,
          comment: 'A'.repeat(501), // Over 500 character limit
          createdAt: new Date()
        })
      )

      // Valid comment length should succeed
      await assertSucceeds(
        userDb.collection('reviews').doc('review1').set({
          userId: 'user123',
          locationId: 'location1',
          rating: 5,
          comment: 'Great place!',
          createdAt: new Date()
        })
      )
    })
  })

  describe('Real-time Updates Security', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('provider123').set({
          organizationName: 'Test Food Bank',
          email: 'provider@example.com',
          createdAt: new Date()
        })
      })
    })

    it('should allow providers to create status updates', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      await assertSucceeds(
        providerDb.collection('updates').doc('update1').set({
          locationId: 'location1',
          status: 'open',
          updatedBy: 'provider123',
          timestamp: new Date(),
          notes: 'Fresh produce available',
          foodAvailable: true
        })
      )
    })

    it('should validate update status values', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Invalid status
      await assertFails(
        providerDb.collection('updates').doc('update1').set({
          locationId: 'location1',
          status: 'invalid_status',
          updatedBy: 'provider123',
          timestamp: new Date()
        })
      )

      // Valid status should succeed
      await assertSucceeds(
        providerDb.collection('updates').doc('update1').set({
          locationId: 'location1',
          status: 'limited',
          updatedBy: 'provider123',
          timestamp: new Date()
        })
      )
    })

    it('should validate update notes length', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Notes too long
      await assertFails(
        providerDb.collection('updates').doc('update1').set({
          locationId: 'location1',
          status: 'open',
          updatedBy: 'provider123',
          timestamp: new Date(),
          notes: 'A'.repeat(201) // Over 200 character limit
        })
      )
    })
  })

  describe('Service Data Validation', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('provider123').set({
          organizationName: 'Test Food Bank',
          email: 'provider@example.com',
          createdAt: new Date()
        })
      })
    })

    it('should validate service type values', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Invalid service type
      await assertFails(
        providerDb.collection('services').doc('service1').set({
          name: 'Food Distribution',
          locationId: 'location1',
          type: 'invalid_type'
        })
      )

      // Valid service type should succeed
      await assertSucceeds(
        providerDb.collection('services').doc('service1').set({
          name: 'Food Distribution',
          locationId: 'location1',
          type: 'food_pantry'
        })
      )
    })

    it('should validate service description length', async () => {
      const providerDb = testEnv.authenticatedContext('provider123').firestore()

      // Description too long
      await assertFails(
        providerDb.collection('services').doc('service1').set({
          name: 'Food Distribution',
          locationId: 'location1',
          type: 'food_pantry',
          description: 'A'.repeat(501) // Over 500 character limit
        })
      )

      // Valid description should succeed
      await assertSucceeds(
        providerDb.collection('services').doc('service1').set({
          name: 'Food Distribution',
          locationId: 'location1',
          type: 'food_pantry',
          description: 'Weekly food distribution for families in need'
        })
      )
    })
  })

  describe('Admin Access Controls', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('admins').doc('admin123').set({
          email: 'admin@feedfind.org',
          role: 'admin',
          createdAt: new Date()
        })
      })
    })

    it('should allow admins to access admin collections', async () => {
      const adminDb = testEnv.authenticatedContext('admin123').firestore()

      await assertSucceeds(
        adminDb.collection('admins').doc('admin123').get()
      )

      await assertSucceeds(
        adminDb.collection('analytics').doc('daily-stats').set({
          date: new Date(),
          userCount: 100,
          locationCount: 50
        })
      )

      await assertSucceeds(
        adminDb.collection('config').doc('settings').set({
          maintenanceMode: false,
          maxReviewLength: 500
        })
      )
    })

    it('should allow admins to delete locations and providers', async () => {
      const adminDb = testEnv.authenticatedContext('admin123').firestore()

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('locations').doc('location1').set({
          name: 'Test Location',
          address: '123 Main St',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          providerId: 'provider123',
          status: 'active'
        })
        
        await context.firestore().collection('providers').doc('provider123').set({
          organizationName: 'Test Provider',
          email: 'provider@example.com',
          createdAt: new Date()
        })
      })

      await assertSucceeds(
        adminDb.collection('locations').doc('location1').delete()
      )

      await assertSucceeds(
        adminDb.collection('providers').doc('provider123').delete()
      )
    })

    it('should prevent non-admins from accessing admin collections', async () => {
      const userDb = testEnv.authenticatedContext('user123').firestore()

      await assertFails(
        userDb.collection('admins').doc('admin123').get()
      )

      await assertFails(
        userDb.collection('analytics').doc('stats').get()
      )

      await assertFails(
        userDb.collection('config').doc('settings').get()
      )
    })
  })
}) 