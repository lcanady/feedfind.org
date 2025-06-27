import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ProviderDashboard } from '../../../components/provider/ProviderDashboard'
import type { Provider, Location, StatusUpdate } from '../../../types/database'
import type { LocationService } from '../../../lib/databaseService'
import type { CurrentLocationStatus } from '../../../types/database'
import { axe, toHaveNoViolations } from 'jest-axe'

// Import mock services
import { mockServices } from './__mocks__/services';

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock the database service
jest.mock('../../../lib/databaseService', () => ({
  ProviderService: jest.fn().mockImplementation(() => mockServices.provider),
  LocationService: jest.fn().mockImplementation(() => ({
    updateStatus: jest.fn().mockResolvedValue({}),
    getLocations: jest.fn().mockResolvedValue([
      {
        id: 'location1',
        name: 'Test Location',
        status: 'active',
        currentStatus: 'open'
      }
    ])
  })),
  StatusUpdateService: jest.fn().mockImplementation(() => mockServices.statusUpdate)
}));

// Mock the auth hook
const mockUseAuth = jest.fn()
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock data
const mockProvider: Provider = {
  id: 'provider1',
  organizationName: 'Downtown Food Bank',
  contactPerson: 'John Doe',
  email: 'provider@example.com',
  phone: '(555) 123-4567',
  website: 'https://example.com',
  description: 'Community food bank serving downtown area',
  address: '123 Main St, New York, NY 10001',
  servicesOffered: ['food_pantry', 'soup_kitchen'],
  isVerified: true,
  status: 'approved',
  locationIds: ['location1', 'location2'],
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockLocations: Location[] = [
  {
    id: 'location1',
    name: 'Main Distribution Center',
    address: '123 Main St, New York, NY 10001',
    coordinates: { latitude: 40.7484, longitude: -73.9967 },
    providerId: 'provider1',
    status: 'active',
    currentStatus: 'open',
    phone: '(555) 123-4567',
    description: 'Main food distribution center',
    capacity: 100,
    currentCapacity: 75,
    operatingHours: {
      monday: { open: '9:00 AM', close: '5:00 PM' },
      tuesday: { open: '9:00 AM', close: '5:00 PM' },
      wednesday: { open: '', close: '', closed: true },
      thursday: { open: '9:00 AM', close: '5:00 PM' },
      friday: { open: '9:00 AM', close: '5:00 PM' },
      saturday: { open: '10:00 AM', close: '3:00 PM' },
      sunday: { open: '', close: '', closed: true }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'location2',
    name: 'Mobile Pantry Unit',
    address: '456 Oak Ave, New York, NY 10002',
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
    providerId: 'provider1',
    status: 'active',
    currentStatus: 'limited',
    phone: '(555) 987-6543',
    description: 'Mobile food pantry for community outreach',
    capacity: 50,
    currentCapacity: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockStatusUpdates: StatusUpdate[] = [
  {
    id: 'update1',
    locationId: 'location1',
    status: 'open',
    updatedBy: 'provider1',
    timestamp: new Date(),
    notes: 'Fully stocked and ready to serve',
    foodAvailable: true,
    estimatedWaitTime: 15,
    createdAt: new Date()
  },
  {
    id: 'update2',
    locationId: 'location2',
    status: 'limited',
    updatedBy: 'provider1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    notes: 'Limited supplies, first come first served',
    foodAvailable: true,
    estimatedWaitTime: 30,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
]

// Helper function to wait for element
const waitForElement = async (getElement: () => Element | null): Promise<Element> => {
  const element = await waitFor(getElement)
  if (!element) throw new Error('Element not found')
  return element
}

// Helper function to navigate to locations tab
const navigateToLocationsTab = async (user: ReturnType<typeof userEvent.setup>) => {
  // Wait for the dashboard to load first
  await waitFor(() => {
    expect(screen.getByText('Downtown Food Bank')).toBeInTheDocument()
  })
  
  const locationsTab = await waitFor(() => 
    screen.getByRole('button', { name: 'Locations' })
  ) as HTMLButtonElement
  await user.click(locationsTab)
}

// Helper function to wait for button
const waitForButton = async (name: string | RegExp): Promise<HTMLButtonElement> => {
  const button = await waitFor(() => screen.getByRole('button', { name }))
  return button as HTMLButtonElement
}

// Helper function to wait for buttons
const waitForButtons = async (name: string | RegExp): Promise<HTMLButtonElement[]> => {
  const buttons = await waitFor(() => screen.getAllByRole('button', { name }))
  return buttons.map(button => button as HTMLButtonElement)
}

describe('ProviderDashboard', () => {
  const mockOnLocationUpdate = jest.fn()
  const mockOnStatusUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default mock implementations
    mockServices.provider.getById.mockResolvedValue(mockProvider)
    mockServices.location.getByProviderId.mockResolvedValue(mockLocations)
    mockServices.statusUpdate.getRecentByProviderId.mockResolvedValue(mockStatusUpdates)
    
    // Set up default auth mock
    mockUseAuth.mockReturnValue({
      user: { uid: 'provider1', role: 'provider' },
      isProvider: true,
      isAdminOrSuperuser: false
    })
  })

  describe('Dashboard Overview', () => {
    it('should display provider information correctly', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Downtown Food Bank')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('provider@example.com')).toBeInTheDocument()
        expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
      })
    })

    it('should show verification status badge', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        const verifiedBadge = screen.getByText(/verified/i)
        expect(verifiedBadge).toBeInTheDocument()
        expect(verifiedBadge).toHaveClass('bg-green-100', 'text-green-800')
      })
    })

    it('should display location count and status summary', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // Total locations
        expect(screen.getByText(/1.*open/i)).toBeInTheDocument()
        expect(screen.getByText(/1.*limited/i)).toBeInTheDocument()
      })
    })

    it('should handle loading state', () => {
      mockServices.provider.getById.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should handle error state', async () => {
      mockServices.provider.getById.mockRejectedValue(new Error('Provider not found'))

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/provider not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Location Management', () => {
    it('should display all provider locations', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Main Distribution Center')).toBeInTheDocument()
        expect(screen.getByText('Mobile Pantry Unit')).toBeInTheDocument()
      })
    })

    it('should show current status for each location', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        const openStatus = screen.getByText(/🟢.*open/i)
        const limitedStatus = screen.getByText(/🟡.*limited/i)
        
        expect(openStatus).toBeInTheDocument()
        expect(limitedStatus).toBeInTheDocument()
      })
    })

    it('should display capacity information', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Wait for locations tab to be accessible, then navigate to it
      await waitFor(() => {
        expect(screen.getByText('Downtown Food Bank')).toBeInTheDocument()
      })
      
      // Navigate to locations tab to see capacity information
      const user = userEvent.setup()
      const locationsTab = screen.getByRole('button', { name: 'Locations' })
      await user.click(locationsTab)
      
      await waitFor(() => {
        // Look for capacity information in the locations view
        expect(screen.getByText(/capacity/i)).toBeInTheDocument()
      })
    })

    it('should allow editing location details', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        const editButton = screen.getAllByLabelText(/edit location/i)[0]
        expect(editButton).toBeInTheDocument()
      })

      const editButton = screen.getAllByLabelText(/edit location/i)[0]
      await user.click(editButton)

      expect(screen.getByRole('dialog', { name: /edit location/i })).toBeInTheDocument()
      expect(screen.getByDisplayValue('Main Distribution Center')).toBeInTheDocument()
    })
  })

  describe('Status Updates', () => {
    const getStatusButton = async (): Promise<HTMLButtonElement> => {
      const buttons = await screen.findAllByRole('button', { name: /update status/i })
      expect(buttons.length).toBeGreaterThan(0)
      const button = buttons[0]
      expect(button).toBeInTheDocument()
      expect(button).toBeInstanceOf(HTMLButtonElement)
      return button as HTMLButtonElement
    }

    const getFormElements = async () => {
      const statusSelect = await waitForElement(
        () => screen.getByLabelText(/status/i) as HTMLSelectElement
      )

      const notesInput = await waitForElement(
        () => screen.getByLabelText(/notes/i) as HTMLInputElement
      )

      const waitTimeInput = await waitForElement(
        () => screen.getByLabelText(/estimated wait time/i) as HTMLInputElement
      )

      const submitButton = await waitForElement(
        () => screen.getByRole('button', { name: /update status$/i }) as HTMLButtonElement
      )

      return {
        statusSelect,
        notesInput,
        waitTimeInput,
        submitButton
      }
    }

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks()
    })

    it('should provide quick status update controls', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        const statusButtons = screen.getAllByRole('button', { name: /update status/i })
        expect(statusButtons.length).toBeGreaterThan(0)
      })
    })

    it('should allow bulk status updates', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Navigate to Locations tab where bulk update is available
      await navigateToLocationsTab(user)

      await waitFor(() => {
        const bulkUpdateButton = screen.getByRole('button', { name: /bulk update/i })
        expect(bulkUpdateButton).toBeInTheDocument()
      })

      const bulkUpdateButton = screen.getByRole('button', { name: /bulk update/i })
      await user.click(bulkUpdateButton)

      expect(screen.getByRole('dialog', { name: /bulk status update/i })).toBeInTheDocument()
    })

    it('should show recent status update history', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/recent updates/i)).toBeInTheDocument()
        expect(screen.getByText('Fully stocked and ready to serve')).toBeInTheDocument()
        expect(screen.getByText('Limited supplies, first come first served')).toBeInTheDocument()
      })
    })

    it('should handle status update submission', async () => {
      const user = userEvent.setup()
      const mockLocationService = {
        updateStatus: jest.fn().mockResolvedValue({}),
      }
      jest.spyOn(require('../../../lib/databaseService'), 'LocationService')
        .mockImplementation(() => mockLocationService)
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await navigateToLocationsTab(user)

      const statusButton = await getStatusButton()
      await user.click(statusButton)

      const { statusSelect, notesInput, waitTimeInput, submitButton } = await getFormElements()

      // Fill out the status update form
      await user.selectOptions(statusSelect, 'closed')
      await user.type(notesInput, 'Temporarily closed for restocking')
      await user.type(waitTimeInput, '30')
      await user.click(submitButton)

      // Verify the update was called with correct data
      expect(mockLocationService.updateStatus).toHaveBeenCalledWith('location1', {
        status: 'closed',
        notes: 'Temporarily closed for restocking',
        estimatedWaitTime: 30,
        updatedBy: 'provider1',
        timestamp: expect.any(Date)
      })

      expect(mockOnStatusUpdate).toHaveBeenCalledWith('location1', 'closed')
    })

    it('should handle empty estimated wait time', async () => {
      const user = userEvent.setup()
      const mockLocationService = {
        updateStatus: jest.fn().mockResolvedValue({}),
      }
      jest.spyOn(require('../../../lib/databaseService'), 'LocationService')
        .mockImplementation(() => mockLocationService)
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await navigateToLocationsTab(user)

      const statusButton = await getStatusButton()
      await user.click(statusButton)

      const { statusSelect, notesInput, submitButton } = await getFormElements()

      // Fill out form without wait time
      await user.selectOptions(statusSelect, 'open')
      await user.type(notesInput, 'Open for service')
      await user.click(submitButton)

      // Verify update was called without estimatedWaitTime field
      expect(mockLocationService.updateStatus).toHaveBeenCalledWith('location1', {
        status: 'open',
        notes: 'Open for service',
        updatedBy: 'provider1',
        timestamp: expect.any(Date)
      })
    })

    it('should handle invalid wait time input', async () => {
      const user = userEvent.setup()
      const mockLocationService = {
        updateStatus: jest.fn().mockResolvedValue({}),
      }
      jest.spyOn(require('../../../lib/databaseService'), 'LocationService')
        .mockImplementation(() => mockLocationService)
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await navigateToLocationsTab(user)

      const statusButton = await getStatusButton()
      await user.click(statusButton)

      const { statusSelect, waitTimeInput, submitButton } = await getFormElements()

      // Fill out form with invalid wait time
      await user.selectOptions(statusSelect, 'limited')
      await user.type(waitTimeInput, 'invalid')
      await user.click(submitButton)

      // Verify update was called without estimatedWaitTime field
      expect(mockLocationService.updateStatus).toHaveBeenCalledWith('location1', {
        status: 'limited',
        updatedBy: 'provider1',
        timestamp: expect.any(Date)
      })
    })
  })

  describe('Accessibility', () => {
    it('should pass axe-core automated accessibility tests', async () => {
      const { container } = render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      const mainHeading = await waitForElement(
        () => screen.getByRole('heading', { level: 1 })
      )
      expect(mainHeading).toHaveTextContent(/dashboard/i)

      const sectionHeadings = await screen.findAllByRole('heading', { level: 2 })
      expect(sectionHeadings.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Test tab navigation through main elements
      await user.tab()
      const firstInteractive = document.activeElement
      expect(firstInteractive).toHaveAttribute('role', 'tab')

      // Navigate through tabs
      await user.keyboard('{ArrowRight}')
      const secondTab = document.activeElement
      expect(secondTab).toHaveAttribute('role', 'tab')

      // Navigate to locations tab
      await navigateToLocationsTab(user)

      // Test focus management in status update form
      const statusButton = await getStatusButton()
      await user.click(statusButton)

      const { statusSelect, notesInput, waitTimeInput, submitButton } = await getFormElements()

      // Tab through form elements
      await user.tab()
      expect(statusSelect).toHaveFocus()

      await user.tab()
      expect(notesInput).toHaveFocus()

      await user.tab()
      expect(waitTimeInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should have proper ARIA labels and roles', async () => {
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Check for proper navigation landmarks
      const navigation = await waitForElement(
        () => screen.getByRole('navigation')
      )
      expect(navigation).toHaveAttribute('aria-label')

      // Check for proper tab list
      const tabList = await waitForElement(
        () => screen.getByRole('tablist')
      )
      expect(tabList).toHaveAttribute('aria-label')

      // Navigate to locations tab and check form controls
      const user = userEvent.setup()
      await navigateToLocationsTab(user)

      const statusButton = await getStatusButton()
      await user.click(statusButton)

      const { statusSelect, notesInput, waitTimeInput } = await getFormElements()

      // Check for proper form labels
      expect(statusSelect).toHaveAccessibleName()
      expect(notesInput).toHaveAccessibleName()
      expect(waitTimeInput).toHaveAccessibleName()
    })

    it('should announce status changes to screen readers', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await navigateToLocationsTab(user)

      // Check for status live region
      const statusRegion = await waitForElement(
        () => screen.getByRole('status')
      )
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')

      // Update status and verify announcement
      const statusButton = await getStatusButton()
      await user.click(statusButton)

      const { statusSelect, submitButton } = await getFormElements()
      await user.selectOptions(statusSelect, 'closed')
      await user.click(submitButton)

      // Verify status update announcement
      const announcement = await waitForElement(
        () => screen.getByText(/status updated/i)
      )
      expect(announcement).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle status update failures gracefully', async () => {
      const user = userEvent.setup()
      mockServices.location.updateStatus.mockRejectedValue(new Error('Update failed'))

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Navigate to Locations tab where update status buttons are available
      await navigateToLocationsTab(user)

      await waitFor(() => {
        const statusButton = screen.getAllByRole('button', { name: /update status/i })[0]
        expect(statusButton).toBeInTheDocument()
      })

      const statusButton = screen.getAllByRole('button', { name: /update status/i })[0]
      await user.click(statusButton)

      const submitButton = screen.getByRole('button', { name: /update/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to update status/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    it('should handle network errors with retry mechanism', async () => {
      const user = userEvent.setup()
      const { ProviderService } = require('../../../lib/databaseService')
      
      // First call fails, second succeeds
      mockServices.provider.getById
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockProvider)

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Downtown Food Bank')).toBeInTheDocument()
      })
    })

    it('should validate form inputs before submission', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Navigate to locations tab first
      await navigateToLocationsTab(user)

      await waitFor(() => {
        const statusButton = screen.getAllByRole('button', { name: /update status/i })[0]
        expect(statusButton).toBeInTheDocument()
      })

      const statusButton = screen.getAllByRole('button', { name: /update status/i })[0]
      await user.click(statusButton)

      // Try to submit without selecting a status
      const submitButton = screen.getByRole('button', { name: /update status$/i })
      await user.click(submitButton)

      // Wait for validation message
      await waitFor(() => {
        expect(screen.getByText(/please select a status/i)).toBeInTheDocument()
      })
    })
  })

  describe('Admin and Superuser Access', () => {
    it('should allow admin users to access provider dashboards', async () => {
      // Mock admin user
      mockUseAuth.mockReturnValue({
        user: { uid: 'admin-user-123', role: 'admin' },
        isProvider: false,
        isAdminOrSuperuser: true
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Provider Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Admin View')).toBeInTheDocument()
        expect(screen.getByText('Administrator Access')).toBeInTheDocument()
      })
    })

    it('should allow superuser users to access provider dashboards', async () => {
      // Mock superuser
      mockUseAuth.mockReturnValue({
        user: { uid: 'superuser-123', role: 'superuser' },
        isProvider: false,
        isAdminOrSuperuser: true
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Provider Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Admin View')).toBeInTheDocument()
      })
    })

    it('should show admin-specific UI elements when admin is viewing', async () => {
      // Mock admin user
      mockUseAuth.mockReturnValue({
        user: { uid: 'admin-user-123', role: 'admin' },
        isProvider: false,
        isAdminOrSuperuser: true
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      await waitFor(() => {
        // Should show admin warning banner
        expect(screen.getByText('Administrator Access')).toBeInTheDocument()
        expect(screen.getByText(/You are viewing this dashboard as an administrator/)).toBeInTheDocument()
        
        // Should show provider ID and creation date for admin reference
        expect(screen.getByText(/Provider ID: provider1/)).toBeInTheDocument()
      })
    })

    it('should show admin-specific button labels when admin is viewing', async () => {
      // Mock admin user
      mockUseAuth.mockReturnValue({
        user: { uid: 'admin-user-123', role: 'admin' },
        isProvider: false,
        isAdminOrSuperuser: true
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      // Switch to locations tab to see the admin buttons
      await navigateToLocationsTab(userEvent.setup())

      await waitFor(() => {
        // Use getAllByText since there are multiple buttons
        const updateButtons = screen.getAllByText('Admin Update Status')
        const editButtons = screen.getAllByText('Admin Edit')
        expect(updateButtons.length).toBeGreaterThan(0)
        expect(editButtons.length).toBeGreaterThan(0)
      })
    })

    it('should deny access to regular users trying to view other providers', async () => {
      // Mock regular user trying to access another provider's dashboard
      mockUseAuth.mockReturnValue({
        user: { uid: 'regular-user-123', role: 'user' },
        isProvider: false,
        isAdminOrSuperuser: false
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Access denied/)).toBeInTheDocument()
        expect(screen.getByText(/You do not have permission to view this dashboard/)).toBeInTheDocument()
      })
    })

    it('should allow providers to access their own dashboard', async () => {
      // Mock provider accessing their own dashboard
      mockUseAuth.mockReturnValue({
        user: { uid: 'provider1', role: 'provider' },
        isProvider: true,
        isAdminOrSuperuser: false
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Provider Dashboard')).toBeInTheDocument()
        // Should NOT show admin-specific elements
        expect(screen.queryByText('Admin View')).not.toBeInTheDocument()
        expect(screen.queryByText('Administrator Access')).not.toBeInTheDocument()
      })
    })

    it('should show admin warning in status update modal', async () => {
      // Mock admin user  
      mockUseAuth.mockReturnValue({
        user: { uid: 'admin-user-123', role: 'admin' },
        isProvider: false,
        isAdminOrSuperuser: true
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={jest.fn()}
          onStatusUpdate={jest.fn()}
        />
      )

      // Switch to locations tab and click update status
      await navigateToLocationsTab(userEvent.setup())

      const user = userEvent.setup()
      
      await waitFor(() => {
        const updateButtons = screen.getAllByText('Admin Update Status')
        expect(updateButtons.length).toBeGreaterThan(0)
        return updateButtons[0]
      }).then(async (button) => {
        await user.click(button)
        
        // Check for admin warning in modal
        expect(screen.getByRole('heading', { name: /Admin Update Status: Main Distribution Center/i })).toBeInTheDocument()
        expect(screen.getByText(/You are making changes as an administrator/)).toBeInTheDocument()
      })
    })
  })

  describe('Provider Registration', () => {
    it('should show registration form when provider does not exist and user is trying to access their own dashboard', async () => {
      // Mock provider not found
      mockServices.provider.getById.mockResolvedValue(null)
      
      // Mock user trying to access their own provider dashboard
      mockUseAuth.mockReturnValue({
        user: { uid: 'provider1', role: 'provider' },
        isProvider: true,
        isAdminOrSuperuser: false
      })

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      })

      // Should show registration form
      expect(screen.getByRole('heading', { name: 'Create Provider Profile' })).toBeInTheDocument()
      expect(screen.getByText(/Register your food assistance organization/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Organization Name/)).toBeInTheDocument()
    })

    it('should show error for admin when provider does not exist', async () => {
      // Mock provider not found
      mockServices.provider.getById.mockResolvedValue(null)
      
      // Mock admin user
      mockUseAuth.mockReturnValue({
        user: { uid: 'admin-user-123', role: 'admin' },
        isProvider: false,
        isAdminOrSuperuser: true
      })

      render(
        <ProviderDashboard 
          providerId="nonexistent-provider"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Provider with ID "nonexistent-provider" not found/)).toBeInTheDocument()
      })

      // Should not show registration form for admin
      expect(screen.queryByText('Create Provider Profile')).not.toBeInTheDocument()
    })

    it('should handle successful provider creation', async () => {
      // Reset mocks for this test
      jest.clearAllMocks()
      
      // Mock provider not found initially, then found after creation
      mockServices.provider.getById
        .mockResolvedValueOnce(null) // First call returns null
        .mockResolvedValue(mockProvider) // All subsequent calls return provider

      // Mock other services to return data after provider is created
      mockServices.location.getByProviderId.mockResolvedValue(mockLocations)
      mockServices.statusUpdate.getRecentByProviderId.mockResolvedValue(mockStatusUpdates)

      // Mock user trying to access their own provider dashboard
      mockUseAuth.mockReturnValue({
        user: { uid: 'provider1', role: 'provider' },
        isProvider: true,
        isAdminOrSuperuser: false
      })

      // Mock provider creation
      mockServices.provider.create = jest.fn().mockResolvedValue(mockProvider)

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Wait for registration form to appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create Provider Profile' })).toBeInTheDocument()
      })

      // Fill out the form
      const user = userEvent.setup()
      await user.type(screen.getByLabelText(/Organization Name/), 'Test Food Bank')
      await user.type(screen.getByLabelText(/Contact Person/), 'John Doe')
      await user.type(screen.getByLabelText(/Email Address/), 'test@example.com')
      await user.type(screen.getByLabelText(/Phone Number/), '(555) 123-4567')
      await user.type(screen.getByLabelText(/Main Address/), '123 Main St')
      await user.type(screen.getByLabelText(/Organization Description/), 'Test description')
      
      // Select a service
      const foodPantryCheckbox = screen.getByLabelText('Food Pantry')
      await user.click(foodPantryCheckbox)

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      // Wait for provider creation and dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Provider Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Downtown Food Bank')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Registration form should no longer be visible
      expect(screen.queryByRole('heading', { name: 'Create Provider Profile' })).not.toBeInTheDocument()
    })

    it('should handle registration form cancellation', async () => {
      // Mock provider not found
      mockServices.provider.getById.mockResolvedValue(null)
      
      // Mock user trying to access their own provider dashboard
      mockUseAuth.mockReturnValue({
        user: { uid: 'provider1', role: 'provider' },
        isProvider: true,
        isAdminOrSuperuser: false
      })

      // Mock window.location.href
      delete (window as any).location
      ;(window as any).location = { href: '' }

      render(
        <ProviderDashboard 
          providerId="provider1"
          onLocationUpdate={mockOnLocationUpdate}
          onStatusUpdate={mockOnStatusUpdate}
        />
      )

      // Wait for registration form to appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create Provider Profile' })).toBeInTheDocument()
      })

      // Click cancel button
      const user = userEvent.setup()
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)

      // Should redirect to home
      expect(window.location.href).toBe('/')
    })
  })
}) 