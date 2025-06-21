/**
 * Error handling service for managing different types of errors, user-friendly messages, and recovery mechanisms
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
  MAPS_API_ERROR = 'MAPS_API_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  userMessage: string
  originalError?: Error
  context?: Record<string, any>
  timestamp: Date
  userId?: string
  retryable: boolean
  retryCount?: number
  maxRetries?: number
}

export interface ErrorHandlerOptions {
  logToConsole?: boolean
  logToService?: boolean
  showUserMessage?: boolean
  retryable?: boolean
  maxRetries?: number
  retryDelay?: number
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService
  private errorLog: AppError[] = []
  private maxLogSize = 1000
  private retryMap = new Map<string, number>()

  private constructor() {
    // Private constructor for singleton pattern
    this.setupGlobalErrorHandlers()
  }

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason)
        this.handleError(this.createAppError({
          type: ErrorType.UNKNOWN_ERROR,
          severity: ErrorSeverity.HIGH,
          message: 'Unhandled promise rejection',
          originalError: event.reason,
          context: { source: 'unhandledrejection' }
        }))
        event.preventDefault()
      })

      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        console.error('Uncaught error:', event.error)
        this.handleError(this.createAppError({
          type: ErrorType.UNKNOWN_ERROR,
          severity: ErrorSeverity.HIGH,
          message: 'Uncaught error',
          originalError: event.error,
          context: { 
            source: 'error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }))
      })
    }
  }

  /**
   * Create a standardized AppError
   */
  public createAppError(params: {
    type: ErrorType
    severity: ErrorSeverity
    message: string
    originalError?: Error
    context?: Record<string, any>
    userId?: string
    retryable?: boolean
    maxRetries?: number
  }): AppError {
    return {
      ...params,
      userMessage: this.getUserFriendlyMessage(params.type, params.message),
      timestamp: new Date(),
      retryable: params.retryable ?? this.isRetryableError(params.type),
      retryCount: 0,
      maxRetries: params.maxRetries ?? 3
    }
  }

  /**
   * Handle different types of errors with appropriate user messages and recovery options
   */
  public handleError(error: AppError, options: ErrorHandlerOptions = {}): void {
    // Log the error
    this.logError(error, options)

    // Store in error log
    this.addToErrorLog(error)

    // Handle retries if the error is retryable
    if (error.retryable && options.retryable !== false) {
      this.handleRetry(error, options)
    }

    // Show user message if requested
    if (options.showUserMessage !== false) {
      this.showUserNotification(error)
    }
  }

  /**
   * Convert various error types to standardized AppError
   */
  public normalizeError(error: any, context?: Record<string, any>): AppError {
    if (error instanceof Error) {
      return this.createAppError({
        type: this.classifyError(error),
        severity: this.determineSeverity(error),
        message: error.message,
        originalError: error,
        context,
        retryable: this.isRetryableError(this.classifyError(error))
      })
    }

    if (typeof error === 'string') {
      return this.createAppError({
        type: ErrorType.CLIENT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error,
        context,
        retryable: false
      })
    }

    if (error && typeof error === 'object' && error.code) {
      return this.createAppError({
        type: this.classifyFirebaseError(error.code),
        severity: this.determineSeverity(error),
        message: error.message || 'Unknown error occurred',
        originalError: error,
        context: { ...context, errorCode: error.code },
        retryable: this.isRetryableFirebaseError(error.code)
      })
    }

    return this.createAppError({
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      message: 'An unknown error occurred',
      originalError: error instanceof Error ? error : new Error(String(error)),
      context,
      retryable: false
    })
  }

  /**
   * Classify error type based on error properties
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || name.includes('networkerror')) {
      return ErrorType.NETWORK_ERROR
    }

    if (message.includes('auth') || message.includes('unauthorized') || name.includes('autherror')) {
      return ErrorType.AUTHENTICATION_ERROR
    }

    if (message.includes('permission') || message.includes('forbidden') || message.includes('authorization')) {
      return ErrorType.AUTHORIZATION_ERROR
    }

    if (message.includes('validation') || message.includes('invalid') || name.includes('validationerror')) {
      return ErrorType.VALIDATION_ERROR
    }

    if (message.includes('not found') || name.includes('notfounderror')) {
      return ErrorType.NOT_FOUND_ERROR
    }

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorType.RATE_LIMIT_ERROR
    }

    if (message.includes('server') || name.includes('servererror')) {
      return ErrorType.SERVER_ERROR
    }

    return ErrorType.CLIENT_ERROR
  }

  /**
   * Classify Firebase-specific errors
   */
  private classifyFirebaseError(code: string): ErrorType {
    const firebaseErrorMap: Record<string, ErrorType> = {
      'auth/network-request-failed': ErrorType.NETWORK_ERROR,
      'auth/too-many-requests': ErrorType.RATE_LIMIT_ERROR,
      'auth/user-disabled': ErrorType.AUTHORIZATION_ERROR,
      'auth/user-not-found': ErrorType.NOT_FOUND_ERROR,
      'auth/wrong-password': ErrorType.AUTHENTICATION_ERROR,
      'auth/invalid-email': ErrorType.VALIDATION_ERROR,
      'auth/weak-password': ErrorType.VALIDATION_ERROR,
      'auth/email-already-in-use': ErrorType.VALIDATION_ERROR,
      'permission-denied': ErrorType.AUTHORIZATION_ERROR,
      'not-found': ErrorType.NOT_FOUND_ERROR,
      'already-exists': ErrorType.VALIDATION_ERROR,
      'resource-exhausted': ErrorType.RATE_LIMIT_ERROR,
      'unauthenticated': ErrorType.AUTHENTICATION_ERROR,
      'unavailable': ErrorType.SERVER_ERROR,
      'deadline-exceeded': ErrorType.NETWORK_ERROR,
      'internal': ErrorType.SERVER_ERROR
    }

    return firebaseErrorMap[code] || ErrorType.FIREBASE_ERROR
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: any): ErrorSeverity {
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorSeverity.HIGH
    }

    if (error.message?.includes('network') || error.message?.includes('server')) {
      return ErrorSeverity.MEDIUM
    }

    if (error.message?.includes('validation') || error.message?.includes('invalid')) {
      return ErrorSeverity.LOW
    }

    return ErrorSeverity.MEDIUM
  }

  /**
   * Check if an error type is retryable
   */
  private isRetryableError(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.SERVER_ERROR,
      ErrorType.RATE_LIMIT_ERROR,
      ErrorType.MAPS_API_ERROR
    ]

    return retryableTypes.includes(type)
  }

  /**
   * Check if a Firebase error is retryable
   */
  private isRetryableFirebaseError(code: string): boolean {
    const retryableCodes = [
      'auth/network-request-failed',
      'unavailable',
      'deadline-exceeded',
      'internal',
      'resource-exhausted'
    ]

    return retryableCodes.includes(code)
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection and try again.',
      [ErrorType.AUTHENTICATION_ERROR]: 'Please check your login credentials and try again.',
      [ErrorType.AUTHORIZATION_ERROR]: 'You don\'t have permission to perform this action.',
      [ErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorType.NOT_FOUND_ERROR]: 'The requested information could not be found.',
      [ErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
      [ErrorType.SERVER_ERROR]: 'Server is temporarily unavailable. Please try again later.',
      [ErrorType.CLIENT_ERROR]: 'Something went wrong. Please try again.',
      [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
      [ErrorType.FIREBASE_ERROR]: 'Service temporarily unavailable. Please try again later.',
      [ErrorType.MAPS_API_ERROR]: 'Map service is temporarily unavailable. Please try again later.'
    }

    return messages[type] || 'An error occurred. Please try again.'
  }

  /**
   * Handle retry logic for retryable errors
   */
  private handleRetry(error: AppError, options: ErrorHandlerOptions): void {
    const errorId = this.generateErrorId(error)
    const currentRetryCount = this.retryMap.get(errorId) || 0

    if (currentRetryCount < (error.maxRetries || 3)) {
      this.retryMap.set(errorId, currentRetryCount + 1)
      
      const delay = (options.retryDelay || 1000) * Math.pow(2, currentRetryCount) // Exponential backoff
      
      setTimeout(() => {
        console.log(`Retrying operation (attempt ${currentRetryCount + 1})`)
        // The actual retry logic would be handled by the calling code
        // This just logs the retry attempt
      }, delay)
    } else {
      this.retryMap.delete(errorId)
      console.error(`Max retries (${error.maxRetries}) exceeded for error:`, error.message)
    }
  }

  /**
   * Generate a unique ID for error tracking
   */
  private generateErrorId(error: AppError): string {
    return `${error.type}-${error.message}-${error.context?.source || 'unknown'}`
  }

  /**
   * Log error to console and/or external service
   */
  private logError(error: AppError, options: ErrorHandlerOptions): void {
    if (options.logToConsole !== false) {
      const logLevel = this.getLogLevel(error.severity)
      console[logLevel](`[${error.type}] ${error.message}`, {
        severity: error.severity,
        timestamp: error.timestamp,
        context: error.context,
        originalError: error.originalError
      })
    }

    if (options.logToService) {
      // In a real application, this would send to an external logging service
      // For now, we'll just store it locally
      this.sendToLoggingService(error)
    }
  }

  /**
   * Get appropriate console log level based on severity
   */
  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warn'
      case ErrorSeverity.LOW:
        return 'info'
      default:
        return 'error'
    }
  }

  /**
   * Add error to internal log
   */
  private addToErrorLog(error: AppError): void {
    this.errorLog.push(error)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize)
    }
  }

  /**
   * Send error to external logging service
   */
  private sendToLoggingService(error: AppError): void {
    // In a real application, this would send to services like Sentry, LogRocket, etc.
    console.log('Would send to logging service:', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      timestamp: error.timestamp,
      context: error.context
    })
  }

  /**
   * Show user notification (would integrate with a toast/notification system)
   */
  private showUserNotification(error: AppError): void {
    // In a real application, this would show a toast notification or similar
    console.log('User notification:', error.userMessage)
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number
    errorsByType: Record<ErrorType, number>
    errorsBySeverity: Record<ErrorSeverity, number>
    recentErrors: AppError[]
  } {
    const errorsByType = this.errorLog.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    }, {} as Record<ErrorType, number>)

    const errorsBySeverity = this.errorLog.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<ErrorSeverity, number>)

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsBySeverity,
      recentErrors: this.errorLog.slice(-10)
    }
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = []
    this.retryMap.clear()
  }

  /**
   * Get errors by type
   */
  public getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type)
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorLog.filter(error => error.severity === severity)
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance()

// Utility functions for common error handling tasks
export const handleError = (error: any, context?: Record<string, any>, options?: ErrorHandlerOptions): void => {
  const appError = errorHandlingService.normalizeError(error, context)
  errorHandlingService.handleError(appError, options)
}

export const createAppError = (params: {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  originalError?: Error
  context?: Record<string, any>
  userId?: string
  retryable?: boolean
  maxRetries?: number
}): AppError => {
  return errorHandlingService.createAppError(params)
}

export const getErrorStats = () => {
  return errorHandlingService.getErrorStats()
}

export const clearErrorLog = () => {
  errorHandlingService.clearErrorLog()
} 