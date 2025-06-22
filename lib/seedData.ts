import { LocationService, ProviderService } from './databaseService'
import type { CreateLocationData, CreateProviderData } from '../types/database'

const sampleProviders: CreateProviderData[] = [
  {
    organizationName: 'Community Food Bank',
    email: 'info@communityfoodbank.org',
    contactPerson: 'Sarah Johnson',
    phone: '(555) 123-4567',
    website: 'https://communityfoodbank.org',
    description: 'Serving the community for over 20 years with emergency food assistance and nutrition programs.',
    address: '123 Main St, New York, NY 10001',
    servicesOffered: ['food_pantry', 'emergency_food'],
    isVerified: true,
    status: 'approved'
  },
  {
    organizationName: 'Downtown Soup Kitchen',
    email: 'help@downtownsoup.org',
    contactPerson: 'Michael Chen',
    phone: '(555) 234-5678',
    website: 'https://downtownsoup.org',
    description: 'Hot meals served daily to anyone in need. No questions asked.',
    address: '456 Second Ave, New York, NY 10002',
    servicesOffered: ['soup_kitchen', 'emergency_food'],
    isVerified: true,
    status: 'approved'
  },
  {
    organizationName: 'West Coast Food Network',
    email: 'contact@westcoastfood.org',
    contactPerson: 'Lisa Rodriguez',
    phone: '(555) 345-6789',
    website: 'https://westcoastfood.org',
    description: 'Mobile food pantry serving multiple locations throughout the week.',
    address: '789 Third St, Los Angeles, CA 90210',
    servicesOffered: ['mobile_pantry', 'food_pantry'],
    isVerified: true,
    status: 'approved'
  }
]

const sampleLocations: Omit<CreateLocationData, 'providerId'>[] = [
  {
    name: 'Community Food Bank - Main Location',
    address: '123 Main St, New York, NY 10001',
    description: 'Our main distribution center offering fresh produce, canned goods, and pantry staples. Open Monday-Friday.',
    coordinates: { latitude: 40.7505, longitude: -73.9934 },
    status: 'active',
    currentStatus: 'open',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
    },
    services: ['food_pantry'],
    phone: '(555) 123-4567',
    email: 'info@communityfoodbank.org',
    website: 'https://communityfoodbank.org',
    accessibilityFeatures: ['wheelchair_accessible', 'multilingual_staff'],
    languages: ['english', 'spanish'],
    capacity: 100,
    currentCapacity: 75,
    eligibilityRequirements: ['low_income'],
    isVerified: true,
    totalVisits: 0,
    reviewCount: 0,
    averageRating: 0
  },
  {
    name: 'Downtown Soup Kitchen',
    address: '456 Second Ave, New York, NY 10002',
    description: 'Hot lunch served daily from 11:30 AM to 1:00 PM. All are welcome, no registration required.',
    coordinates: { latitude: 40.7157, longitude: -73.9860 },
    status: 'active',
    currentStatus: 'open',
    operatingHours: {
      monday: { open: '11:30', close: '13:00', closed: false },
      tuesday: { open: '11:30', close: '13:00', closed: false },
      wednesday: { open: '11:30', close: '13:00', closed: false },
      thursday: { open: '11:30', close: '13:00', closed: false },
      friday: { open: '11:30', close: '13:00', closed: false },
      saturday: { open: '11:30', close: '13:00', closed: false },
      sunday: { open: '11:30', close: '13:00', closed: false }
    },
    services: ['soup_kitchen'],
    phone: '(555) 234-5678',
    email: 'help@downtownsoup.org',
    website: 'https://downtownsoup.org',
    accessibilityFeatures: ['wheelchair_accessible'],
    languages: ['english', 'spanish', 'chinese'],
    capacity: 50,
    currentCapacity: 30,
    eligibilityRequirements: [],
    isVerified: true,
    totalVisits: 0,
    reviewCount: 0,
    averageRating: 0
  },
  {
    name: 'Beverly Hills Community Center Food Pantry',
    address: '789 Third St, Beverly Hills, CA 90210',
    description: 'Weekly food distribution on Wednesdays and Saturdays. Fresh produce and non-perishables available.',
    coordinates: { latitude: 34.0901, longitude: -118.4065 },
    status: 'active',
    currentStatus: 'limited',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: true },
      tuesday: { open: '09:00', close: '17:00', closed: true },
      wednesday: { open: '10:00', close: '14:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: true },
      friday: { open: '09:00', close: '17:00', closed: true },
      saturday: { open: '09:00', close: '12:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    services: ['food_pantry'],
    phone: '(555) 345-6789',
    email: 'contact@westcoastfood.org',
    website: 'https://westcoastfood.org',
    accessibilityFeatures: ['wheelchair_accessible', 'hearing_accessible'],
    languages: ['english', 'spanish'],
    capacity: 80,
    currentCapacity: 20,
    eligibilityRequirements: ['low_income', 'residency_verification'],
    isVerified: true,
    totalVisits: 0,
    reviewCount: 0,
    averageRating: 0
  },
  {
    name: 'Mobile Food Pantry - Park Location',
    address: 'Central Park, Beverly Hills, CA 90211',
    description: 'Mobile food pantry serving this location every Thursday from 2-4 PM.',
    coordinates: { latitude: 34.0836, longitude: -118.4085 },
    status: 'active',
    currentStatus: 'closed',
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: true },
      tuesday: { open: '09:00', close: '17:00', closed: true },
      wednesday: { open: '09:00', close: '17:00', closed: true },
      thursday: { open: '14:00', close: '16:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: true },
      saturday: { open: '09:00', close: '17:00', closed: true },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    services: ['mobile_pantry'],
    phone: '(555) 345-6789',
    email: 'contact@westcoastfood.org',
    website: 'https://westcoastfood.org',
    accessibilityFeatures: ['wheelchair_accessible'],
    languages: ['english', 'spanish'],
    capacity: 40,
    currentCapacity: 0,
    eligibilityRequirements: [],
    isVerified: true,
    totalVisits: 0,
    reviewCount: 0,
    averageRating: 0
  }
]

export async function seedDatabase() {
  console.log('Starting database seeding...')
  
  const locationService = new LocationService()
  const providerService = new ProviderService()
  
  try {
    // Create providers and their locations
    for (let i = 0; i < sampleProviders.length && i < sampleLocations.length; i++) {
      const providerData = sampleProviders[i]!
      const locationData = sampleLocations[i]!
      
      console.log(`Creating provider: ${providerData.organizationName}`)
      
      // Create provider
      const provider = await providerService.create(providerData)
      console.log(`✓ Created provider with ID: ${provider.id}`)
      
      // Create location for this provider
      const fullLocationData: CreateLocationData = {
        ...locationData,
        address: locationData.address, // Ensure address is required
        providerId: provider.id
      }
      
      console.log(`Creating location: ${locationData.name}`)
      const location = await locationService.createLocation(fullLocationData)
      console.log(`✓ Created location with ID: ${location.id}`)
    }
    
    // Create an additional location for the first provider (Community Food Bank)
    const additionalLocation: CreateLocationData = {
      name: 'Community Food Bank - North Branch',
      address: '999 North St, New York, NY 10001',
      description: 'Our north branch location offering emergency food assistance and senior meal programs.',
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      providerId: 'provider1', // Will be replaced with actual provider ID
      status: 'active',
      currentStatus: 'open',
      operatingHours: {
        monday: { open: '08:00', close: '16:00', closed: false },
        tuesday: { open: '08:00', close: '16:00', closed: false },
        wednesday: { open: '08:00', close: '16:00', closed: false },
        thursday: { open: '08:00', close: '16:00', closed: false },
        friday: { open: '08:00', close: '16:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { open: '09:00', close: '13:00', closed: true }
      },
      services: ['food_pantry', 'senior_meals'],
      phone: '(555) 123-4567',
      email: 'north@communityfoodbank.org',
      website: 'https://communityfoodbank.org/north',
      accessibilityFeatures: ['wheelchair_accessible', 'vision_accessible'],
      languages: ['english', 'spanish', 'french'],
      capacity: 60,
      currentCapacity: 45,
      eligibilityRequirements: ['low_income'],
      isVerified: true,
      totalVisits: 0,
      reviewCount: 0,
      averageRating: 0
    }
    
    console.log('Creating additional location...')
    await locationService.createLocation(additionalLocation)
    console.log('✓ Created additional location')
    
    console.log('Database seeding completed successfully!')
    return true
    
  } catch (error) {
    console.error('Error seeding database:', error)
    return false
  }
}

// Function to check if data already exists
export async function checkExistingData(): Promise<boolean> {
  try {
    const locationService = new LocationService()
    const results = await locationService.list('locations', { limit: 1 })
    return results.docs.length > 0
  } catch (error) {
    console.error('Error checking existing data:', error)
    return false
  }
}

// Main function that can be called to seed if needed
export async function seedIfEmpty() {
  const hasData = await checkExistingData()
  
  if (hasData) {
    console.log('Database already has location data, skipping seed.')
    return false
  }
  
  console.log('Database appears empty, seeding with sample data...')
  return await seedDatabase()
} 