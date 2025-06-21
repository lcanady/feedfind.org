import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDoc,
  increment
} from 'firebase/firestore'
import { db } from './firebase'
import type { Review, ReviewSubmission, ReviewFilter } from '@/types/database'

export interface SubmitReviewData {
  locationId: string
  userId: string
  rating: number
  reviewText: string
  timestamp: Date
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

/**
 * Submit a new review for a location
 */
export const submitReview = async (reviewData: SubmitReviewData): Promise<{ success: boolean; reviewId?: string }> => {
  try {
    // Validate input data
    if (!reviewData.locationId || !reviewData.userId) {
      throw new Error('Location ID and User ID are required')
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    if (!reviewData.reviewText.trim() || reviewData.reviewText.length < 10) {
      throw new Error('Review text must be at least 10 characters')
    }

    if (reviewData.reviewText.length > 1000) {
      throw new Error('Review text cannot exceed 1000 characters')
    }

    // Check for existing review from this user for this location
    const existingReviewQuery = query(
      collection(db, 'reviews'),
      where('locationId', '==', reviewData.locationId),
      where('userId', '==', reviewData.userId),
      limit(1)
    )

    const existingReviews = await getDocs(existingReviewQuery)
    if (!existingReviews.empty) {
      throw new Error('You have already reviewed this location')
    }

    // Prepare review document
    const reviewDoc: ReviewSubmission = {
      locationId: reviewData.locationId,
      userId: reviewData.userId,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText.trim(),
      timestamp: serverTimestamp(),
      isModerated: false,
      isApproved: true, // Auto-approve for now, can be changed for manual moderation
      helpfulCount: 0,
      reportCount: 0
    }

    // Add review to Firestore
    const docRef = await addDoc(collection(db, 'reviews'), reviewDoc)

    // Update location statistics
    await updateLocationStats(reviewData.locationId, reviewData.rating)

    return { success: true, reviewId: docRef.id }
  } catch (error) {
    console.error('Error submitting review:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Failed to submit review')
  }
}

/**
 * Fetch reviews for a specific location
 */
export const fetchLocationReviews = async (
  locationId: string, 
  options: ReviewFilter = {}
): Promise<Review[]> => {
  try {
    const {
      sortBy = 'timestamp',
      sortOrder = 'desc',
      limitCount = 10,
      minRating,
      maxRating
    } = options

    let reviewQuery = query(
      collection(db, 'reviews'),
      where('locationId', '==', locationId),
      where('isApproved', '==', true)
    )

    // Add rating filters if specified
    if (minRating !== undefined) {
      reviewQuery = query(reviewQuery, where('rating', '>=', minRating))
    }
    if (maxRating !== undefined) {
      reviewQuery = query(reviewQuery, where('rating', '<=', maxRating))
    }

    // Add sorting
    reviewQuery = query(reviewQuery, orderBy(sortBy, sortOrder))

    // Add limit
    if (limitCount) {
      reviewQuery = query(reviewQuery, limit(limitCount))
    }

    const querySnapshot = await getDocs(reviewQuery)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reviews.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Review)
    })

    return reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    throw new Error('Failed to fetch reviews')
  }
}

/**
 * Get review statistics for a location
 */
export const getLocationReviewStats = async (locationId: string): Promise<ReviewStats> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('locationId', '==', locationId),
      where('isApproved', '==', true)
    )

    const querySnapshot = await getDocs(reviewsQuery)
    
    if (querySnapshot.empty) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    let totalRating = 0
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const rating = data.rating
      totalRating += rating
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1
    })

    const totalReviews = querySnapshot.size
    const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0

    return {
      averageRating,
      totalReviews,
      ratingDistribution
    }
  } catch (error) {
    console.error('Error fetching review stats:', error)
    throw new Error('Failed to fetch review statistics')
  }
}

/**
 * Mark a review as helpful
 */
export const markReviewHelpful = async (reviewId: string, userId: string): Promise<void> => {
  try {
    // Check if user has already marked this review as helpful
    const helpfulQuery = query(
      collection(db, 'reviewHelpful'),
      where('reviewId', '==', reviewId),
      where('userId', '==', userId),
      limit(1)
    )

    const existingHelpful = await getDocs(helpfulQuery)
    if (!existingHelpful.empty) {
      throw new Error('You have already marked this review as helpful')
    }

    // Add helpful record
    await addDoc(collection(db, 'reviewHelpful'), {
      reviewId,
      userId,
      timestamp: serverTimestamp()
    })

    // Increment helpful count on review
    const reviewRef = doc(db, 'reviews', reviewId)
    await updateDoc(reviewRef, {
      helpfulCount: increment(1)
    })
  } catch (error) {
    console.error('Error marking review as helpful:', error)
    throw new Error('Failed to mark review as helpful')
  }
}

/**
 * Report a review for inappropriate content
 */
export const reportReview = async (
  reviewId: string, 
  userId: string, 
  reason: string
): Promise<void> => {
  try {
    // Check if user has already reported this review
    const reportQuery = query(
      collection(db, 'reviewReports'),
      where('reviewId', '==', reviewId),
      where('userId', '==', userId),
      limit(1)
    )

    const existingReport = await getDocs(reportQuery)
    if (!existingReport.empty) {
      throw new Error('You have already reported this review')
    }

    // Add report record
    await addDoc(collection(db, 'reviewReports'), {
      reviewId,
      userId,
      reason,
      timestamp: serverTimestamp(),
      status: 'pending'
    })

    // Increment report count on review
    const reviewRef = doc(db, 'reviews', reviewId)
    await updateDoc(reviewRef, {
      reportCount: increment(1)
    })

    // If report count exceeds threshold, flag for moderation
    const reviewDoc = await getDoc(reviewRef)
    if (reviewDoc.exists()) {
      const data = reviewDoc.data()
      if (data.reportCount >= 3) {
        await updateDoc(reviewRef, {
          isApproved: false,
          needsModeration: true
        })
      }
    }
  } catch (error) {
    console.error('Error reporting review:', error)
    throw new Error('Failed to report review')
  }
}

/**
 * Update location review statistics
 */
const updateLocationStats = async (locationId: string, newRating: number): Promise<void> => {
  try {
    const locationRef = doc(db, 'locations', locationId)
    const locationDoc = await getDoc(locationRef)

    if (locationDoc.exists()) {
      const currentData = locationDoc.data()
      const currentAverage = currentData.averageRating || 0
      const currentCount = currentData.reviewCount || 0

      // Calculate new average rating
      const newCount = currentCount + 1
      const newAverage = ((currentAverage * currentCount) + newRating) / newCount

      await updateDoc(locationRef, {
        averageRating: Math.round(newAverage * 10) / 10,
        reviewCount: newCount,
        lastReviewDate: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error updating location stats:', error)
    // Don't throw error here as it's not critical for review submission
  }
}

/**
 * Get reviews by user
 */
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )

    const querySnapshot = await getDocs(reviewsQuery)
    const reviews: Review[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reviews.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Review)
    })

    return reviews
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    throw new Error('Failed to fetch user reviews')
  }
}

/**
 * Delete a review (only by the author or admin)
 */
export const deleteReview = async (reviewId: string, userId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId)
    const reviewDoc = await getDoc(reviewRef)

    if (!reviewDoc.exists()) {
      throw new Error('Review not found')
    }

    const reviewData = reviewDoc.data()
    
    // Check if user is the author (admin check would be added here)
    if (reviewData.userId !== userId) {
      throw new Error('You can only delete your own reviews')
    }

    // Soft delete by marking as deleted
    await updateDoc(reviewRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      isApproved: false
    })

    // Update location statistics
    const locationRef = doc(db, 'locations', reviewData.locationId)
    const locationDoc = await getDoc(locationRef)

    if (locationDoc.exists()) {
      const locationData = locationDoc.data()
      const currentCount = locationData.reviewCount || 0
      
      if (currentCount > 1) {
        // Recalculate average without this review
        const currentAverage = locationData.averageRating || 0
        const newCount = currentCount - 1
        const newTotal = (currentAverage * currentCount) - reviewData.rating
        const newAverage = newTotal / newCount

        await updateDoc(locationRef, {
          averageRating: Math.round(newAverage * 10) / 10,
          reviewCount: newCount
        })
      } else {
        // This was the only review
        await updateDoc(locationRef, {
          averageRating: 0,
          reviewCount: 0
        })
      }
    }
  } catch (error) {
    console.error('Error deleting review:', error)
    throw new Error('Failed to delete review')
  }
} 