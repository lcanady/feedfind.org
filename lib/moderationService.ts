import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// Types for moderation
export interface FlaggedContent {
  id: string
  type: 'review' | 'location' | 'provider' | 'comment'
  content: string
  authorId: string
  authorName: string
  locationId?: string
  locationName?: string
  flaggedAt: Date
  flaggedBy: string
  flagReason: string
  status: 'pending' | 'approved' | 'rejected'
  moderatorId?: string
  moderatorNotes?: string
  moderatedAt?: Date
}

export interface ContentAnalysis {
  isInappropriate: boolean
  confidence: number
  reasons: string[]
}

export interface ModerationStats {
  totalFlagged: number
  pendingReview: number
  approvedToday: number
  rejectedToday: number
  averageReviewTime: number
  topFlagReasons: Array<{ reason: string; count: number }>
}

export interface ModerationFilters {
  type?: 'review' | 'location' | 'provider' | 'comment'
  status?: 'pending' | 'approved' | 'rejected'
  flagReason?: string
  dateFrom?: Date
  dateTo?: Date
}

// Get flagged content with optional filters
export const getFlaggedContent = async (filters?: ModerationFilters): Promise<FlaggedContent[]> => {
  try {
    let q = query(collection(db, 'flaggedContent'), orderBy('flaggedAt', 'desc'))

    // Apply filters
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type))
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters?.flagReason) {
      q = query(q, where('flagReason', '==', filters.flagReason))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      flaggedAt: doc.data().flaggedAt.toDate(),
      moderatedAt: doc.data().moderatedAt?.toDate(),
    } as FlaggedContent))
  } catch (error) {
    console.error('Error fetching flagged content:', error)
    throw new Error('Failed to fetch flagged content')
  }
}

// Analyze content for inappropriate material
export const analyzeContent = async (content: string): Promise<ContentAnalysis> => {
  // Simple rule-based content analysis (in production, would use ML service)
  const inappropriateWords = [
    'sucks', 'idiots', 'stupid', 'hate', 'terrible', 'awful', 
    'disgusting', 'filthy', 'nasty', 'worthless'
  ]
  
  const offensiveWords = [
    'damn', 'hell', 'crap', 'jerk', 'moron', 'loser'
  ]

  const contentLower = content.toLowerCase()
  const foundInappropriate = inappropriateWords.some(word => contentLower.includes(word))
  const foundOffensive = offensiveWords.some(word => contentLower.includes(word))

  const reasons: string[] = []
  if (foundInappropriate) reasons.push('inappropriate_language')
  if (foundOffensive) reasons.push('offensive_content')

  return {
    isInappropriate: foundInappropriate || foundOffensive,
    confidence: foundInappropriate ? 0.8 : foundOffensive ? 0.6 : 0.1,
    reasons,
  }
}

// Flag content for review
export const flagContent = async (
  contentId: string,
  contentType: 'review' | 'location' | 'provider' | 'comment',
  content: string,
  authorId: string,
  authorName: string,
  flaggedBy: string,
  flagReason: string,
  locationId?: string,
  locationName?: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'flaggedContent'), {
      contentId,
      type: contentType,
      content,
      authorId,
      authorName,
      locationId,
      locationName,
      flaggedAt: Timestamp.now(),
      flaggedBy,
      flagReason,
      status: 'pending',
    })
  } catch (error) {
    console.error('Error flagging content:', error)
    throw new Error('Failed to flag content')
  }
}

// Approve flagged content
export const approveContent = async (
  flaggedContentId: string,
  moderatorId: string,
  moderatorNotes?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'flaggedContent', flaggedContentId), {
      status: 'approved',
      moderatorId,
      moderatorNotes: moderatorNotes || '',
      moderatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error approving content:', error)
    throw new Error('Failed to approve content')
  }
}

// Reject flagged content
export const rejectContent = async (
  flaggedContentId: string,
  moderatorId: string,
  moderatorNotes: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'flaggedContent', flaggedContentId), {
      status: 'rejected',
      moderatorId,
      moderatorNotes,
      moderatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error rejecting content:', error)
    throw new Error('Failed to reject content')
  }
}

// Bulk approve content
export const bulkApproveContent = async (
  flaggedContentIds: string[],
  moderatorId: string,
  moderatorNotes?: string
): Promise<void> => {
  try {
    const promises = flaggedContentIds.map(id =>
      updateDoc(doc(db, 'flaggedContent', id), {
        status: 'approved',
        moderatorId,
        moderatorNotes: moderatorNotes || 'Bulk approved',
        moderatedAt: Timestamp.now(),
      })
    )
    await Promise.all(promises)
  } catch (error) {
    console.error('Error bulk approving content:', error)
    throw new Error('Failed to bulk approve content')
  }
}

// Bulk reject content
export const bulkRejectContent = async (
  flaggedContentIds: string[],
  moderatorId: string,
  moderatorNotes: string
): Promise<void> => {
  try {
    const promises = flaggedContentIds.map(id =>
      updateDoc(doc(db, 'flaggedContent', id), {
        status: 'rejected',
        moderatorId,
        moderatorNotes,
        moderatedAt: Timestamp.now(),
      })
    )
    await Promise.all(promises)
  } catch (error) {
    console.error('Error bulk rejecting content:', error)
    throw new Error('Failed to bulk reject content')
  }
}

// Get moderation statistics
export const getModerationStats = async (): Promise<ModerationStats> => {
  try {
    // Get all flagged content
    const allFlaggedQuery = query(collection(db, 'flaggedContent'))
    const allFlaggedSnapshot = await getDocs(allFlaggedQuery)
    const totalFlagged = allFlaggedSnapshot.size

    // Get pending content
    const pendingQuery = query(
      collection(db, 'flaggedContent'),
      where('status', '==', 'pending')
    )
    const pendingSnapshot = await getDocs(pendingQuery)
    const pendingReview = pendingSnapshot.size

    // Get today's approvals and rejections
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = Timestamp.fromDate(today)

    const approvedTodayQuery = query(
      collection(db, 'flaggedContent'),
      where('status', '==', 'approved'),
      where('moderatedAt', '>=', todayTimestamp)
    )
    const approvedTodaySnapshot = await getDocs(approvedTodayQuery)
    const approvedToday = approvedTodaySnapshot.size

    const rejectedTodayQuery = query(
      collection(db, 'flaggedContent'),
      where('status', '==', 'rejected'),
      where('moderatedAt', '>=', todayTimestamp)
    )
    const rejectedTodaySnapshot = await getDocs(rejectedTodayQuery)
    const rejectedToday = rejectedTodaySnapshot.size

    // Calculate average review time (simplified)
    const averageReviewTime = 45 // minutes - would calculate from actual data

    // Get top flag reasons
    const flagReasons: Record<string, number> = {}
    allFlaggedSnapshot.docs.forEach(doc => {
      const reason = doc.data().flagReason
      flagReasons[reason] = (flagReasons[reason] || 0) + 1
    })

    const topFlagReasons = Object.entries(flagReasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalFlagged,
      pendingReview,
      approvedToday,
      rejectedToday,
      averageReviewTime,
      topFlagReasons,
    }
  } catch (error) {
    console.error('Error getting moderation stats:', error)
    throw new Error('Failed to get moderation statistics')
  }
} 