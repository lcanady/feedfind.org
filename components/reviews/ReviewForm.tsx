'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { submitReview } from '../../lib/reviewService'

interface ReviewFormProps {
  locationId: string
  locationName: string
  onReviewSubmitted: () => void
  onCancel: () => void
}

interface FormData {
  rating: number | null
  reviewText: string
}

interface FormErrors {
  rating?: string
  reviewText?: string
  general?: string
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  locationId,
  locationName,
  onReviewSubmitted,
  onCancel
}) => {
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    rating: null,
    reviewText: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Sanitize HTML input to prevent XSS
  const sanitizeInput = (input: string): string => {
    // Remove script tags and their content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove any remaining HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '')
    // Clean up extra whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim()
    return sanitized
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.rating) {
      newErrors.rating = 'Please select a rating'
    }

    if (!formData.reviewText.trim()) {
      newErrors.reviewText = 'Please enter a review'
    } else if (formData.reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters'
    } else if (formData.reviewText.length > 1000) {
      newErrors.reviewText = 'Review cannot exceed 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
    setErrors(prev => ({ ...prev, rating: undefined }))
    setStatusMessage(`${rating} out of 5 stars selected`)
  }

  // Handle review text change
  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setFormData(prev => ({ ...prev, reviewText: sanitizedValue }))
    setErrors(prev => ({ ...prev, reviewText: undefined }))
    
    // Validate length immediately for better UX
    if (sanitizedValue.length > 1000) {
      setErrors(prev => ({ ...prev, reviewText: 'Review cannot exceed 1000 characters' }))
    }
  }

  // Handle review text blur for validation
  const handleReviewTextBlur = () => {
    if (formData.reviewText.trim() && formData.reviewText.trim().length < 10) {
      setErrors(prev => ({ ...prev, reviewText: 'Review must be at least 10 characters' }))
    } else if (formData.reviewText.length > 1000) {
      setErrors(prev => ({ ...prev, reviewText: 'Review cannot exceed 1000 characters' }))
    }
  }

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return // Prevent duplicate submissions
    
    if (!validateForm()) {
      setStatusMessage('Please fix the errors below')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Submitting review...')
    setErrors({})

    try {
      await submitReview({
        locationId,
        userId: user!.uid,
        rating: formData.rating!,
        reviewText: formData.reviewText.trim(),
        timestamp: new Date()
      })

      setStatusMessage('Review submitted successfully!')
      onReviewSubmitted()
    } catch (error) {
      console.error('Failed to submit review:', error)
      
      let errorMessage = 'Failed to submit review. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait before submitting another review.'
        }
      }
      
      setErrors({ general: errorMessage })
      setStatusMessage(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, locationId, user, onReviewSubmitted])

  // Handle cancel action
  const handleCancel = () => {
    const hasContent = formData.rating !== null || formData.reviewText.trim().length > 0
    
    if (hasContent) {
      setShowCancelConfirm(true)
    } else {
      onCancel()
    }
  }

  // Handle confirmed cancel
  const handleConfirmCancel = () => {
    setShowCancelConfirm(false)
    onCancel()
  }

  // Handle keep editing
  const handleKeepEditing = () => {
    setShowCancelConfirm(false)
  }

  // Show loading state during auth
  if (authLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Please log in to leave a review
        </h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to share your experience with {locationName}.
        </p>
        <button
          type="button"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {/* Navigate to login */}}
        >
          Log In
        </button>
      </div>
    )
  }

  // Show error for invalid location
  if (!locationId || !locationName) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          Invalid Location
        </h2>
        <p className="text-red-600">
          Unable to load review form. Please try again.
        </p>
      </div>
    )
  }

  // Show cancel confirmation dialog
  if (showCancelConfirm) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Discard Review?
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to discard your review? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={handleConfirmCancel}
          >
            Discard
          </button>
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={handleKeepEditing}
          >
            Keep Editing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Leave a Review for {locationName}
      </h2>
      
      <form 
        onSubmit={handleSubmit}
        aria-label="Leave a review for this location"
        className="space-y-6"
      >
        {/* Status message for screen readers */}
        <div 
          role="status" 
          aria-live="polite" 
          className="sr-only"
        >
          {statusMessage}
        </div>

        {/* Rating Section */}
        <div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">* (required)</span>
            </legend>
            <div 
              role="radiogroup" 
              aria-label="Rating selection"
              className="flex space-x-2"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  className="cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={formData.rating === star}
                    onChange={() => handleRatingChange(star)}
                    className="sr-only"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  />
                  <span 
                    className={`text-2xl ${
                      formData.rating && star <= formData.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </span>
                </label>
              ))}
            </div>
            {formData.rating && (
              <p className="text-sm text-gray-600 mt-1">
                {formData.rating} out of 5 stars
              </p>
            )}
            {errors.rating && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.rating}
              </p>
            )}
          </fieldset>
        </div>

        {/* Review Text Section */}
        <div>
          <label 
            htmlFor="reviewText"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Review Text <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-2">
            Share your experience to help others in the community
          </p>
          <textarea
            id="reviewText"
            name="reviewText"
            rows={4}
            value={formData.reviewText}
            onChange={handleReviewTextChange}
            onBlur={handleReviewTextBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell others about your experience..."
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <div>
              {errors.reviewText && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.reviewText}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formData.reviewText.length} / 1000 characters
            </p>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700" role="alert">
              {errors.general}
            </p>
            {errors.general.includes('Network') && (
              <button
                type="button"
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 