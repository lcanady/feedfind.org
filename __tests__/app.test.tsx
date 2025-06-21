import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock the SuccessMessage component
jest.mock('../components/ui/SuccessMessage', () => {
  return function MockSuccessMessage() {
    return (
      <div data-testid="success-message">
        Profile updated successfully!
      </div>
    )
  }
})

// Mock the AdSense components
jest.mock('../components/ui/AdSense', () => ({
  HeaderAd: () => <div data-testid="header-ad">Header Ad</div>,
  SidebarAd: () => <div data-testid="sidebar-ad">Sidebar Ad</div>,
  FooterAd: () => <div data-testid="footer-ad">Footer Ad</div>
}))

// Mock the Header component
jest.mock('../components/layout/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

// Test for basic app routing and home page
describe('Home Page', () => {
  it('renders with proper heading structure', () => {
    render(<Home />)
    
    // Main site title
    expect(screen.getByRole('heading', { level: 1, name: /feedfind/i })).toBeInTheDocument()
    
    // Category headings - use more specific text
    expect(screen.getByText('food assistance')).toBeInTheDocument()
    expect(screen.getByText('resources')).toBeInTheDocument()
    expect(screen.getByText('recent food assistance listings')).toBeInTheDocument()
  })

  it('has accessible search form', () => {
    render(<Home />)
    
    const searchInput = screen.getByLabelText(/search for food assistance by location/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'text')
    expect(searchInput).toHaveAttribute('name', 'location')
    
    const searchButton = screen.getByRole('button', { name: /search/i })
    expect(searchButton).toBeInTheDocument()
    expect(searchButton).toHaveAttribute('type', 'submit')
  })

  it('displays food assistance categories', () => {
    render(<Home />)
    
    // Check for category links
    expect(screen.getByRole('link', { name: /food banks/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /food pantries/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /soup kitchens/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /meal delivery/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /community gardens/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /senior services/i })).toBeInTheDocument()
  })

  it('shows sample listings with proper status indicators', () => {
    render(<Home />)
    
    // Check for listing titles
    expect(screen.getByText(/Community Food Bank - Emergency Food Distribution/i)).toBeInTheDocument()
    expect(screen.getByText(/St. Mary's Soup Kitchen - Hot Meals Daily/i)).toBeInTheDocument()
    expect(screen.getByText(/Westside Food Pantry - Weekend Distribution/i)).toBeInTheDocument()
    
    // Check for status indicators using getAllByText since there are multiple
    const openNowElements = screen.getAllByText(/OPEN NOW/i)
    expect(openNowElements.length).toBeGreaterThan(0)
    
    expect(screen.getByText(/LIMITED STOCK/i)).toBeInTheDocument()
    expect(screen.getByText(/🔴 CLOSED/i)).toBeInTheDocument()
  })

  it('has proper main content landmark', () => {
    render(<Home />)
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('includes footer with helpful links', () => {
    render(<Home />)
    
    // Check for footer sections using more specific selectors
    const footerHeadings = screen.getAllByText(/about|providers|community|contact/i)
    expect(footerHeadings.length).toBeGreaterThanOrEqual(4)
    
    // Check for some key footer links
    expect(screen.getByRole('link', { name: /help & FAQ/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add your organization/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
  })

  it('has search filters', () => {
    render(<Home />)
    
    // Check for filter checkboxes - use getByLabelText for better specificity
    expect(screen.getByLabelText(/open now/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/within 5 miles/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/no registration required/i)).toBeInTheDocument()
  })

  it('meets accessibility standards', async () => {
    const { container } = render(<Home />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should include success message component', () => {
    render(<Home />)
    
    // The SuccessMessage component is wrapped in Suspense and will render
    expect(screen.getByTestId('success-message')).toBeInTheDocument()
  })
}) 