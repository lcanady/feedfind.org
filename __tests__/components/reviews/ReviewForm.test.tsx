import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from '../../../components/reviews/ReviewForm'
import { useAuth } from '../../../hooks/useAuth'
import { submitReview } from '../../../lib/reviewService'

// Mock dependencies
jest.mock('../../../hooks/useAuth')
jest.mock('../../../lib/reviewService')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockSubmitReview = submitReview as jest.MockedFunction<typeof submitReview>

describe('ReviewForm', () => {
  const mockUser = {
    uid: 'user123',
    email: 'user@example.com',
    displayName: 'Test User'
  }

  const mockLocation = {
    id: 'location123',
    name: 'Downtown Food Bank',
    address: '123 Main St, New York, NY 10001'
  }

  const defaultProps = {
    locationId: mockLocation.id,
    locationName: mockLocation.name,
    onReviewSubmitted: jest.fn(),
    onCancel: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    })
    mockSubmitReview.mockResolvedValue({ success: true })
  })

  describe('Accessibility and Structure', () => {
    it('should render with proper accessibility attributes', () => {
      render(<ReviewForm {...defaultProps} />)

      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByRole('form')).toHaveAccessibleName(/leave a review/i)
      
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/leave a review/i)
      
      // Check for proper form labels
      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/review text/i)).toBeInTheDocument()
      
      // Check for required field indicators
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })

    it('should have proper keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      // Tab through all interactive elements
      await user.tab()
      expect(screen.getByLabelText(/1 star/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/review text/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /submit review/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus()
    })

    it('should support screen reader announcements', () => {
      render(<ReviewForm {...defaultProps} />)

      // Check for live region for form status
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
      
      // Check for proper field descriptions
      expect(screen.getByText(/share your experience/i)).toBeInTheDocument()
    })
  })

  describe('Rating System', () => {
    it('should render star rating with proper ARIA labels', () => {
      render(<ReviewForm {...defaultProps} />)

      const ratingGroup = screen.getByRole('radiogroup', { name: /rating/i })
      expect(ratingGroup).toBeInTheDocument()
      
      // Check for 5 star options
      const starOptions = screen.getAllByRole('radio')
      expect(starOptions).toHaveLength(5)
      
      // Check ARIA labels for each star
      expect(screen.getByLabelText(/1 star/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/2 stars/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/3 stars/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/4 stars/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/5 stars/i)).toBeInTheDocument()
    })

    it('should handle star rating selection', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const fourStarOption = screen.getByLabelText(/4 stars/i)
      await user.click(fourStarOption)
      
      expect(fourStarOption).toBeChecked()
      
      // Visual feedback should be provided (not in status region)
      expect(screen.getByText(/4 out of 5 stars/i, { ignore: '[role="status"]' })).toBeInTheDocument()
    })

    it('should support keyboard navigation for star rating', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const ratingGroup = screen.getByRole('radiogroup')
      ratingGroup.focus()
      
      // Use arrow keys to navigate
      await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}') // Navigate to 4 stars
      
      const fourStarOption = screen.getByLabelText(/4 stars/i)
      expect(fourStarOption).toBeChecked()
    })

    it('should require rating selection before submission', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Great service!')
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/please select a rating/i)).toBeInTheDocument()
      expect(mockSubmitReview).not.toHaveBeenCalled()
    })
  })

  describe('Review Text Input', () => {
    it('should validate review text length', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const reviewText = screen.getByLabelText(/review text/i)
      
      // Test minimum length requirement
      await user.type(reviewText, 'Too short')
      await user.tab() // Trigger blur validation
      
      expect(screen.getByText(/review must be at least 10 characters/i)).toBeInTheDocument()
      
      // Test maximum length limit
      const longText = 'a'.repeat(1001) // Exceed 1000 character limit
      await user.clear(reviewText)
      
      // Use fireEvent to bypass maxLength restriction for testing
      fireEvent.change(reviewText, { target: { value: longText } })
      
      expect(screen.getByText(/review cannot exceed 1000 characters/i)).toBeInTheDocument()
    })

    it('should show character count', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'This is a test review')
      
      await waitFor(() => {
        expect(screen.getByText(/\d+.*\/.*1000.*characters/i)).toBeInTheDocument()
      })
    })

    it('should handle line breaks and formatting', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const reviewText = screen.getByLabelText(/review text/i)
      const textWithBreaks = 'First line\n\nSecond paragraph\nThird line'
      
      await user.type(reviewText, textWithBreaks)
      expect(reviewText).toHaveValue(textWithBreaks)
    })

    it('should sanitize input to prevent XSS', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const reviewText = screen.getByLabelText(/review text/i)
      const maliciousInput = '<script>alert("xss")</script>Legitimate review text'
      
      await user.type(reviewText, maliciousInput)
      
      // Should strip script tags but keep legitimate text
      expect(reviewText).toHaveValue('Legitimate review text')
    })
  })

  describe('Form Submission', () => {
    it('should submit valid review successfully', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      // Fill out form
      const fiveStarOption = screen.getByLabelText(/5 stars/i)
      await user.click(fiveStarOption)
      
      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Excellent service! Very helpful staff and well-organized.')
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      // Should show loading state
      expect(screen.getByText(/submitting review/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(mockSubmitReview).toHaveBeenCalledWith({
          locationId: mockLocation.id,
          userId: mockUser.uid,
          rating: 5,
          reviewText: 'Excellent service! Very helpful staff and well-organized.',
          timestamp: expect.any(Date)
        })
      })
      
      expect(defaultProps.onReviewSubmitted).toHaveBeenCalled()
    })

    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup()
      mockSubmitReview.mockRejectedValue(new Error('Network error'))
      
      render(<ReviewForm {...defaultProps} />)

      // Fill out form
      const threeStarOption = screen.getByLabelText(/3 stars/i)
      await user.click(threeStarOption)
      
      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Average experience, could be better.')
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to submit review/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
      
      // Form should remain filled for retry
      expect(threeStarOption).toBeChecked()
      expect(reviewText).toHaveValue('Average experience, could be better.')
    })

    it('should prevent duplicate submissions', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      // Fill out form
      const fourStarOption = screen.getByLabelText(/4 stars/i)
      await user.click(fourStarOption)
      
      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Good service overall.')
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      
      // Click submit multiple times rapidly
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)
      
      // Should only submit once
      await waitFor(() => {
        expect(mockSubmitReview).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Authentication Requirements', () => {
    it('should show login prompt for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      })

      render(<ReviewForm {...defaultProps} />)

      expect(screen.getByText(/please log in to leave a review/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    it('should handle authentication loading state', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      })

      render(<ReviewForm {...defaultProps} />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })
  })

  describe('Cancel Functionality', () => {
    it('should handle cancel action', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(defaultProps.onCancel).toHaveBeenCalled()
    })

    it('should confirm cancel when form has content', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      // Add some content
      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Some review content')
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      // Should show confirmation dialog
      expect(screen.getByText(/discard review/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /keep editing/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      mockSubmitReview.mockRejectedValue(new Error('Network error'))
      
      render(<ReviewForm {...defaultProps} />)

      // Fill and submit form
      const fiveStarOption = screen.getByLabelText(/5 stars/i)
      await user.click(fiveStarOption)
      
      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Great experience!')
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/network error/i)
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })

    it('should handle invalid location ID', () => {
      const propsWithInvalidLocation = {
        ...defaultProps,
        locationId: '',
        locationName: ''
      }

      render(<ReviewForm {...propsWithInvalidLocation} />)

      expect(screen.getByText(/invalid location/i)).toBeInTheDocument()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(<ReviewForm {...defaultProps} />)

      // Should not have animation classes when reduced motion is preferred
      const form = screen.getByRole('form')
      expect(form).not.toHaveClass('animate-fade-in')
    })
  })

  describe('Data Validation and Security', () => {
    it('should validate all required fields', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      // Should show validation errors for all required fields
      expect(screen.getByText(/please select a rating/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a review/i)).toBeInTheDocument()
    })

    it('should sanitize review text for security', async () => {
      const user = userEvent.setup()
      render(<ReviewForm {...defaultProps} />)

      const reviewText = screen.getByLabelText(/review text/i)
      const maliciousInput = '<img src="x" onerror="alert(1)">Good review'
      
      await user.type(reviewText, maliciousInput)
      
      // Should sanitize HTML tags
      expect(reviewText).toHaveValue('Good review')
    })

    it('should enforce rate limiting for submissions', async () => {
      const user = userEvent.setup()
      mockSubmitReview.mockRejectedValue(new Error('Rate limit exceeded'))
      
      render(<ReviewForm {...defaultProps} />)

      // Fill out form
      const fiveStarOption = screen.getByLabelText(/5 stars/i)
      await user.click(fiveStarOption)
      
      const reviewText = screen.getByLabelText(/review text/i)
      await user.type(reviewText, 'Quick review')
      
      const submitButton = screen.getByRole('button', { name: /submit review/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
        expect(screen.getByText(/please wait before submitting another review/i)).toBeInTheDocument()
      })
    })
  })
}) 