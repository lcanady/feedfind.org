import { z } from 'zod'
import { validateZipCode, validateCoordinates } from './locationService'

// User roles enum
export const UserRole = z.enum(['user', 'provider', 'admin'])

// User registration schema
export const userRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  zipCode: z
    .string()
    .refine(validateZipCode, 'Please enter a valid ZIP code')
    .optional(),
  role: UserRole.default('user'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().refine(validateZipCode, 'Please enter a valid ZIP code'),
  country: z.string().default('US').optional(),
})

// Coordinates schema
export const coordinatesSchema = z.object({
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
}).refine(
  (coords) => validateCoordinates(coords),
  'Invalid coordinates provided'
)

// Location status enum
export const LocationStatus = z.enum(['open', 'closed', 'limited', 'unknown'])

// Location data schema
export const locationDataSchema = z.object({
  name: z
    .string()
    .min(1, 'Location name is required')
    .max(100, 'Location name must be less than 100 characters'),
  address: addressSchema,
  coordinates: coordinatesSchema,
  phone: z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (XXX) XXX-XXXX')
    .optional(),
  website: z.string().url('Please enter a valid website URL').optional(),
  hours: z.string().max(200, 'Hours description too long').optional(),
  services: z.array(z.string()).default([]).optional(),
  status: LocationStatus,
})

// Provider information schema
export const providerInformationSchema = z.object({
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters'),
  contactPerson: z
    .string()
    .min(1, 'Contact person is required')
    .max(100, 'Contact person name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (XXX) XXX-XXXX'),
  website: z.string().url('Please enter a valid website URL').optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  servicesOffered: z.array(z.string()).default([]).optional(),
  operatingHours: z
    .string()
    .max(200, 'Operating hours description too long')
    .optional(),
  isVerified: z.boolean().default(false),
})

// Review submission schema
export const reviewSubmissionSchema = z.object({
  locationId: z.string().min(1, 'Location ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .max(500, 'Comment must be less than 500 characters')
    .optional(),
  visitDate: z.string().optional(),
  servicesUsed: z.array(z.string()).default([]).optional(),
  wouldRecommend: z.boolean().optional(),
})

// Type inference from schemas
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>
export type LocationData = z.infer<typeof locationDataSchema>
export type ProviderInformation = z.infer<typeof providerInformationSchema>
export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>
export type Address = z.infer<typeof addressSchema>
export type Coordinates = z.infer<typeof coordinatesSchema>

// Validation helper functions that return safe parse results
export function validateUserRegistration(data: unknown) {
  return userRegistrationSchema.safeParse(data)
}

export function validateLocationData(data: unknown) {
  return locationDataSchema.safeParse(data)
}

export function validateProviderInformation(data: unknown) {
  return providerInformationSchema.safeParse(data)
}

export function validateReviewSubmission(data: unknown) {
  return reviewSubmissionSchema.safeParse(data)
}

export function validateAddress(data: unknown) {
  return addressSchema.safeParse(data)
}

export function validateCoordinatesData(data: unknown) {
  return coordinatesSchema.safeParse(data)
}

// Utility function to format validation errors for user display
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    formattedErrors[path] = issue.message
  })
  
  return formattedErrors
}

// Utility function to check if email is already in use (for form validation)
export function createEmailValidator(checkEmailExists: (email: string) => Promise<boolean>) {
  return z.string().email().refine(
    async (email) => !(await checkEmailExists(email)),
    'This email is already registered'
  )
}

// Common validation patterns
export const ValidationPatterns = {
  zipCode: /^\d{5}(-\d{4})?$/,
  phone: /^\(\d{3}\) \d{3}-\d{4}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  url: /^https?:\/\/.+/,
} as const

// Form field validation messages
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  zipCode: 'Please enter a valid ZIP code',
  phone: 'Please enter a valid phone number',
  strongPassword: 'Password must contain uppercase, lowercase, number, and special character',
  passwordMatch: 'Passwords do not match',
  url: 'Please enter a valid URL',
  maxLength: (max: number) => `Must be less than ${max} characters`,
  minLength: (min: number) => `Must be at least ${min} characters`,
  range: (min: number, max: number) => `Must be between ${min} and ${max}`,
} as const 