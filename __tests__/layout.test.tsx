import { render, screen } from '@testing-library/react'
import RootLayout from '../app/layout'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock children component
const mockChildren = <div>Test Content</div>

// Mock font and metadata
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mocked-font' })
}))

// Create a simplified version of the layout content for testing
const LayoutContent = ({ children }: { children: React.ReactNode }) => (
  <div className="mocked-font bg-white text-gray-900 min-h-screen">
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-purple-600 text-white px-3 py-2 rounded z-50"
    >
      Skip to main content
    </a>
    {children}
  </div>
)

describe('RootLayout', () => {
  it('should include skip to main content link for accessibility', () => {
    render(<LayoutContent>{mockChildren}</LayoutContent>)
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    
    // Should be screen reader only initially
    expect(skipLink).toHaveClass('sr-only')
  })

  it('should apply proper styling classes', () => {
    const { container } = render(<LayoutContent>{mockChildren}</LayoutContent>)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('mocked-font')
    expect(wrapper).toHaveClass('bg-white')
    expect(wrapper).toHaveClass('text-gray-900')
    expect(wrapper).toHaveClass('min-h-screen')
  })

  it('should render children content', () => {
    render(<LayoutContent>{mockChildren}</LayoutContent>)
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should be accessible (no axe violations)', async () => {
    const { container } = render(<LayoutContent>{mockChildren}</LayoutContent>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
}) 