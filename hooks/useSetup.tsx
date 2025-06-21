'use client'

import { useState, useEffect } from 'react'
import { collection, query, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

interface SetupState {
  needsSetup: boolean
  loading: boolean
  error: string | null
}

export const useSetup = (): SetupState => {
  const [needsSetup, setNeedsSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Only check setup when auth is not loading
    if (!authLoading) {
      checkIfSetupNeeded()
    }
  }, [authLoading, user]) // Re-check when auth state changes

  const checkIfSetupNeeded = async () => {
    try {
      setLoading(true)
      setError(null)

      // Add a small delay to ensure Firestore is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check if any users exist in the system
      const usersQuery = query(collection(db, 'users'), limit(1))
      const usersSnapshot = await getDocs(usersQuery)

      // If no users exist in Firestore at all, setup is needed
      if (usersSnapshot.empty) {
        setNeedsSetup(true)
        return
      }

      // If users exist, check if current user (if any) already has a profile
      if (user) {
        // User is logged in, check if they have a profile in Firestore
        // If they don't, they might need setup (edge case handling)
        setNeedsSetup(false)
      } else {
        // No user logged in but users exist in system - no setup needed
        setNeedsSetup(false)
      }
    } catch (err: any) {
      console.error('Error checking setup status:', err)
      setError('Failed to check setup status')
      // Default to not needing setup on error to avoid blocking access
      setNeedsSetup(false)
    } finally {
      setLoading(false)
    }
  }

  return {
    needsSetup,
    loading,
    error
  }
} 