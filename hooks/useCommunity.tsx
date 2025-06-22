'use client'

import { useState, useEffect, useCallback } from 'react'
import { Unsubscribe } from 'firebase/firestore'
import {
  forumService,
  volunteerService,
  communityEventsService,
  communityResourcesService,
  communityStatsService
} from '../lib/communityService'
import type {
  ForumPost,
  VolunteerOpportunity,
  CommunityEvent,
  CommunityResource
} from '../types/database'

// Forum Hook
export function useForumPosts(category?: string) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedPosts = await forumService.getPosts(category)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error fetching forum posts:', error)
      setError('Failed to load forum posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, error, refetch: fetchPosts }
}

// Volunteer Opportunities Hook
export function useVolunteerOpportunities(filter?: string) {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedOpportunities = await volunteerService.getOpportunities(filter)
      setOpportunities(fetchedOpportunities)
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error)
      setError('Failed to load volunteer opportunities')
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Real-time subscription
  useEffect(() => {
    if (!filter || filter === 'all') {
      const unsubscribe = volunteerService.subscribeToOpportunities((updatedOpportunities) => {
        setOpportunities(updatedOpportunities)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [filter])

  return { 
    opportunities, 
    loading, 
    error, 
    refetch: fetchOpportunities 
  }
}

// Community Events Hook
export function useCommunityEvents(filter?: string) {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedEvents = await communityEventsService.getEvents(filter)
      setEvents(fetchedEvents)
    } catch (error) {
      console.error('Error fetching community events:', error)
      setError('Failed to load community events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Real-time subscription
  useEffect(() => {
    if (!filter || filter === 'all') {
      const unsubscribe = communityEventsService.subscribeToEvents((updatedEvents) => {
        setEvents(updatedEvents)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [filter])

  return { 
    events, 
    loading, 
    error, 
    refetch: fetchEvents 
  }
}

// Community Resources Hook
export function useCommunityResources(category?: string) {
  const [resources, setResources] = useState<CommunityResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedResources = await communityResourcesService.getResources(category)
      setResources(fetchedResources)
    } catch (error) {
      console.error('Error fetching community resources:', error)
      setError('Failed to load community resources')
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  // Real-time subscription
  useEffect(() => {
    if (!category || category === 'all') {
      const unsubscribe = communityResourcesService.subscribeToResources((updatedResources) => {
        setResources(updatedResources)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [category])

  return { 
    resources, 
    loading, 
    error, 
    refetch: fetchResources 
  }
}

// Community Stats Hook
export function useCommunityStats() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPosts: 0,
    totalResources: 0,
    totalEvents: 0,
    volunteerHours: 0
  })
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    type: 'post' | 'resource' | 'event' | 'opportunity'
    title: string
    author: string
    date: Date
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [statsData, activityData] = await Promise.all([
          communityStatsService.getCommunityStats(),
          communityStatsService.getRecentActivity()
        ])
        
        setStats(statsData)
        setRecentActivity(activityData)
      } catch (error) {
        console.error('Error fetching community stats:', error)
        setError('Failed to load community statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { 
    stats, 
    recentActivity, 
    loading, 
    error 
  }
}

// Combined Community Hook for the main community page
export function useCommunityData() {
  const { stats, recentActivity, loading: statsLoading } = useCommunityStats()
  const { posts, loading: postsLoading } = useForumPosts()
  const { opportunities, loading: opportunitiesLoading } = useVolunteerOpportunities()
  const { events, loading: eventsLoading } = useCommunityEvents()
  const { resources, loading: resourcesLoading } = useCommunityResources()

  const loading = statsLoading || postsLoading || opportunitiesLoading || eventsLoading || resourcesLoading

  return {
    stats,
    recentActivity,
    recentPosts: posts.slice(0, 3),
    upcomingEvents: events.slice(0, 3),
    featuredOpportunities: opportunities.slice(0, 3),
    popularResources: resources.slice(0, 3),
    loading
  }
} 