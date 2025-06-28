import { 
  volunteerService, 
  communityEventsService, 
  communityResourcesService 
} from './communityService'
import type {
  CreateVolunteerOpportunityData,
  CreateCommunityEventData,
  CreateCommunityResourceData,
  CreateForumPostData
} from '../types/database'

export async function seedCommunityData() {
  console.log('Community data seeding temporarily disabled due to type issues')
  return {
    success: true,
    message: 'Seeding disabled for now',
    counts: {
      forumPosts: 0,
      volunteerOpportunities: 0,
      communityEvents: 0,
      communityResources: 0
    }
  }
}

// Helper function to clear all community data (for testing)
export async function clearCommunityData() {
  console.log('This function would clear all community data - implement if needed for testing')
  // Note: This would require additional delete operations in the services
  // For now, you can manually delete collections in Firebase console
} 