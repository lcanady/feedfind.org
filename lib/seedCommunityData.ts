import { 
  volunteerService, 
  communityEventsService, 
  communityResourcesService 
} from './communityService'
import type {
  CreateVolunteerOpportunityData,
  CreateCommunityEventData,
  CreateCommunityResourceData
} from '../types/database'

export async function seedCommunityData() {
  console.log('Starting community data seeding...')

  try {
    // Seed Forum Posts
    const forumPosts: CreateForumPostData[] = [
      {
        title: 'Tips for first-time food pantry visits',
        content: 'I wanted to share some helpful tips for anyone visiting a food pantry for the first time:\n\n1. **Bring ID** - Most places require some form of identification\n2. **Arrive early** - Lines can get long, especially on busy days\n3. **Bring your own bags** - Some pantries run out of bags during busy times\n4. **Don\'t be afraid to ask questions** - Volunteers are there to help and guide you\n5. **Be patient and kind** - Everyone is doing their best to help\n6. **Check expiration dates** - It\'s okay to check dates on perishable items\n\nRemember, there\'s no shame in needing help. These resources exist for people in our community, and you deserve support during difficult times.',
        authorId: 'user123',
        authorName: 'Sarah M.',
        category: 'general',
        isPinned: true,
        status: 'active',
        tags: ['tips', 'first-time', 'food-pantry']
      },
      {
        title: 'Los Angeles area mobile pantry schedule - Updated weekly!',
        content: 'Here\'s the updated schedule for mobile food pantries in the LA area for this week:\n\n**Monday:**\n- Lincoln Heights: 10am-12pm at Lincoln Park\n- Boyle Heights: 2pm-4pm at Mariachi Plaza\n\n**Tuesday:**\n- Watts: 9am-11am at Ted Watkins Park\n- Compton: 1pm-3pm at Wilson Park\n\n**Wednesday:**\n- East LA: 10am-12pm at East LA Civic Center\n- South LA: 2pm-4pm at Exposition Park\n\n**Thursday:**\n- Hollywood: 9am-11am at Hollywood Recreation Center\n- Koreatown: 1pm-3pm at Lafayette Park\n\n**Friday:**\n- Venice: 10am-12pm at Oakwood Recreation Center\n- Santa Monica: 2pm-4pm at Virginia Avenue Park\n\n**Weekend:**\n- Downtown: Saturday 9am-1pm at Grand Hope Park\n- Pacoima: Sunday 10am-2pm at Pacoima Recreation Center\n\nPlease share this information with anyone who might benefit. Updates are posted every Sunday evening.',
        authorId: 'user456',
        authorName: 'Maria R.',
        category: 'local',
        isPinned: true,
        status: 'active',
        tags: ['schedule', 'mobile-pantry', 'los-angeles']
      },
      {
        title: 'How to apply for emergency food assistance during holidays',
        content: 'The holiday season can be especially challenging for many families. Here are resources and steps to get emergency food assistance when you need it most:\n\n**Immediate Help (Same Day):**\n- Call 211 for local emergency food resources\n- Visit your nearest Salvation Army location\n- Check with local churches - many have emergency food programs\n\n**SNAP Emergency Benefits:**\n- Apply online at GetCalFresh.org\n- Emergency SNAP can be processed within 24-48 hours\n- Bring proof of identity, income, and expenses\n\n**Holiday-Specific Programs:**\n- Many food banks have special holiday distributions\n- Toys for Tots locations often have food assistance too\n- Local community centers run holiday meal programs\n\n**Documentation Needed:**\n- Photo ID for all household members\n- Proof of income (pay stubs, benefit letters)\n- Proof of expenses (rent, utilities)\n- Social Security cards\n\nRemember: You don\'t need to wait until you\'re completely out of food to ask for help. It\'s easier to get assistance before you reach a crisis point.',
        authorId: 'admin789',
        authorName: 'Community Team',
        category: 'resources',
        status: 'active',
        tags: ['emergency', 'holidays', 'assistance']
      },
      {
        title: 'Celebrating small victories - share your success stories',
        content: 'This thread is for sharing positive experiences and small victories. Your story might inspire someone else who is going through a difficult time.\n\nI\'ll start: After months of struggling, I finally got approved for SNAP benefits last week. The process was confusing at first, but the staff at the community center helped me through it. Now I can focus on finding work instead of worrying about feeding my kids every day.\n\nWhat\'s your recent victory, big or small? Let\'s celebrate together! 🎉',
        authorId: 'user321',
        authorName: 'David H.',
        category: 'support',
        status: 'active',
        tags: ['support', 'success-stories', 'inspiration']
      },
      {
        title: 'Transportation resources for getting to food distributions',
        content: 'Getting to food assistance locations can be a challenge if you don\'t have reliable transportation. Here are some resources that can help:\n\n**Public Transportation:**\n- LA Metro: Use the Trip Planner at metro.net\n- Many food banks are near Metro stations\n- Reduced fare programs available for low-income riders\n\n**Ride Services:**\n- Some Uber/Lyft drivers offer discounted rides to food banks\n- Check with your local food bank - some have volunteer drivers\n- Carpool with neighbors or friends\n\n**Delivery Options:**\n- Some food banks offer home delivery for elderly/disabled\n- Instacart and other services sometimes have assistance programs\n- Local churches may have volunteer delivery services\n\n**Free Transportation:**\n- Call 211 to ask about transportation assistance programs\n- Some community centers provide free shuttle services\n- Medical transport services sometimes help with food access\n\nAnyone else have transportation tips to share?',
        authorId: 'user654',
        authorName: 'Alex K.',
        category: 'resources',
        status: 'active',
        tags: ['transportation', 'access', 'resources']
      },
      {
        title: 'Managing volunteer schedules effectively - Provider Discussion',
        content: 'As a food bank coordinator, I\'m always looking for better ways to manage our volunteer schedules. We have about 50 regular volunteers and scheduling can be a nightmare.\n\nHere\'s what has worked for us:\n\n**Tools we use:**\n- SignUpGenius for shift scheduling\n- WhatsApp group for last-minute changes\n- Simple Google Calendar for events\n\n**Challenges we face:**\n- Last-minute cancellations\n- Volunteer burnout\n- Balancing experienced vs new volunteers\n\n**What works:**\n- Having backup volunteers on call\n- Cross-training volunteers for multiple roles\n- Regular appreciation events\n- Clear job descriptions for each role\n\nWhat tools and strategies work for other organizations? Always looking to improve our operations!',
        authorId: 'provider123',
        authorName: 'FoodBank Admin',
        category: 'providers',
        status: 'active',
        tags: ['volunteers', 'scheduling', 'management']
      },
      {
        title: 'Best practices for food safety at distribution sites',
        content: 'Food safety is crucial at distribution sites. Here are some best practices we\'ve implemented:\n\n**Temperature Control:**\n- Use thermometers to check refrigerated items\n- Don\'t leave perishables out for more than 2 hours\n- Have coolers with ice for hot days\n\n**Hygiene:**\n- Hand sanitizer stations at entry and exit\n- Gloves for volunteers handling food\n- Masks during flu season or as needed\n\n**Storage:**\n- Keep items off the ground\n- Rotate stock - first in, first out\n- Check expiration dates regularly\n\n**Documentation:**\n- Log temperatures throughout the day\n- Track where food came from\n- Record any issues or discarded items\n\nWhat other safety measures do your organizations use?',
        authorId: 'provider456',
        authorName: 'Safety Coordinator',
        category: 'providers',
        status: 'active',
        tags: ['food-safety', 'best-practices', 'health']
      },
      {
        title: 'Finding fresh produce on a tight budget',
        content: 'Fresh fruits and vegetables can be expensive, but there are ways to get them affordably:\n\n**Farmer\'s Markets:**\n- Many accept SNAP/EBT\n- End-of-day discounts are common\n- Some have special programs for low-income shoppers\n\n**Community Gardens:**\n- Many neighborhoods have shared gardens\n- Volunteer work often earns you fresh produce\n- Great way to learn gardening skills\n\n**Grocery Store Tips:**\n- Shop the clearance produce section\n- Frozen vegetables are nutritious and cheaper\n- Buy in season for best prices\n\n**Food Recovery Programs:**\n- Apps like Flashfood show discounted items\n- Some stores donate near-expiration produce\n- Ask managers about markdown schedules\n\nAnyone have other tips for eating healthy on a budget?',
        authorId: 'user789',
        authorName: 'Jennifer K.',
        category: 'general',
        status: 'active',
        tags: ['nutrition', 'budget', 'healthy-eating']
      },
      {
        title: 'Support group meetup this Saturday - West LA',
        content: 'Hi everyone! We\'re having another informal support group meetup this Saturday at 2pm at the Westwood Community Center.\n\nThis is a safe space to:\n- Share experiences and challenges\n- Connect with others in similar situations\n- Learn about local resources\n- Just have someone listen\n\n**Details:**\n- Date: This Saturday\n- Time: 2:00 PM - 4:00 PM\n- Location: Westwood Community Center (main room)\n- Free childcare available\n- Light refreshments provided\n\nNo need to RSVP, just show up. All are welcome, regardless of your situation. Sometimes it just helps to know you\'re not alone.\n\nHope to see some familiar faces and meet some new ones!',
        authorId: 'user555',
        authorName: 'Michelle T.',
        category: 'support',
        status: 'active',
        tags: ['support-group', 'meetup', 'west-la']
      },
      {
        title: 'Recipe ideas for food bank ingredients',
        content: 'Got some interesting ingredients from the food bank and not sure what to make? Let\'s share recipe ideas!\n\nThis week I got:\n- Canned chickpeas\n- Rice\n- Frozen mixed vegetables\n- Pasta sauce\n\nMade a delicious chickpea curry over rice with the veggies! Here\'s the simple recipe:\n\n1. Heat oil in a pan\n2. Add drained chickpeas and frozen veggies\n3. Pour in pasta sauce\n4. Add spices (salt, pepper, garlic powder, curry powder if you have it)\n5. Simmer 10 minutes\n6. Serve over rice\n\nWhat creative meals have you made with food bank ingredients? Share your recipes below!',
        authorId: 'user888',
        authorName: 'Carlos M.',
        category: 'general',
        status: 'active',
        tags: ['recipes', 'cooking', 'food-bank']
      }
    ]

    for (const post of forumPosts) {
      await forumService.createPost(post)
      console.log(`Created forum post: ${post.title}`)
    }

    // Seed Volunteer Opportunities
    const volunteerOpportunities: CreateVolunteerOpportunityData[] = [
      {
        title: 'Weekend Food Pantry Assistance',
        description: 'Help sort and distribute food items to families in need. Perfect for individuals or families who want to volunteer together.',
        organization: 'Community Food Bank',
        location: 'Downtown Los Angeles',
        address: '123 Main St, Los Angeles, CA 90012',
        isOngoing: true,
        timeCommitment: '4 hours/week',
        skills: ['Physical activity', 'Customer service', 'Bilingual helpful'],
        contactEmail: 'volunteer@communityfoodbank.org',
        status: 'active',
        urgency: 'normal',
        category: 'food_distribution',
        createdBy: 'provider123'
      },
      {
        title: 'Mobile Pantry Driver - Urgent Need',
        description: 'Drive our mobile pantry to underserved neighborhoods. Valid driver\'s license and clean driving record required.',
        organization: 'Meals on Wheels LA',
        location: 'Various locations',
        address: 'Various locations in LA County',
        isOngoing: true,
        timeCommitment: '6 hours/month',
        skills: ['Valid driver\'s license', 'Reliable transportation', 'Physical stamina'],
        contactEmail: 'drivers@mealsonwheelsla.org',
        status: 'active',
        urgency: 'urgent',
        category: 'delivery',
        createdBy: 'provider456'
      },
      {
        title: 'Holiday Food Drive Coordinator',
        description: 'Coordinate our annual holiday food drive. Help organize collection sites, manage volunteers, and sort donations.',
        organization: 'Santa Monica Community Center',
        location: 'Santa Monica',
        address: '456 Ocean Ave, Santa Monica, CA 90401',
        isOngoing: false,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        timeCommitment: '10 hours over 2 weeks',
        skills: ['Event planning', 'Leadership', 'Communication'],
        contactEmail: 'events@smcommunitycenter.org',
        status: 'active',
        urgency: 'high',
        category: 'events',
        createdBy: 'provider789'
      }
    ]

    for (const opportunity of volunteerOpportunities) {
      await volunteerService.create(opportunity)
      console.log(`Created volunteer opportunity: ${opportunity.title}`)
    }

    // Seed Community Events
    const communityEvents: CreateCommunityEventData[] = [
      {
        title: 'Weekend Mobile Food Pantry',
        description: 'Free fresh produce and pantry items for families in need. No documentation required.',
        organization: 'Food Bank LA',
        date: new Date('2024-12-15'),
        startTime: '9:00 AM',
        endTime: '12:00 PM',
        location: 'Lincoln Park',
        address: '3501 Valley Blvd, Los Angeles, CA 90031',
        type: 'distribution',
        category: 'Food Distribution',
        contactEmail: 'events@foodbankla.org',
        contactPhone: '(213) 555-0123',
        status: 'upcoming',
        capacity: 200,
        registered: 45,
        createdBy: 'provider123'
      },
      {
        title: 'Free Community Breakfast',
        description: 'Hot breakfast served every Saturday morning. All are welcome, no questions asked.',
        organization: 'Hope Community Kitchen',
        date: new Date('2024-12-14'),
        startTime: '7:00 AM',
        endTime: '10:00 AM',
        location: 'Hope Community Center',
        address: '789 Hope St, Los Angeles, CA 90015',
        type: 'meal',
        category: 'Community Meal',
        contactEmail: 'breakfast@hopekitchen.org',
        status: 'today',
        isRecurring: true,
        recurrencePattern: 'weekly',
        createdBy: 'provider456'
      },
      {
        title: 'SNAP Benefits Workshop',
        description: 'Learn how to apply for SNAP benefits and get help with your application. Spanish translation available.',
        organization: 'Community Resource Center',
        date: new Date('2024-12-20'),
        startTime: '2:00 PM',
        endTime: '4:00 PM',
        location: 'Downtown Library',
        address: '630 W 5th St, Los Angeles, CA 90071',
        type: 'workshop',
        category: 'Educational Workshop',
        contactEmail: 'workshops@crcla.org',
        status: 'upcoming',
        capacity: 30,
        registered: 12,
        registrationRequired: true,
        createdBy: 'provider789'
      }
    ]

    for (const event of communityEvents) {
      await communityEventsService.create(event)
      console.log(`Created community event: ${event.title}`)
    }

    // Seed Community Resources
    const communityResources: CreateCommunityResourceData[] = [
      {
        title: 'SNAP Benefits Guide',
        description: 'A comprehensive guide to applying for and using SNAP benefits (food stamps).',
        category: 'government',
        type: 'guide',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['snap', 'food-stamps', 'benefits'],
        externalUrl: 'https://www.fns.usda.gov/snap/recipient/eligibility'
      },
      {
        title: 'Local Food Bank Directory',
        description: 'Find food banks and pantries in your area with operating hours and requirements.',
        category: 'local',
        type: 'website',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['food-banks', 'pantries', 'local-help'],
        externalUrl: 'https://www.feedingamerica.org/find-your-local-foodbank'
      },
      {
        title: 'Transportation Assistance Programs',
        description: 'Information about free and reduced-cost transportation to food assistance locations.',
        category: 'transportation',
        type: 'guide',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['transportation', 'access', 'mobility']
      },
      {
        title: 'Family Nutrition Program',
        description: 'Educational resources for families about nutrition and healthy eating on a budget.',
        category: 'family',
        type: 'guide',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['nutrition', 'education', 'family']
      },
      {
        title: 'National Food Assistance Hotline',
        description: '24/7 hotline for emergency food assistance and program information.',
        category: 'national',
        type: 'contact',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['hotline', 'emergency', 'assistance'],
        phoneNumber: '1-866-3-HUNGRY'
      },
      {
        title: 'Housing & Food Assistance Programs',
        description: 'Combined resources for housing stability and food security.',
        category: 'housing',
        type: 'guide',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['housing', 'stability', 'assistance']
      },
      {
        title: 'Healthcare & Nutrition Support',
        description: 'Medical resources and nutrition support for food-insecure individuals.',
        category: 'healthcare',
        type: 'website',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['healthcare', 'nutrition', 'medical'],
        externalUrl: 'https://health.gov/nutrition'
      },
      {
        title: 'Cooking on a Budget Workshop',
        description: 'Free online workshop teaching budget-friendly cooking skills.',
        category: 'education',
        type: 'video',
        authorId: 'admin123',
        authorName: 'FeedFind Team',
        tags: ['cooking', 'education', 'budget'],
        externalUrl: 'https://www.youtube.com/watch?v=example'
      }
    ]

    for (const resource of communityResources) {
      await communityResourcesService.create(resource)
      console.log(`Created community resource: ${resource.title}`)
    }

    console.log('Community data seeding completed successfully!')
    
    return {
      success: true,
      message: 'All community data has been seeded successfully',
      counts: {
        forumPosts: forumPosts.length,
        volunteerOpportunities: volunteerOpportunities.length,
        communityEvents: communityEvents.length,
        communityResources: communityResources.length
      }
    }

  } catch (error) {
    console.error('Error seeding community data:', error)
    return {
      success: false,
      message: 'Failed to seed community data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to clear all community data (for testing)
export async function clearCommunityData() {
  console.log('This function would clear all community data - implement if needed for testing')
  // Note: This would require additional delete operations in the services
  // For now, you can manually delete collections in Firebase console
} 