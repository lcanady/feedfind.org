import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { MobileOptimizedLayout, MobileCard, MobileInput, MobileButton } from '../../../components/mobile/MobileOptimizedLayout'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

describe('MobileOptimizedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  describe('Basic Layout', () => {
    it('should render with default props', () => {
      render(
        <MobileOptimizedLayout>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      expect(screen.getByText('FeedFind')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('should display custom title', () => {
      render(
        <MobileOptimizedLayout title="Custom Title">
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should show back button when onBack prop is provided', () => {
      const mockOnBack = jest.fn()

      render(
        <MobileOptimizedLayout onBack={mockOnBack}>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      const backButton = screen.getByTestId('back-button')
      expect(backButton).toBeInTheDocument()
      
      fireEvent.click(backButton)
      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should use router.back() when no onBack prop is provided', () => {
      render(
        <MobileOptimizedLayout onBack={() => {}}>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      const backButton = screen.getByTestId('back-button')
      fireEvent.click(backButton)
      // Custom onBack should be called, not router.back()
    })
  })

  describe('Offline Functionality', () => {
    it('should show offline indicator when offline', async () => {
      render(
        <MobileOptimizedLayout>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      // Initially online, no indicator
      expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument()

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)

      await waitFor(() => {
        expect(screen.getByText(/you're offline/i)).toBeInTheDocument()
      })
    })

    it('should hide offline indicator when back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      render(
        <MobileOptimizedLayout>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      // Trigger offline state
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)

      await waitFor(() => {
        expect(screen.getByText(/you're offline/i)).toBeInTheDocument()
      })

      // Go back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })

      const onlineEvent = new Event('online')
      window.dispatchEvent(onlineEvent)

      await waitFor(() => {
        expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Bottom Actions', () => {
    it('should show primary action button', () => {
      const mockAction = jest.fn()

      render(
        <MobileOptimizedLayout
          primaryAction={{
            label: 'Find Locations',
            onClick: mockAction,
          }}
        >
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      const primaryButton = screen.getByTestId('primary-action')
      expect(primaryButton).toBeInTheDocument()
      expect(primaryButton).toHaveTextContent('Find Locations')

      fireEvent.click(primaryButton)
      expect(mockAction).toHaveBeenCalled()
    })

    it('should show secondary action button', () => {
      const mockAction = jest.fn()

      render(
        <MobileOptimizedLayout
          secondaryAction={{
            label: 'Filter',
            onClick: mockAction,
          }}
        >
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      const secondaryButton = screen.getByTestId('secondary-action')
      expect(secondaryButton).toBeInTheDocument()
      expect(secondaryButton).toHaveTextContent('Filter')

      fireEvent.click(secondaryButton)
      expect(mockAction).toHaveBeenCalled()
    })

    it('should disable primary action when disabled prop is true', () => {
      const mockAction = jest.fn()

      render(
        <MobileOptimizedLayout
          primaryAction={{
            label: 'Find Locations',
            onClick: mockAction,
            disabled: true,
          }}
        >
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      const primaryButton = screen.getByTestId('primary-action')
      expect(primaryButton).toBeDisabled()

      fireEvent.click(primaryButton)
      expect(mockAction).not.toHaveBeenCalled()
    })
  })

  describe('Bottom Navigation', () => {
    it('should show bottom navigation when enabled', () => {
      render(
        <MobileOptimizedLayout showBottomNav={true}>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      const bottomNav = screen.getByTestId('bottom-navigation')
      expect(bottomNav).toBeInTheDocument()
      
      // Check for navigation buttons
      expect(screen.getByLabelText('Home')).toBeInTheDocument()
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByLabelText('Map')).toBeInTheDocument()
      expect(screen.getByLabelText('Profile')).toBeInTheDocument()
    })

    it('should navigate when bottom nav buttons are clicked', () => {
      render(
        <MobileOptimizedLayout showBottomNav={true}>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      fireEvent.click(screen.getByLabelText('Search'))
      expect(mockPush).toHaveBeenCalledWith('/search')

      fireEvent.click(screen.getByLabelText('Map'))
      expect(mockPush).toHaveBeenCalledWith('/map')

      fireEvent.click(screen.getByLabelText('Profile'))
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MobileOptimizedLayout showBottomNav={true}>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      // Check header role
      expect(screen.getByRole('banner')).toBeInTheDocument()
      
      // Check main content role
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Check navigation role and label
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')
    })

    it('should have proper button labels', () => {
      const mockOnBack = jest.fn()

      render(
        <MobileOptimizedLayout onBack={mockOnBack} showBottomNav={true}>
          <div>Test content</div>
        </MobileOptimizedLayout>
      )

      expect(screen.getByLabelText('Go back')).toBeInTheDocument()
      expect(screen.getByLabelText('Menu')).toBeInTheDocument()
      expect(screen.getByLabelText('Home')).toBeInTheDocument()
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByLabelText('Map')).toBeInTheDocument()
      expect(screen.getByLabelText('Profile')).toBeInTheDocument()
    })
  })
})

describe('MobileCard', () => {
  it('should render children correctly', () => {
    render(
      <MobileCard>
        <h3>Card Title</h3>
        <p>Card content</p>
      </MobileCard>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should handle tap events', () => {
    const mockTap = jest.fn()

    render(
      <MobileCard onTap={mockTap}>
        <div>Tappable card</div>
      </MobileCard>
    )

    const card = screen.getByTestId('mobile-card')
    fireEvent.click(card)
    expect(mockTap).toHaveBeenCalled()
  })

  it('should handle swipe gestures', () => {
    const mockSwipeLeft = jest.fn()
    const mockSwipeRight = jest.fn()

    render(
      <MobileCard 
        swipeable={true}
        onSwipeLeft={mockSwipeLeft}
        onSwipeRight={mockSwipeRight}
      >
        <div>Swipeable card</div>
      </MobileCard>
    )

    const card = screen.getByTestId('mobile-card')

    // Simulate swipe left (start at x=100, end at x=30)
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    fireEvent.touchMove(card, {
      touches: [{ clientX: 30, clientY: 100 }]
    })
    fireEvent.touchEnd(card)

    expect(mockSwipeLeft).toHaveBeenCalled()

    // Reset mocks
    mockSwipeLeft.mockClear()
    mockSwipeRight.mockClear()

    // Simulate swipe right (start at x=30, end at x=100)
    fireEvent.touchStart(card, {
      touches: [{ clientX: 30, clientY: 100 }]
    })
    fireEvent.touchMove(card, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    fireEvent.touchEnd(card)

    expect(mockSwipeRight).toHaveBeenCalled()
  })
})

describe('MobileInput', () => {
  it('should render with label and input', () => {
    const mockOnChange = jest.fn()

    render(
      <MobileInput
        label="Location"
        value=""
        onChange={mockOnChange}
        placeholder="Enter ZIP code"
      />
    )

    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter ZIP code')).toBeInTheDocument()
  })

  it('should show required indicator', () => {
    const mockOnChange = jest.fn()

    render(
      <MobileInput
        label="Required Field"
        value=""
        onChange={mockOnChange}
        required={true}
      />
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should handle input changes', async () => {
    const mockOnChange = jest.fn()
    const user = userEvent.setup()

    render(
      <MobileInput
        label="Test Input"
        value=""
        onChange={mockOnChange}
      />
    )

    const input = screen.getByTestId('mobile-input')
    await user.type(input, 'test value')

    expect(mockOnChange).toHaveBeenCalledWith('test value')
  })

  it('should show error message', () => {
    const mockOnChange = jest.fn()

    render(
      <MobileInput
        label="Test Input"
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    const mockOnChange = jest.fn()

    render(
      <MobileInput
        label="Disabled Input"
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    )

    const input = screen.getByTestId('mobile-input')
    expect(input).toBeDisabled()
  })
})

describe('MobileButton', () => {
  it('should render with correct text', () => {
    const mockClick = jest.fn()

    render(
      <MobileButton onClick={mockClick}>
        Click Me
      </MobileButton>
    )

    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const mockClick = jest.fn()

    render(
      <MobileButton onClick={mockClick}>
        Click Me
      </MobileButton>
    )

    const button = screen.getByTestId('mobile-button')
    fireEvent.click(button)
    expect(mockClick).toHaveBeenCalled()
  })

  it('should show loading state', () => {
    const mockClick = jest.fn()

    render(
      <MobileButton onClick={mockClick} loading={true}>
        Click Me
      </MobileButton>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Click Me')).not.toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    const mockClick = jest.fn()

    render(
      <MobileButton onClick={mockClick} disabled={true}>
        Click Me
      </MobileButton>
    )

    const button = screen.getByTestId('mobile-button')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(mockClick).not.toHaveBeenCalled()
  })

  it('should apply different variants correctly', () => {
    const mockClick = jest.fn()

    const { rerender } = render(
      <MobileButton onClick={mockClick} variant="primary">
        Primary
      </MobileButton>
    )

    let button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('bg-blue-600')

    rerender(
      <MobileButton onClick={mockClick} variant="secondary">
        Secondary
      </MobileButton>
    )

    button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('bg-gray-600')

    rerender(
      <MobileButton onClick={mockClick} variant="outline">
        Outline
      </MobileButton>
    )

    button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('border')
  })

  it('should apply different sizes correctly', () => {
    const mockClick = jest.fn()

    const { rerender } = render(
      <MobileButton onClick={mockClick} size="small">
        Small
      </MobileButton>
    )

    let button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('min-h-[40px]')

    rerender(
      <MobileButton onClick={mockClick} size="medium">
        Medium
      </MobileButton>
    )

    button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('min-h-[44px]')

    rerender(
      <MobileButton onClick={mockClick} size="large">
        Large
      </MobileButton>
    )

    button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('min-h-[48px]')
  })

  it('should apply full width when specified', () => {
    const mockClick = jest.fn()

    render(
      <MobileButton onClick={mockClick} fullWidth={true}>
        Full Width
      </MobileButton>
    )

    const button = screen.getByTestId('mobile-button')
    expect(button).toHaveClass('w-full')
  })
}) 