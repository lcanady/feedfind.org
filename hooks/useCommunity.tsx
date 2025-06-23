'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Unsubscribe, Timestamp } from 'firebase/firestore'
import {
  volunteerService,
  communityEventsService,
  communityResourcesService
} from '../lib/communityService'
import { forumService } from '../lib/forumService'
import type {
  VolunteerOpportunity,
  CommunityEvent,
  CommunityResource,
  ForumPost
} from '../types/database'
import { useAuth } from '@/hooks/useAuth'

// Volunteer Opportunities Hook
export function useVolunteerOpportunities(filter?: string) {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = volunteerService.subscribeToOpportunities((updatedOpportunities) => {
      setOpportunities(updatedOpportunities)
      setLoading(false)
    }, filter)

    return () => unsubscribe()
  }, [filter])

  const registerForOpportunity = useCallback(async (opportunityId: string) => {
    if (!user) throw new Error('Must be logged in to register')
    await volunteerService.register(opportunityId, user.uid)
  }, [user])

  const cancelRegistration = useCallback(async (opportunityId: string) => {
    if (!user) throw new Error('Must be logged in to cancel registration')
    await volunteerService.cancelRegistration(opportunityId, user.uid)
  }, [user])

  const isRegistered = useCallback((opportunity: VolunteerOpportunity) => {
    if (!user) return false
    return !!opportunity.registrations?.[user.uid]
  }, [user])

  return {
    opportunities,
    loading,
    error,
    registerForOpportunity,
    cancelRegistration,
    isRegistered
  }
}

// Single Volunteer Opportunity Hook
export function useVolunteerOpportunity(opportunityId: string) {
  const [opportunity, setOpportunity] = useState<VolunteerOpportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = volunteerService.subscribeToOpportunity(opportunityId, (updatedOpportunity) => {
      setOpportunity(updatedOpportunity)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [opportunityId])

  const register = useCallback(async () => {
    if (!user) throw new Error('Must be logged in to register')
    await volunteerService.register(opportunityId, user.uid)
  }, [opportunityId, user])

  const cancelRegistration = useCallback(async () => {
    if (!user) throw new Error('Must be logged in to cancel registration')
    await volunteerService.cancelRegistration(opportunityId, user.uid)
  }, [opportunityId, user])

  const isRegistered = useMemo(() => {
    if (!user || !opportunity) return false
    return !!opportunity.registrations?.[user.uid]
  }, [opportunity, user])

  return {
    opportunity,
    loading,
    error,
    register,
    cancelRegistration,
    isRegistered
  }
}

// Community Events Hook
export function useCommunityEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = communityEventsService.subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { events, loading, error }
}

// Community Resources Hook
export function useCommunityResources(filter?: string) {
  const [resources, setResources] = useState<CommunityResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = communityResourcesService.subscribeToResources((updatedResources) => {
      setResources(updatedResources)
      setLoading(false)
    }, filter)

    return () => unsubscribe()
  }, [filter])

  const likeResource = useCallback(async (resourceId: string) => {
    if (!user) throw new Error('Must be logged in to like resources')
    try {
      await communityResourcesService.toggleLike(resourceId, user.uid)
    } catch (error) {
      console.error('Error liking resource:', error)
      throw error
    }
  }, [user])

  const shareResource = useCallback(async (resourceId: string) => {
    try {
      await communityResourcesService.share(resourceId)
    } catch (error) {
      console.error('Error sharing resource:', error)
      throw error
    }
  }, [])

  const viewResource = useCallback(async (resourceId: string) => {
    try {
      await communityResourcesService.incrementViews(resourceId)
    } catch (error) {
      console.error('Error incrementing resource views:', error)
    }
  }, [])

  const isLiked = useCallback((resource: CommunityResource) => {
    if (!user || !resource.likedBy) return false
    return !!resource.likedBy[user.uid]
  }, [user])

  return {
    resources,
    loading,
    error,
    likeResource,
    shareResource,
    viewResource,
    isLiked
  }
}

// Forum Posts Hook
export function useForumPosts(category?: string) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = forumService.subscribeToForumPosts((updatedPosts) => {
      setPosts(updatedPosts)
      setLoading(false)
    }, category)

    return () => unsubscribe()
  }, [category])

  return { posts, loading, error }
}

// Combined Community Data Hook
export function useCommunityData() {
  const { opportunities, loading: loadingOpportunities } = useVolunteerOpportunities()
  const { events, loading: loadingEvents } = useCommunityEvents()
  const { resources, loading: loadingResources } = useCommunityResources()

  // Compute loading state
  const loading = loadingOpportunities || loadingEvents || loadingResources

  // Mock stats for now - these should come from a real stats service later
  const stats = {
    totalMembers: 1234,
    volunteerHours: 5678,
    totalResources: resources.length,
    totalEvents: events.length
  }

  // Get recent activity
  const recentActivity = useMemo(() => {
    const allActivity = [
      ...opportunities.map(o => ({ 
        type: 'opportunity', 
        data: o, 
        date: o.createdAt,
        author: o.organization || 'Anonymous',
        title: o.title
      })),
      ...events.map(e => ({ 
        type: 'event', 
        data: e, 
        date: e.createdAt,
        author: e.organization || 'Anonymous',
        title: e.title
      })),
      ...resources.map(r => ({ 
        type: 'resource', 
        data: r, 
        date: r.createdAt,
        author: r.author || 'Anonymous',
        title: r.title
      }))
    ]
    return allActivity
      .sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toMillis() : a.date.getTime()
        const dateB = b.date instanceof Timestamp ? b.date.toMillis() : b.date.getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [opportunities, events, resources])

  // Get recent forum posts (mock data for now)
  const recentPosts: ForumPost[] = []

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter(event => {
        const eventDate = event.startDate instanceof Timestamp ? 
          event.startDate.toDate() : 
          event.startDate
        return eventDate > now
      })
      .sort((a, b) => {
        const dateA = a.startDate instanceof Timestamp ? a.startDate.toDate() : a.startDate
        const dateB = b.startDate instanceof Timestamp ? b.startDate.toDate() : b.startDate
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 3)
  }, [events])

  // Get featured opportunities
  const featuredOpportunities = useMemo(() => {
    return opportunities
      .filter(opp => opp.urgency === 'urgent' || opp.urgency === 'high')
      .slice(0, 3)
  }, [opportunities])

  // Get popular resources
  const popularResources = useMemo(() => {
    return resources
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3)
  }, [resources])

  return {
    stats,
    recentActivity,
    recentPosts,
    upcomingEvents,
    featuredOpportunities,
    popularResources,
    loading
  }
} 