import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'
import { DatabaseService } from './databaseService'
import type {
  ForumPost,
  VolunteerOpportunity,
  CommunityEvent,
  CommunityResource,
  CreateVolunteerOpportunityData,
  CreateCommunityEventData,
  CreateCommunityResourceData
} from '../types/database'

// Forum Service
export class ForumService extends DatabaseService {
  private readonly COLLECTION_NAME = 'forum_posts'

  async createPost(data: any): Promise<ForumPost> {
    try {
      const postData = {
        ...data,
        replies: 0,
        likes: 0,
        views: 0,
        status: 'active',
        isPinned: data.isPinned || false,
        isLocked: false,
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), postData)

      return {
        id: docRef.id,
        ...postData,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as ForumPost
    } catch (error) {
      console.error('Error creating forum post:', error)
      throw new Error('Failed to create forum post')
    }
  }

  async getPosts(category?: string): Promise<ForumPost[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'active')
      ]

      if (category && category !== 'all') {
        constraints.push(where('category', '==', category))
      }

      constraints.push(orderBy('lastActivity', 'desc'))
      constraints.push(limit(20))

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints)
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[]
    } catch (error) {
      console.error('Error fetching forum posts:', error)
      return []
    }
  }

  subscribeToPost(postId: string, callback: (post: ForumPost | null) => void): Unsubscribe {
    const docRef = doc(db, this.COLLECTION_NAME, postId)
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as ForumPost)
      } else {
        callback(null)
      }
    })
  }
}

// Volunteer Opportunities Service
export class VolunteerService extends DatabaseService {
  private readonly COLLECTION_NAME = 'volunteer_opportunities'

  async create(data: CreateVolunteerOpportunityData): Promise<VolunteerOpportunity> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as VolunteerOpportunity
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getOpportunities(filter?: string): Promise<VolunteerOpportunity[]> {
    try {
      const constraints: QueryConstraint[] = []

      if (filter && filter !== 'all') {
        if (filter === 'urgent') {
          constraints.push(where('urgency', '==', 'urgent'))
        } else if (filter === 'ongoing') {
          constraints.push(where('isOngoing', '==', true))
        } else if (filter === 'events') {
          constraints.push(where('category', '==', 'events'))
        }
      }

      constraints.push(where('status', '==', 'active'))
      constraints.push(orderBy('createdAt', 'desc'))
      constraints.push(limit(50))

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints)
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerOpportunity[]
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error)
      return []
    }
  }

  subscribeToOpportunities(callback: (opportunities: VolunteerOpportunity[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', '==', 'active'),
      orderBy('urgency', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    
    return onSnapshot(q, (snapshot) => {
      const opportunities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerOpportunity[]
      callback(opportunities)
    })
  }
}

// Community Events Service
export class CommunityEventsService extends DatabaseService {
  private readonly COLLECTION_NAME = 'community_events'

  async create(data: CreateCommunityEventData): Promise<CommunityEvent> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as CommunityEvent
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getEvents(filter?: string): Promise<CommunityEvent[]> {
    try {
      const constraints: QueryConstraint[] = []

      if (filter && filter !== 'all') {
        if (filter === 'today') {
          constraints.push(where('status', '==', 'today'))
        } else {
          constraints.push(where('type', '==', filter))
        }
      }

      constraints.push(orderBy('date', 'asc'))
      constraints.push(limit(50))

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints)
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityEvent[]
    } catch (error) {
      console.error('Error fetching community events:', error)
      return []
    }
  }

  subscribeToEvents(callback: (events: CommunityEvent[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', 'in', ['upcoming', 'today', 'ongoing']),
      orderBy('date', 'asc'),
      limit(50)
    )
    
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityEvent[]
      callback(events)
    })
  }
}

// Community Resources Service
export class CommunityResourcesService extends DatabaseService {
  private readonly COLLECTION_NAME = 'community_resources'

  async create(data: CreateCommunityResourceData): Promise<CommunityResource> {
    try {
      const resourceData = {
        ...data,
        views: 0,
        likes: 0,
        shares: 0,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), resourceData)

      return {
        id: docRef.id,
        ...resourceData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as CommunityResource
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getResources(category?: string): Promise<CommunityResource[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'active')
      ]

      if (category && category !== 'all') {
        constraints.push(where('category', '==', category))
      }

      constraints.push(orderBy('likes', 'desc'))
      constraints.push(limit(50))

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints)
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityResource[]
    } catch (error) {
      console.error('Error fetching community resources:', error)
      return []
    }
  }

  subscribeToResources(callback: (resources: CommunityResource[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', '==', 'active'),
      orderBy('likes', 'desc'),
      limit(50)
    )
    
    return onSnapshot(q, (snapshot) => {
      const resources = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityResource[]
      callback(resources)
    })
  }
}

// Community Stats Service
export class CommunityStatsService extends DatabaseService {
  async getCommunityStats(): Promise<{
    totalMembers: number
    totalPosts: number
    totalResources: number
    totalEvents: number
    volunteerHours: number
  }> {
    try {
      // This would typically aggregate data from multiple collections
      // For now, we'll return mock data that matches our UI
      return {
        totalMembers: 2847,
        totalPosts: 1203,
        totalResources: 456,
        totalEvents: 89,
        volunteerHours: 1203
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getRecentActivity(): Promise<Array<{
    id: string
    type: 'post' | 'resource' | 'event' | 'opportunity'
    title: string
    author: string
    date: Date
  }>> {
    try {
      // This would aggregate recent activity from all community collections
      return [
        {
          id: '1',
          type: 'post',
          title: 'Tips for first-time food pantry visits',
          author: 'Sarah M.',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          type: 'resource',
          title: 'SNAP Benefits Application Guide',
          author: 'Community Team',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'event',
          title: 'Weekend Mobile Food Pantry',
          author: 'Food Bank LA',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Export service instances
export const forumService = new ForumService()
export const volunteerService = new VolunteerService()
export const communityEventsService = new CommunityEventsService()
export const communityResourcesService = new CommunityResourcesService()
export const communityStatsService = new CommunityStatsService()
