import {
  userRegistrationSchema,
  locationDataSchema,
  providerInformationSchema,
  reviewSubmissionSchema,
  validateUserRegistration,
  validateLocationData,
  validateProviderInformation,
  validateReviewSubmission,
} from '@/lib/validation'
import { ZodError } from 'zod'

describe('Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    it('should validate complete user registration data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        zipCode: '12345',
        role: 'user' as const
      }
      
      const result = userRegistrationSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email addresses', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        zipCode: '12345',
        role: 'user' as const
      }
      
      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject weak passwords', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '123', // Too weak
        confirmPassword: '123',
        firstName: 'John',
        lastName: 'Doe',
        zipCode: '12345',
        role: 'user' as const
      }
      
      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject mismatched password confirmation', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        zipCode: '12345',
        role: 'user' as const
      }
      
      expect(() => userRegistrationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should handle optional fields correctly', () => {
      const minimalData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const
      }
      
      const result = userRegistrationSchema.parse(minimalData)
      expect(result.email).toBe('user@example.com')
      expect(result.zipCode).toBeUndefined()
    })

    it('should validate provider role', () => {
      const providerData = {
        email: 'provider@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'provider' as const
      }
      
      const result = userRegistrationSchema.parse(providerData)
      expect(result.role).toBe('provider')
    })
  })

  describe('locationDataSchema', () => {
    it('should validate complete location data', () => {
      const validData = {
        name: 'Community Food Bank',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        },
        phone: '(555) 123-4567',
        website: 'https://example.com',
        hours: 'Mon-Fri 9am-5pm',
        services: ['food-pantry', 'hot-meals'],
        status: 'open' as const
      }
      
      const result = locationDataSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should require essential fields', () => {
      const incompleteData = {
        name: 'Community Food Bank'
        // Missing address, coordinates, etc.
      }
      
      expect(() => locationDataSchema.parse(incompleteData)).toThrow(ZodError)
    })

    it('should validate coordinate ranges', () => {
      const invalidData = {
        name: 'Community Food Bank',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        coordinates: {
          lat: 91, // Invalid latitude
          lng: -74.0060
        },
        status: 'open' as const
      }
      
      expect(() => locationDataSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should validate status enum values', () => {
      const invalidData = {
        name: 'Community Food Bank',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        },
        status: 'invalid-status' as any
      }
      
      expect(() => locationDataSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should handle optional fields', () => {
      const minimalData = {
        name: 'Community Food Bank',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        },
        status: 'open' as const
      }
      
      const result = locationDataSchema.parse(minimalData)
      expect(result.name).toBe('Community Food Bank')
      expect(result.phone).toBeUndefined()
    })
  })

  describe('providerInformationSchema', () => {
    it('should validate complete provider information', () => {
      const validData = {
        organizationName: 'Community Food Network',
        contactPerson: 'Jane Smith',
        email: 'contact@foodnetwork.org',
        phone: '(555) 123-4567',
        website: 'https://foodnetwork.org',
        description: 'Serving the community for over 20 years',
        servicesOffered: ['food-pantry', 'hot-meals', 'delivery'],
        operatingHours: 'Monday-Friday 9am-5pm, Saturday 10am-2pm',
        isVerified: false
      }
      
      const result = providerInformationSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should require essential provider fields', () => {
      const incompleteData = {
        organizationName: 'Community Food Network'
        // Missing contact person, email, etc.
      }
      
      expect(() => providerInformationSchema.parse(incompleteData)).toThrow(ZodError)
    })

    it('should validate email format for providers', () => {
      const invalidData = {
        organizationName: 'Community Food Network',
        contactPerson: 'Jane Smith',
        email: 'invalid-email-format',
        phone: '(555) 123-4567'
      }
      
      expect(() => providerInformationSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should handle verification status', () => {
      const unverifiedData = {
        organizationName: 'New Food Bank',
        contactPerson: 'John Doe',
        email: 'john@newfoodbank.org',
        phone: '(555) 987-6543',
        isVerified: false
      }
      
      const result = providerInformationSchema.parse(unverifiedData)
      expect(result.isVerified).toBe(false)
    })
  })

  describe('reviewSubmissionSchema', () => {
    it('should validate complete review data', () => {
      const validData = {
        locationId: 'location-123',
        userId: 'user-456',
        rating: 4,
        comment: 'Great service and friendly staff!',
        visitDate: '2024-01-15',
        servicesUsed: ['food-pantry'],
        wouldRecommend: true
      }
      
      const result = reviewSubmissionSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate rating range', () => {
      const invalidData = {
        locationId: 'location-123',
        userId: 'user-456',
        rating: 6, // Invalid rating (1-5 scale)
        comment: 'Great service!'
      }
      
      expect(() => reviewSubmissionSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should require minimum fields', () => {
      const incompleteData = {
        locationId: 'location-123'
        // Missing userId, rating
      }
      
      expect(() => reviewSubmissionSchema.parse(incompleteData)).toThrow(ZodError)
    })

    it('should handle optional comment', () => {
      const minimalData = {
        locationId: 'location-123',
        userId: 'user-456',
        rating: 5
      }
      
      const result = reviewSubmissionSchema.parse(minimalData)
      expect(result.rating).toBe(5)
      expect(result.comment).toBeUndefined()
    })
  })

  describe('Validation Helper Functions', () => {
    describe('validateUserRegistration', () => {
      it('should return success for valid data', () => {
        const validData = {
          email: 'user@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user' as const
        }
        
        const result = validateUserRegistration(validData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe('user@example.com')
        }
      })

      it('should return error for invalid data', () => {
        const invalidData = {
          email: 'invalid-email',
          password: '123',
          confirmPassword: '456'
        }
        
        const result = validateUserRegistration(invalidData as any)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toBeDefined()
        }
      })
    })

    describe('validateLocationData', () => {
      it('should return success for valid location data', () => {
        const validData = {
          name: 'Test Location',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zipCode: '12345'
          },
          coordinates: {
            lat: 40.7128,
            lng: -74.0060
          },
          status: 'open' as const
        }
        
        const result = validateLocationData(validData)
        expect(result.success).toBe(true)
      })
    })

    describe('validateProviderInformation', () => {
      it('should return success for valid provider data', () => {
        const validData = {
          organizationName: 'Test Org',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          phone: '(555) 123-4567'
        }
        
        const result = validateProviderInformation(validData)
        expect(result.success).toBe(true)
      })
    })

    describe('validateReviewSubmission', () => {
      it('should return success for valid review data', () => {
        const validData = {
          locationId: 'location-123',
          userId: 'user-456',
          rating: 4
        }
        
        const result = validateReviewSubmission(validData)
        expect(result.success).toBe(true)
      })
    })
  })
}) 