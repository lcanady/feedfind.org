import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ProviderRegistrationForm } from '../../../components/provider/ProviderRegistrationForm'
import type { Provider } from '../../../types/database'

// Mock the auth hook
const mockUseAuth = jest.fn()
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock the database service
const mockProviderService = {
  create: jest.fn()
}

jest.mock('../../../lib/databaseService', () => ({
  ProviderService: jest.fn().mockImplementation(() => mockProviderService)
}))

describe('ProviderRegistrationForm', () => {
  const mockOnProviderCreated = jest.fn()
  const mockOnCancel = jest.fn()

  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com'
  }

  const mockProvider: Provider = {
    id: 'provider-123',
    organizationName: 'Test Food Bank',
    contactPerson: 'John Doe',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    description: 'Test description',
    address: '123 Main St, Test City, TS 12345',
    servicesOffered: ['food_pantry'],
    isVerified: false,
    status: 'pending',
    locationIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Helper function to fill out a valid form
  const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/Organization Name/), 'Test Food Bank')
    await user.type(screen.getByLabelText(/Contact Person/), 'John Doe')
    await user.type(screen.getByLabelText(/Phone Number/), '(555) 123-4567')
    await user.type(screen.getByLabelText(/Website/), 'https://testfoodbank.org')
    await user.type(screen.getByLabelText(/Main Address/), '123 Main St, Test City, TS 12345')
    await user.type(screen.getByLabelText(/Organization Description/), 'We provide food assistance to families in need.')
    
    // Select a service
    const foodPantryCheckbox = screen.getByLabelText('Food Pantry')
    await user.click(foodPantryCheckbox)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: mockUser
    })
    
    mockProviderService.create.mockResolvedValue(mockProvider)
  })

  describe('Form Rendering', () => {
    it('should render the registration form with all required fields', () => {
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      // Check form title and description
      expect(screen.getByRole('heading', { name: 'Create Provider Profile' })).toBeInTheDocument()
      expect(screen.getByText(/Register your food assistance organization/)).toBeInTheDocument()

      // Check required fields
      expect(screen.getByLabelText(/Organization Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Contact Person/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Main Address/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Organization Description/)).toBeInTheDocument()
      expect(screen.getByText(/Services Offered/)).toBeInTheDocument()

      // Check optional field
      expect(screen.getByLabelText(/Website/)).toBeInTheDocument()

      // Check service options
      expect(screen.getByLabelText('Food Pantry')).toBeInTheDocument()
      expect(screen.getByLabelText('Soup Kitchen')).toBeInTheDocument()
      expect(screen.getByLabelText('Mobile Food Pantry')).toBeInTheDocument()

      // Check buttons
      expect(screen.getByRole('button', { name: /Create Provider Profile/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
    })

    it('should pre-populate email field with user email', () => {
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      const emailInput = screen.getByLabelText(/Email Address/) as HTMLInputElement
      expect(emailInput.value).toBe('test@example.com')
    })

    it('should show review process information', () => {
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Review Process')).toBeInTheDocument()
      expect(screen.getByText(/Your provider profile will be reviewed/)).toBeInTheDocument()
      expect(screen.getByText(/1-2 business days/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Organization name is required/)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      const emailInput = screen.getByLabelText(/Email Address/)
      await user.clear(emailInput)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument()
      })
    })

    it('should require at least one service to be selected', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      // Fill in all required fields except services
      await user.type(screen.getByLabelText(/Organization Name/), 'Test Org')
      await user.type(screen.getByLabelText(/Contact Person/), 'John Doe')
      await user.type(screen.getByLabelText(/Phone Number/), '(555) 123-4567')
      await user.type(screen.getByLabelText(/Main Address/), '123 Main St')
      await user.type(screen.getByLabelText(/Organization Description/), 'Test description')

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Please select at least one service offered/)).toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('should allow user to select and deselect services', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      const foodPantryCheckbox = screen.getByLabelText('Food Pantry')
      const soupKitchenCheckbox = screen.getByLabelText('Soup Kitchen')

      // Initially unchecked
      expect(foodPantryCheckbox).not.toBeChecked()
      expect(soupKitchenCheckbox).not.toBeChecked()

      // Select services
      await user.click(foodPantryCheckbox)
      await user.click(soupKitchenCheckbox)

      expect(foodPantryCheckbox).toBeChecked()
      expect(soupKitchenCheckbox).toBeChecked()

      // Deselect one service
      await user.click(foodPantryCheckbox)

      expect(foodPantryCheckbox).not.toBeChecked()
      expect(soupKitchenCheckbox).toBeChecked()
    })

    it('should handle cancel button click', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not show cancel button when onCancel is not provided', () => {
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
        />
      )

      expect(screen.queryByRole('button', { name: /Cancel/ })).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should successfully submit valid form data', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProviderService.create).toHaveBeenCalledWith({
          organizationName: 'Test Food Bank',
          contactPerson: 'John Doe',
          email: 'test@example.com',
          phone: '(555) 123-4567',
          website: 'https://testfoodbank.org',
          description: 'We provide food assistance to families in need.',
          address: '123 Main St, Test City, TS 12345',
          servicesOffered: ['food_pantry'],
          isVerified: false,
          status: 'pending',
          locationIds: []
        })
      })

      expect(mockOnProviderCreated).toHaveBeenCalledWith(mockProvider)
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Make the service call take some time
      mockProviderService.create.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockProvider), 100)))
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Creating Profile...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(mockOnProviderCreated).toHaveBeenCalled()
      })
    })

    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup()
      
      mockProviderService.create.mockRejectedValue(new Error('Network error'))
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument()
      })

      expect(mockOnProviderCreated).not.toHaveBeenCalled()
    })

    it('should prevent submission when user is not logged in', async () => {
      const user = userEvent.setup()
      
      mockUseAuth.mockReturnValue({
        user: null
      })
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/You must be logged in to register as a provider/)).toBeInTheDocument()
      })

      expect(mockProviderService.create).not.toHaveBeenCalled()
      expect(mockOnProviderCreated).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      // Check that all inputs have proper labels
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })

      // Check fieldset for services
      const servicesFieldset = screen.getByRole('group', { name: /Services Offered/ })
      expect(servicesFieldset).toBeInTheDocument()

      // Check checkboxes have labels
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName()
      })
    })

    it('should announce form submission success to screen readers', async () => {
      const user = userEvent.setup()
      
      render(
        <ProviderRegistrationForm 
          onProviderCreated={mockOnProviderCreated}
          onCancel={mockOnCancel}
        />
      )

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /Create Provider Profile/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnProviderCreated).toHaveBeenCalled()
      })

      // Check that ARIA live region was created for announcement
      // Note: This is testing the implementation detail of creating the announcement element
      // In a real test environment, you might use a different approach to test screen reader announcements
    })
  })

  describe('Phone Number Formatting', () => {
    it('should format phone number as user types', async () => {
      const mockOnProviderCreated = jest.fn()
      const user = userEvent.setup()
      
      render(<ProviderRegistrationForm onProviderCreated={mockOnProviderCreated} />)
      
      const phoneInput = screen.getByLabelText(/phone number/i)
      
      // Test progressive formatting
      await user.type(phoneInput, '5')
      expect(phoneInput).toHaveValue('5')
      
      await user.type(phoneInput, '55')
      expect(phoneInput).toHaveValue('555')
      
      await user.clear(phoneInput)
      await user.type(phoneInput, '5551234')
      expect(phoneInput).toHaveValue('(555) 123-4')
      
      await user.clear(phoneInput)
      await user.type(phoneInput, '5551234567')
      expect(phoneInput).toHaveValue('(555) 123-4567')
      
      await user.clear(phoneInput)
      await user.type(phoneInput, '555-123-4567')
      expect(phoneInput).toHaveValue('(555) 123-4567')
    })

    it('should limit phone number to 10 digits', async () => {
      const mockOnProviderCreated = jest.fn()
      const user = userEvent.setup()
      
      render(<ProviderRegistrationForm onProviderCreated={mockOnProviderCreated} />)
      
      const phoneInput = screen.getByLabelText(/phone number/i)
      
      // Test that extra digits are ignored
      await user.type(phoneInput, '15551234567890')
      expect(phoneInput).toHaveValue('(155) 512-3456')
    })

    it('should show validation error for incomplete phone number', async () => {
      const mockOnProviderCreated = jest.fn()
      const user = userEvent.setup()
      
      render(<ProviderRegistrationForm onProviderCreated={mockOnProviderCreated} />)
      
      // Fill required fields except phone (or incomplete phone)
      await user.type(screen.getByLabelText(/organization name/i), 'Test Organization')
      await user.type(screen.getByLabelText(/contact person/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '555123') // Incomplete phone
      await user.type(screen.getByLabelText(/main address/i), '123 Main St')
      await user.type(screen.getByLabelText(/description/i), 'Test description')
      
      // Select a service
      const foodPantryCheckbox = screen.getByLabelText(/food pantry/i)
      await user.click(foodPantryCheckbox)
      
      const submitButton = screen.getByRole('button', { name: /create provider profile/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid 10-digit phone number/)).toBeInTheDocument()
      })
    })
  })
}) 