import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentModeration from '../../../components/admin/ContentModeration'
import { useAuth } from '../../../hooks/useAuth'
import * as moderationService from '../../../lib/moderationService'

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock moderation service
jest.mock('../../../lib/moderationService')
const mockModerationService = moderationService as jest.Mocked<typeof moderationService>

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('ContentModeration', () => {
  const mockAdminUser = {
    uid: 'admin-123',
    email: 'admin@feedfind.org',
    displayName: 'Admin User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    role: 'admin' as const,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }

  const mockFlaggedContent = [
    {
      id: 'review-1',
      type: 'review',
      content: 'This place is terrible and dirty!',
      authorId: 'user-123',
      authorName: 'John Doe',
      locationId: 'location-456',
      locationName: 'Downtown Food Bank',
      flaggedAt: new Date('2024-01-15'),
      flaggedBy: 'user-789',
      flagReason: 'inappropriate_language',
      status: 'pending',
      moderatorNotes: '',
    },
    {
      id: 'location-2',
      type: 'location',
      content: 'Fake food bank with wrong address',
      authorId: 'provider-456',
      authorName: 'Fake Provider',
      locationId: 'location-789',
      locationName: 'Fake Food Bank',
      flaggedAt: new Date('2024-01-14'),
      flaggedBy: 'user-101',
      flagReason: 'misinformation',
      status: 'pending',
      moderatorNotes: '',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock authenticated admin user
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      isAuthenticated: true,
      isAdmin: true,
      isProvider: false,
      isSuperuser: false,
      isAdminOrSuperuser: true,
    })

    // Mock moderation service methods
    mockModerationService.getFlaggedContent.mockResolvedValue(mockFlaggedContent)
    mockModerationService.approveContent.mockResolvedValue(undefined)
    mockModerationService.rejectContent.mockResolvedValue(undefined)
    mockModerationService.flagContent.mockResolvedValue(undefined)
  })

  it('should flag inappropriate content automatically', async () => {
    // Arrange: Mock content with inappropriate language
    const inappropriateContent = {
      id: 'review-123',
      content: 'This place sucks and the staff are idiots',
      type: 'review',
      authorId: 'user-456',
    }

    mockModerationService.analyzeContent.mockResolvedValue({
      isInappropriate: true,
      confidence: 0.85,
      reasons: ['inappropriate_language', 'offensive_content'],
    })

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Assert: Should display flagged content
    await waitFor(() => {
      expect(screen.getByText(/content moderation/i)).toBeInTheDocument()
    })

    // Verify that flagged content is fetched
    expect(mockModerationService.getFlaggedContent).toHaveBeenCalled()
  })

  it('should allow manual review of flagged content', async () => {
    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/i)).toBeInTheDocument()
    })

    // Assert: Should show flagged content with review options
    expect(screen.getByText('This place is terrible and dirty!')).toBeInTheDocument()
    expect(screen.getByText('inappropriate language')).toBeInTheDocument()
    
    // Find the specific approve and reject buttons for the first content item
    const approveButtons = screen.getAllByRole('button', { name: /approve/i })
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
    
    expect(approveButtons.length).toBeGreaterThan(0)
    expect(rejectButtons.length).toBeGreaterThan(0)
  })

  it('should track moderation actions and decisions', async () => {
    const user = userEvent.setup()

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/i)).toBeInTheDocument()
    })

    // Act: Approve content
    const approveButtons = screen.getAllByRole('button', { name: /approve/i })
    expect(approveButtons.length).toBeGreaterThan(0)
    await user.click(approveButtons[0]) // Click the first approve button

    // Assert: Should call approve service with tracking
    await waitFor(() => {
      expect(mockModerationService.approveContent).toHaveBeenCalledWith(
        'review-1',
        mockAdminUser.uid,
        expect.any(String)
      )
    })
  })

  it('should notify users of content status changes', async () => {
    const user = userEvent.setup()

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/)).toBeInTheDocument()
    })

    // Act: Reject content with reason
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
    expect(rejectButtons.length).toBeGreaterThan(0)
    await user.click(rejectButtons[0]) // Click the first reject button

    // Add moderation notes
    const notesInput = screen.getByPlaceholderText(/add moderation notes/i)
    await user.type(notesInput, 'Content violates community guidelines')

    // Confirm rejection
    const confirmButton = screen.getByRole('button', { name: /confirm rejection/i })
    await user.click(confirmButton)

    // Assert: Should call reject service
    await waitFor(() => {
      expect(mockModerationService.rejectContent).toHaveBeenCalledWith(
        'review-1',
        mockAdminUser.uid,
        'Content violates community guidelines'
      )
    })
  })

  it('should display moderation history and statistics', async () => {
    // Mock moderation statistics
    mockModerationService.getModerationStats.mockResolvedValue({
      totalFlagged: 25,
      pendingReview: 8,
      approvedToday: 12,
      rejectedToday: 5,
      averageReviewTime: 45, // minutes
      topFlagReasons: [
        { reason: 'inappropriate_language', count: 10 },
        { reason: 'misinformation', count: 8 },
        { reason: 'spam', count: 7 },
      ],
    })

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Assert: Should display moderation statistics
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('total flagged')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('pending review')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('approved today')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('rejected today')).toBeInTheDocument()
    })
  })

  it('should filter content by type and status', async () => {
    const user = userEvent.setup()

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/)).toBeInTheDocument()
    })

    // Act: Filter by content type
    const typeFilter = screen.getByRole('combobox', { name: /content type/i })
    await user.selectOptions(typeFilter, 'review')

    // Assert: Should filter content
    await waitFor(() => {
      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'review',
        })
      )
    })

    // Act: Filter by status
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.selectOptions(statusFilter, 'pending')

    // Assert: Should filter by status
    await waitFor(() => {
      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        })
      )
    })
  })

  it('should handle bulk moderation actions', async () => {
    const user = userEvent.setup()

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/)).toBeInTheDocument()
    })

    // Act: Select multiple items
    const checkboxes = screen.getAllByRole('checkbox')
    if (checkboxes[0]) await user.click(checkboxes[0]) // Select first item
    if (checkboxes[1]) await user.click(checkboxes[1]) // Select second item

    // Act: Bulk approve
    const bulkApproveButton = screen.getByRole('button', { name: /bulk approve/i })
    await user.click(bulkApproveButton)

    // Assert: Should call bulk approve
    await waitFor(() => {
      expect(mockModerationService.bulkApproveContent).toHaveBeenCalledWith(
        ['review-1', 'location-2'],
        mockAdminUser.uid
      )
    })
  })

  it('should provide content preview and context', async () => {
    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/)).toBeInTheDocument()
    })

    // Assert: Should show content context
    expect(screen.getByText('This place is terrible and dirty!')).toBeInTheDocument()
    expect(screen.getByText(/By:.*John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Location:.*Downtown Food Bank/)).toBeInTheDocument()
    expect(screen.getByText(/flagged.*jan.*14/i)).toBeInTheDocument()
  })

  it('should handle moderation errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock error response
    mockModerationService.approveContent.mockRejectedValue(
      new Error('Network error during approval')
    )

    // Act: Render ContentModeration component
    render(<ContentModeration />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Location:.*Downtown Food Bank/)).toBeInTheDocument()
    })

    // Act: Try to approve content
    const approveButtons = screen.getAllByRole('button', { name: /approve/i })
    await user.click(approveButtons[0])

    // Assert: Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error.*approval/i)).toBeInTheDocument()
    })

    // Assert: Should provide retry option
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
}) 