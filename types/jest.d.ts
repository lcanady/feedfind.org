import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(className: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveFocus(): R
      toHaveValue(value: string | number): R
      toHaveNoViolations(): R
    }
  }
} 