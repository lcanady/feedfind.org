// @ts-nocheck
import DOMPurify from 'isomorphic-dompurify'

/**
 * Security service for handling input sanitization, XSS prevention, and other security measures
 */
export class SecurityService {
  private static instance: SecurityService
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>()
  private readonly RATE_LIMIT_WINDOW = 60000 // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 10

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  /**
   * Sanitize HTML input to prevent XSS attacks
   */
  public sanitizeHTML(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }

    // Use DOMPurify to clean HTML
    const cleanHTML = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true, // Keep text content, remove tags
    })

    return cleanHTML.trim()
  }

  /**
   * Sanitize text input by removing script tags and dangerous protocols
   */
  public sanitizeTextInput(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }

    // Remove script tags and their content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '')
    
    // Remove data: protocol for potential data URIs
    sanitized = sanitized.replace(/data:/gi, '')
    
    // Remove other dangerous protocols
    sanitized = sanitized.replace(/vbscript:/gi, '')
    sanitized = sanitized.replace(/onload\s*=/gi, '')
    sanitized = sanitized.replace(/onerror\s*=/gi, '')
    
    // Remove HTML entity attempts to bypass filtering
    sanitized = sanitized.replace(/&[#x]?[a-z0-9]+;/gi, '')

    return sanitized.trim()
  }

  /**
   * Validate and sanitize email addresses
   */
  public sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return ''
    }

    // Basic sanitization - remove dangerous characters
    let sanitized = email.replace(/[<>\"']/g, '')
    sanitized = this.sanitizeTextInput(sanitized)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format')
    }

    return sanitized.toLowerCase().trim()
  }

  /**
   * Sanitize and validate phone numbers
   */
  public sanitizePhoneNumber(phone: string): string {
    if (typeof phone !== 'string') {
      return ''
    }

    // Remove all non-digit characters except parentheses, spaces, and hyphens
    let sanitized = phone.replace(/[^\d\s\-\(\)]/g, '')
    
    // Remove any HTML or script attempts
    sanitized = this.sanitizeTextInput(sanitized)

    // Validate US phone number format
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    if (sanitized && !phoneRegex.test(sanitized.replace(/\s/g, ''))) {
      throw new Error('Invalid phone number format')
    }

    return sanitized.trim()
  }

  /**
   * Sanitize ZIP codes to prevent injection attacks
   */
  public sanitizeZipCode(zipCode: string): string {
    if (typeof zipCode !== 'string') {
      return ''
    }

    // Remove all non-digit characters and hyphens
    let sanitized = zipCode.replace(/[^\d\-]/g, '')
    
    // Remove any HTML or script attempts
    sanitized = this.sanitizeTextInput(sanitized)

    // Validate ZIP code format (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (sanitized && !zipRegex.test(sanitized)) {
      throw new Error('Invalid ZIP code format')
    }

    return sanitized
  }

  /**
   * Generate CSRF token for form protection
   */
  public generateCSRFToken(): string {
    const timestamp = Date.now().toString()
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
    
    return `${timestamp}-${randomString}`
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(token: string, maxAge: number = 3600000): boolean {
    if (!token || typeof token !== 'string') {
      return false
    }

    const parts = token.split('-')
    if (parts.length !== 2) {
      return false
    }

    const timestamp = parseInt(parts[0], 10)
    if (isNaN(timestamp)) {
      return false
    }

    // Check if token is expired
    const now = Date.now()
    if (now - timestamp > maxAge) {
      return false
    }

    // Check if random part is valid hex
    const randomPart = parts[1]
    if (!/^[a-f0-9]{64}$/.test(randomPart)) {
      return false
    }

    return true
  }

  /**
   * Check rate limiting for a given identifier (IP, user ID, etc.)
   */
  public checkRateLimit(identifier: string, maxRequests?: number): boolean {
    const now = Date.now()
    const limit = maxRequests || this.MAX_REQUESTS_PER_WINDOW
    
    let rateLimitData = this.rateLimitMap.get(identifier)
    
    if (!rateLimitData || now - rateLimitData.lastReset > this.RATE_LIMIT_WINDOW) {
      // First request or window expired, reset
      rateLimitData = { count: 1, lastReset: now }
      this.rateLimitMap.set(identifier, rateLimitData)
      return true
    }

    if (rateLimitData.count >= limit) {
      return false // Rate limit exceeded
    }

    rateLimitData.count++
    return true
  }

  /**
   * Get remaining requests for rate limit
   */
  public getRemainingRequests(identifier: string, maxRequests?: number): number {
    const limit = maxRequests || this.MAX_REQUESTS_PER_WINDOW
    const rateLimitData = this.rateLimitMap.get(identifier)
    
    if (!rateLimitData) {
      return limit
    }

    const now = Date.now()
    if (now - rateLimitData.lastReset > this.RATE_LIMIT_WINDOW) {
      return limit
    }

    return Math.max(0, limit - rateLimitData.count)
  }

  /**
   * Reset rate limit for a specific identifier
   */
  public resetRateLimit(identifier: string): void {
    this.rateLimitMap.delete(identifier)
  }

  /**
   * Validate origin header for CSRF protection
   */
  public validateOrigin(origin: string, allowedOrigins: string[]): boolean {
    if (!origin || typeof origin !== 'string') {
      return false
    }

    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '')
    
    return allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '')
      return normalizedOrigin === normalizedAllowed
    })
  }

  /**
   * Sanitize database query parameters to prevent injection
   */
  public sanitizeQueryParam(param: any): string {
    if (param === null || param === undefined) {
      return ''
    }

    let sanitized = String(param)
    
    // Remove SQL injection attempts
    sanitized = sanitized.replace(/['";\\]/g, '')
    sanitized = sanitized.replace(/(--)|(\/\*)|(\*\/)/g, '')
    sanitized = sanitized.replace(/\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|EXEC|UNION|SELECT)\b/gi, '')
    
    // Remove HTML/script attempts
    sanitized = this.sanitizeTextInput(sanitized)

    return sanitized.trim()
  }

  /**
   * Create a secure random string for IDs, tokens, etc.
   */
  public generateSecureRandomString(length: number = 32): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const randomBytes = crypto.getRandomValues(new Uint8Array(length))
    
    return Array.from(randomBytes, byte => characters[byte % characters.length]).join('')
  }

  /**
   * Hash sensitive data (for comparison, not storage)
   */
  public async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validate content security policy compliance
   */
  public validateCSP(content: string): { isValid: boolean; violations: string[] } {
    const violations: string[] = []

    // Check for inline scripts
    if (/<script(?:[^>]*)?>(.*?)<\/script>/gi.test(content)) {
      violations.push('Inline script detected')
    }

    // Check for javascript: URLs
    if (/javascript:/gi.test(content)) {
      violations.push('JavaScript URL detected')
    }

    // Check for inline event handlers
    if (/on\w+\s*=/gi.test(content)) {
      violations.push('Inline event handler detected')
    }

    // Check for data: URLs
    if (/data:/gi.test(content)) {
      violations.push('Data URL detected')
    }

    return {
      isValid: violations.length === 0,
      violations
    }
  }

  /**
   * Secure localStorage operations
   */
  public secureLocalStorage = {
    setItem: (key: string, value: string): void => {
      // Don't store sensitive data in localStorage
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /private/i,
        /ssn/i,
        /social.*security/i,
        /credit.*card/i
      ]

      const isSensitive = sensitivePatterns.some(pattern => 
        pattern.test(key) || pattern.test(value)
      )

      if (isSensitive) {
        console.warn('Attempted to store sensitive data in localStorage:', key)
        return
      }

      try {
        localStorage.setItem(key, value)
      } catch (error) {
        console.error('Failed to store in localStorage:', error)
      }
    },

    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.error('Failed to retrieve from localStorage:', error)
        return null
      }
    },

    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error('Failed to remove from localStorage:', error)
      }
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance()

// Security utility functions for common use cases
export const sanitizeInput = (input: string): string => {
  return securityService.sanitizeTextInput(input)
}

export const sanitizeHTML = (html: string): string => {
  return securityService.sanitizeHTML(html)
}

export const validateEmail = (email: string): string => {
  return securityService.sanitizeEmail(email)
}

export const validatePhoneNumber = (phone: string): string => {
  return securityService.sanitizePhoneNumber(phone)
}

export const validateZipCode = (zipCode: string): string => {
  return securityService.sanitizeZipCode(zipCode)
}

export const checkRateLimit = (identifier: string): boolean => {
  return securityService.checkRateLimit(identifier)
}

export const generateCSRFToken = (): string => {
  return securityService.generateCSRFToken()
}

export const validateCSRFToken = (token: string): boolean => {
  return securityService.validateCSRFToken(token)
} 