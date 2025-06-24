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
  Unsubscribe,
  runTransaction,
  deleteField,
  DocumentReference,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from './firebase'
import {
  VolunteerOpportunity,
  CommunityEvent,
  CommunityResource,
  CreateVolunteerOpportunityData,
  CreateCommunityEventData,
  CreateCommunityResourceData,
  UpdateVolunteerOpportunityData,
  UpdateCommunityEventData
} from '../types/database'

// Base Database Service
abstract class DatabaseService {
  protected readonly collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  protected async createDoc<T extends DocumentData>(data: T): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error)
      throw error
    }
  }

  protected async updateDoc<T extends DocumentData>(id: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error)
      throw error
    }
  }

  protected async getDoc<T extends DocumentData>(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return null
      const data = docSnap.data()
      return { ...data, id: docSnap.id } as unknown as T
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error)
      throw error
    }
  }

  protected subscribeToDoc<T extends DocumentData>(
    id: string,
    callback: (data: T | null) => void
  ): Unsubscribe {
    const docRef = doc(db, this.collectionName, id)
    return onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(null)
        return
      }
      const data = docSnap.data()
      callback({ ...data, id: docSnap.id } as unknown as T)
    })
  }

  protected subscribeToCollection<T extends DocumentData>(
    callback: (data: T[]) => void,
    queryConstraints: QueryConstraint[] = []
  ): Unsubscribe {
    const q = query(collection(db, this.collectionName), ...queryConstraints)
    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return { ...data, id: doc.id } as unknown as T
      })
      callback(docs)
    })
  }
}

// Volunteer Service
export class VolunteerService extends DatabaseService {
  constructor() {
    super('volunteer_opportunities')
  }

  async create(data: CreateVolunteerOpportunityData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        spotsRegistered: 0,
        spotsAvailable: data.spotsTotal || undefined,
        registrations: {}
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating volunteer opportunity:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateVolunteerOpportunityData): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating volunteer opportunity:', error)
      throw error
    }
  }

  async register(opportunityId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, opportunityId)
      
      await runTransaction(db, async (transaction) => {
        const opportunityDoc = await transaction.get(docRef)
        if (!opportunityDoc.exists()) {
          throw new Error('Opportunity not found')
        }

        const data = opportunityDoc.data() as VolunteerOpportunity
        
        // Check if already registered
        if (data.registrations?.[userId]) {
          throw new Error('Already registered for this opportunity')
        }

        const currentRegistered = data.spotsRegistered || 0

        // Check if spots are available
        if (data.spotsTotal && currentRegistered >= data.spotsTotal) {
          throw new Error('No spots available')
        }

        // Update registration count and available spots
        const newRegistered = currentRegistered + 1
        const newAvailable = data.spotsTotal ? data.spotsTotal - newRegistered : undefined

        transaction.update(docRef, {
          [`registrations.${userId}`]: {
            registeredAt: serverTimestamp(),
            status: 'pending'
          },
          spotsRegistered: newRegistered,
          spotsAvailable: newAvailable,
          updatedAt: serverTimestamp()
        })
      })
    } catch (error) {
      console.error('Error registering for opportunity:', error)
      throw error
    }
  }

  async cancelRegistration(opportunityId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, opportunityId)
      
      await runTransaction(db, async (transaction) => {
        const opportunityDoc = await transaction.get(docRef)
        if (!opportunityDoc.exists()) {
          throw new Error('Opportunity not found')
        }

        const data = opportunityDoc.data() as VolunteerOpportunity
        
        // Check if registered
        if (!data.registrations?.[userId]) {
          throw new Error('Not registered for this opportunity')
        }

        const currentRegistered = data.spotsRegistered || 0
        const newRegistered = Math.max(0, currentRegistered - 1)
        const newAvailable = data.spotsTotal ? data.spotsTotal - newRegistered : undefined

        // Remove registration and update counts
        const updates: any = {
          [`registrations.${userId}`]: deleteField(),
          spotsRegistered: newRegistered,
          spotsAvailable: newAvailable,
          updatedAt: serverTimestamp()
        }

        transaction.update(docRef, updates)
      })
    } catch (error) {
      console.error('Error canceling registration:', error)
      throw error
    }
  }

  async getOpportunity(id: string): Promise<VolunteerOpportunity | null> {
    return this.getDoc<VolunteerOpportunity>(id)
  }

  subscribeToOpportunity(
    id: string,
    callback: (opportunity: VolunteerOpportunity | null) => void
  ): Unsubscribe {
    return this.subscribeToDoc<VolunteerOpportunity>(id, callback)
  }

  subscribeToOpportunities(
    callback: (opportunities: VolunteerOpportunity[]) => void,
    filter?: string
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    ]

    if (filter && filter !== 'all') {
      switch (filter) {
        case 'urgent':
          constraints.push(where('urgency', '==', 'urgent'))
          break
        case 'ongoing':
          constraints.push(where('isOngoing', '==', true))
          break
        case 'available':
          constraints.push(where('spotsAvailable', '>', 0))
          break
        case 'events':
          constraints.push(where('category', '==', 'events'))
          break
      }
    }

    return this.subscribeToCollection<VolunteerOpportunity>(callback, constraints)
  }

  async updateRegistrationStatus(
    opportunityId: string,
    userId: string,
    status: 'approved' | 'declined'
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, opportunityId)
      
      await runTransaction(db, async (transaction) => {
        const opportunityDoc = await transaction.get(docRef)
        if (!opportunityDoc.exists()) {
          throw new Error('Opportunity not found')
        }

        const data = opportunityDoc.data() as VolunteerOpportunity
        
        // Check if registered
        if (!data.registrations?.[userId]) {
          throw new Error('User not registered for this opportunity')
        }

        // Update registration status
        transaction.update(docRef, {
          [`registrations.${userId}.status`]: status,
          updatedAt: serverTimestamp()
        })

        // If declined, update spots
        if (status === 'declined') {
          transaction.update(docRef, {
            spotsRegistered: Math.max(0, (data.spotsRegistered || 1) - 1),
            spotsAvailable: data.spotsTotal ? data.spotsTotal - Math.max(0, (data.spotsRegistered || 1) - 1) : undefined
          })
        }
      })
    } catch (error) {
      console.error('Error updating registration status:', error)
      throw error
    }
  }
}

// Community Events Service
export class CommunityEventsService extends DatabaseService {
  constructor() {
    super('community_events')
  }

  async create(data: CreateCommunityEventData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        registered: 0,
        availableSlots: data.capacity || undefined
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating community event:', error)
      throw error
    }
  }

  async getEvent(id: string): Promise<CommunityEvent | null> {
    return this.getDoc<CommunityEvent>(id)
  }

  async update(id: string, data: UpdateCommunityEventData): Promise<void> {
    const docRef = doc(db, this.collectionName, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id)
    await updateDoc(docRef, {
      status: 'deleted',
      eventStatus: 'cancelled',
      updatedAt: serverTimestamp()
    })
  }

  async register(eventId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, eventId)
      
      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(docRef)
        if (!eventDoc.exists()) {
          throw new Error('Event not found')
        }

        const data = eventDoc.data() as CommunityEvent
        
        // Check if spots are available
        if (data.capacity && data.registered >= data.capacity) {
          throw new Error('No spots available')
        }

        // Update registration count and available slots
        transaction.update(docRef, {
          registered: (data.registered || 0) + 1,
          availableSlots: data.capacity ? data.capacity - ((data.registered || 0) + 1) : undefined,
          updatedAt: serverTimestamp()
        })
      })
    } catch (error) {
      console.error('Error registering for event:', error)
      throw error
    }
  }

  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, eventId)
      
      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(docRef)
        if (!eventDoc.exists()) {
          throw new Error('Event not found')
        }

        const data = eventDoc.data() as CommunityEvent
        
        // Update registration count and available slots
        transaction.update(docRef, {
          registered: Math.max(0, (data.registered || 1) - 1),
          availableSlots: data.capacity ? data.capacity - Math.max(0, (data.registered || 1) - 1) : undefined,
          updatedAt: serverTimestamp()
        })
      })
    } catch (error) {
      console.error('Error canceling event registration:', error)
      throw error
    }
  }

  subscribeToEvents(callback: (events: CommunityEvent[]) => void): Unsubscribe {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
      orderBy('startDate', 'asc')
    ]

    const processEvents = (events: CommunityEvent[]): CommunityEvent[] => {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const now = new Date()
      const nowInUserTz = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }))

      return events.map(event => {
        const startDate = event.startDate instanceof Timestamp ? event.startDate.toDate() : event.startDate
        const endDate = event.endDate instanceof Timestamp ? event.endDate.toDate() : event.endDate
        
        const startInUserTz = new Date(startDate.toLocaleString('en-US', { timeZone: userTimezone }))
        const endInUserTz = new Date(endDate.toLocaleString('en-US', { timeZone: userTimezone }))

        let eventStatus: 'upcoming' | 'ongoing' | 'completed'
        if (startInUserTz > nowInUserTz) {
          eventStatus = 'upcoming'
        } else if (endInUserTz > nowInUserTz) {
          eventStatus = 'ongoing'
        } else {
          eventStatus = 'completed'
        }

        return {
          ...event,
          eventStatus
        }
      })
    }

    return this.subscribeToCollection<CommunityEvent>((events) => {
      callback(processEvents(events))
    }, constraints)
  }
}

// Community Resources Service
class CommunityResourcesService {
  private readonly collectionName = 'community_resources'

  async getResources() {
    try {
      const q = query(collection(db, this.collectionName), where('status', '==', 'active'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as CommunityResource[]
    } catch (error) {
      console.error('Error fetching resources:', error)
      throw error
    }
  }

  async getResource(id: string): Promise<CommunityResource | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return null
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as CommunityResource
    } catch (error) {
      console.error('Error fetching resource:', error)
      throw error
    }
  }

  async create(data: CreateCommunityResourceData) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        views: 0,
        likes: 0,
        shares: 0,
        likedBy: {}
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating resource:', error)
      throw error
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await runTransaction(db, async (transaction) => {
        const resourceDoc = await transaction.get(docRef)
        if (!resourceDoc.exists()) {
          throw new Error('Resource not found')
        }
        const currentViews = resourceDoc.data().views || 0
        transaction.update(docRef, {
          views: currentViews + 1,
          updatedAt: serverTimestamp()
        })
      })
    } catch (error) {
      console.error('Error incrementing resource views:', error)
      throw error
    }
  }

  async toggleLike(id: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await runTransaction(db, async (transaction) => {
        const resourceDoc = await transaction.get(docRef)
        if (!resourceDoc.exists()) {
          throw new Error('Resource not found')
        }
        const data = resourceDoc.data()
        const currentLikes = data.likes || 0
        const likedBy = data.likedBy || {}
        
        if (likedBy[userId]) {
          delete likedBy[userId]
          transaction.update(docRef, {
            likes: currentLikes - 1,
            likedBy,
            updatedAt: serverTimestamp()
          })
        } else {
          likedBy[userId] = serverTimestamp()
          transaction.update(docRef, {
            likes: currentLikes + 1,
            likedBy,
            updatedAt: serverTimestamp()
          })
        }
      })
    } catch (error) {
      console.error('Error toggling resource like:', error)
      throw error
    }
  }

  async share(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await runTransaction(db, async (transaction) => {
        const resourceDoc = await transaction.get(docRef)
        if (!resourceDoc.exists()) {
          throw new Error('Resource not found')
        }
        const currentShares = resourceDoc.data().shares || 0
        transaction.update(docRef, {
          shares: currentShares + 1,
          updatedAt: serverTimestamp()
        })
      })
    } catch (error) {
      console.error('Error incrementing resource shares:', error)
      throw error
    }
  }

  subscribeToResources(
    callback: (resources: CommunityResource[]) => void,
    filter?: string
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    ]

    if (filter && filter !== 'all') {
      constraints.push(where('category', '==', filter))
    }

    return this.subscribeToCollection<CommunityResource>(callback, constraints)
  }

  async getPopularResources(limit: number = 5): Promise<CommunityResource[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('views', 'desc'),
        limit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CommunityResource[]
    } catch (error) {
      console.error('Error getting popular resources:', error)
      throw error
    }
  }

  async likeResource(resourceId: string, userId: string) {
    try {
      const resourceRef = doc(db, this.collectionName, resourceId)
      await updateDoc(resourceRef, {
        likes: increment(1),
        [`likedBy.${userId}`]: true,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error liking resource:', error)
      throw error
    }
  }

  async shareResource(resourceId: string) {
    try {
      const resourceRef = doc(db, this.collectionName, resourceId)
      await updateDoc(resourceRef, {
        shares: increment(1),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sharing resource:', error)
      throw error
    }
  }

  async viewResource(resourceId: string) {
    try {
      const resourceRef = doc(db, this.collectionName, resourceId)
      await updateDoc(resourceRef, {
        views: increment(1),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating view count:', error)
      throw error
    }
  }
}

// Service Instances
export const volunteerService = new VolunteerService()
export const communityEventsService = new CommunityEventsService()
export const communityResourcesService = new CommunityResourcesService()
