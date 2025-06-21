'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorHandlingService, ErrorType, ErrorSeverity } from '../../lib/errorHandlingService'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
  showDetails: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
      showDetails: false
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using our error handling service
    const appError = errorHandlingService.createAppError({
      type: ErrorType.CLIENT_ERROR,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      originalError: error,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId
      }
    })

    errorHandlingService.handleError(appError, {
      logToConsole: true,
      logToService: true,
      showUserMessage: false // We'll show our own UI
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    console.error('Setup Error Boundary caught an error:', error, errorInfo)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false
    })
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  handleReportError = () => {
    // In a real application, this would open a feedback form or support ticket
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.log('Error report:', errorDetails)
    
    // Copy error details to clipboard for easy reporting
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
        .then(() => {
          alert('Error details copied to clipboard. Please include this when reporting the issue.')
        })
        .catch(() => {
          console.error('Failed to copy error details to clipboard')
        })
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Error icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Application Error
              </h1>

              {/* Error Message */}
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. We apologize for the inconvenience.
              </p>

              {/* Error ID for support */}
              {this.state.errorId && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-500 mb-1">Error ID:</p>
                  <code className="text-xs font-mono text-gray-700 break-all">
                    {this.state.errorId}
                  </code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={this.handleRefresh}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Refresh the page to try again"
                >
                  Refresh Page
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  aria-label="Try to recover without refreshing"
                >
                  Try Again
                </button>
              </div>

              {/* Additional Actions */}
              <div className="space-y-2">
                <button
                  onClick={this.handleReportError}
                  className="w-full text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
                  aria-label="Report this error to support"
                >
                  Report Error
                </button>

                <button
                  onClick={this.toggleDetails}
                  className="w-full text-gray-600 hover:text-gray-700 font-medium focus:outline-none focus:underline"
                  aria-expanded={this.state.showDetails}
                  aria-controls="error-details"
                >
                  {this.state.showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
                </button>
              </div>

              {/* Technical Details */}
              {this.state.showDetails && (
                <div
                  id="error-details"
                  className="mt-6 p-4 bg-gray-50 rounded-lg text-left"
                  role="region"
                  aria-label="Technical error details"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Details</h3>
                  <div className="space-y-2 text-sm">
                    {this.state.error?.name && (
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>{' '}
                        <span className="text-gray-600">{this.state.error.name}</span>
                      </div>
                    )}
                    {this.state.error?.message && (
                      <div>
                        <span className="font-medium text-gray-700">Message:</span>{' '}
                        <span className="text-gray-600 break-words">{this.state.error.message}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Time:</span>{' '}
                      <span className="text-gray-600">{new Date().toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Page:</span>{' '}
                      <span className="text-gray-600 break-all">{window.location.pathname}</span>
                    </div>
                  </div>
                  
                  {this.state.error?.stack && (
                    <details className="mt-4">
                      <summary className="font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto text-gray-600">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Accessibility announcement for screen readers */}
              <div
                className="sr-only"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                An application error has occurred. Please use the refresh button to try again or contact support if the problem persists.
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If this problem persists, please contact support with the error ID above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 