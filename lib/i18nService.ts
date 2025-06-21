/**
 * Internationalization Service for FeedFind.org
 * 
 * Provides comprehensive i18n support with focus on:
 * - Spanish language support for Latino communities
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Cultural appropriateness
 * - Performance optimization
 * - Future RTL language support
 */

import { translations } from './translations'

export type Locale = 'en' | 'es' | 'ar' | 'he'
export type TranslationKey = string
export type TranslationParams = Record<string, any>

interface FormatOptions {
  locale?: Locale
  timeZone?: string
}

export class I18nService {
  private currentLocale: Locale = 'en'
  private fallbackLocale: Locale = 'en'
  private loadedTranslations: Map<Locale, Record<string, any>> = new Map()
  private observers: Set<(locale: Locale) => void> = new Set()
  private cache: Map<string, string> = new Map()

  constructor() {
    this.loadedTranslations.set('en', translations.en)
    this.loadedTranslations.set('es', translations.es)
    this.detectBrowserLanguage()
  }

  /**
   * Detect browser language and set as current locale if supported
   */
  private detectBrowserLanguage(): void {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as Locale
      const supportedLocales: Locale[] = ['en', 'es', 'ar', 'he']
      
      if (supportedLocales.includes(browserLang)) {
        this.currentLocale = browserLang
      }
    }
  }

  /**
   * Set the current locale
   */
  setLocale(locale: Locale): void {
    if (this.currentLocale !== locale) {
      this.currentLocale = locale
      this.cache.clear()
      this.notifyObservers()
      
      // Persist locale preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('feedfind-locale', locale)
        document.documentElement.lang = locale
        document.documentElement.dir = this.isRTL(locale) ? 'rtl' : 'ltr'
      }
    }
  }

  /**
   * Get the current locale
   */
  getLocale(): Locale {
    return this.currentLocale
  }

  /**
   * Load locale from localStorage
   */
  loadPersistedLocale(): Locale {
    if (typeof window !== 'undefined') {
      const persistedLocale = localStorage.getItem('feedfind-locale') as Locale
      if (persistedLocale && ['en', 'es', 'ar', 'he'].includes(persistedLocale)) {
        this.setLocale(persistedLocale)
        return persistedLocale
      }
    }
    return this.currentLocale
  }

  /**
   * Check if a locale uses right-to-left text direction
   */
  isRTL(locale: Locale): boolean {
    return ['ar', 'he'].includes(locale)
  }

  /**
   * Translate a key with optional parameters
   */
  t(key: TranslationKey, params?: TranslationParams): string {
    const cacheKey = `${this.currentLocale}:${key}:${JSON.stringify(params || {})}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // Handle pluralization if count parameter is provided
    if (params && 'count' in params && typeof params.count === 'number') {
      const pluralizedTranslation = this.handlePluralization(key, params.count, params)
      if (pluralizedTranslation !== key) {
        this.cache.set(cacheKey, pluralizedTranslation)
        return pluralizedTranslation
      }
    }

    let translation = this.getTranslation(key, this.currentLocale)
    
    // Fallback to default locale if translation not found
    if (!translation && this.currentLocale !== this.fallbackLocale) {
      translation = this.getTranslation(key, this.fallbackLocale)
    }
    
    // Final fallback to the key itself
    if (!translation) {
      translation = key
    }

    // Handle parameters interpolation
    if (params && typeof translation === 'string') {
      translation = this.interpolate(translation, params)
    }

    this.cache.set(cacheKey, translation)
    return translation
  }

  /**
   * Get translation from loaded translations
   */
  private getTranslation(key: TranslationKey, locale: Locale): string | undefined {
    const translations = this.loadedTranslations.get(locale)
    if (!translations) return undefined

    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    return typeof value === 'string' ? value : undefined
  }

  /**
   * Interpolate parameters into translation string
   */
  private interpolate(translation: string, params: TranslationParams): string {
    // Handle pluralization first if we have a count parameter
    if ('count' in params && typeof params.count === 'number') {
      const pluralizedTranslation = this.handlePluralization(translation, params.count, params)
      if (pluralizedTranslation !== translation) {
        return pluralizedTranslation
      }
    }

    // Regular parameter interpolation
    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in params) {
        return String(params[key])
      }
      return match
    })
  }

  /**
   * Handle pluralization based on locale rules
   */
  private handlePluralization(originalKey: string, count: number, params: TranslationParams): string {
    const pluralRules = new Intl.PluralRules(this.currentLocale)
    const rule = pluralRules.select(count)
    
    // Try to find pluralized versions of the key
    const singularKey = `${originalKey}_one`
    const pluralKey = `${originalKey}_other`
    
    const singularTranslation = this.getTranslation(singularKey, this.currentLocale)
    const pluralTranslation = this.getTranslation(pluralKey, this.currentLocale)
    
    let selectedTranslation: string | undefined
    
    if (rule === 'one' && singularTranslation) {
      selectedTranslation = singularTranslation
    } else if (pluralTranslation) {
      selectedTranslation = pluralTranslation
    }
    
    if (selectedTranslation) {
      // Interpolate all parameters into the selected translation
      return selectedTranslation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (key in params) {
          return String(params[key])
        }
        return match
      })
    }
    
    // Fallback to original key
    return originalKey
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, locale?: Locale, options?: Intl.DateTimeFormatOptions): string {
    const currentLocale = locale || this.currentLocale
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
    
    try {
      return new Intl.DateTimeFormat(this.getIntlLocale(currentLocale), {
        ...defaultOptions,
        ...options
      }).format(date)
    } catch (error) {
      console.warn('Date formatting error:', error)
      return date.toLocaleDateString()
    }
  }

  /**
   * Format time according to locale
   */
  formatTime(date: Date, locale?: Locale, options?: Intl.DateTimeFormatOptions): string {
    const currentLocale = locale || this.currentLocale
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    }
    
    try {
      return new Intl.DateTimeFormat(this.getIntlLocale(currentLocale), {
        ...defaultOptions,
        ...options
      }).format(date)
    } catch (error) {
      console.warn('Time formatting error:', error)
      return date.toLocaleTimeString()
    }
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, locale?: Locale, options?: Intl.NumberFormatOptions): string {
    const currentLocale = locale || this.currentLocale
    
    try {
      return new Intl.NumberFormat(this.getIntlLocale(currentLocale), options).format(number)
    } catch (error) {
      console.warn('Number formatting error:', error)
      return number.toString()
    }
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency: string = 'USD', locale?: Locale): string {
    const currentLocale = locale || this.currentLocale
    
    try {
      return new Intl.NumberFormat(this.getIntlLocale(currentLocale), {
        style: 'currency',
        currency
      }).format(amount)
    } catch (error) {
      console.warn('Currency formatting error:', error)
      return `${currency} ${amount}`
    }
  }

  /**
   * Format distance with appropriate units
   */
  formatDistance(meters: number, locale?: Locale): string {
    const currentLocale = locale || this.currentLocale
    const useMetric = currentLocale !== 'en'
    
    if (useMetric) {
      if (meters < 1000) {
        return `${Math.round(meters)} m`
      } else {
        return `${(meters / 1000).toFixed(1)} km`
      }
    } else {
      const feet = meters * 3.28084
      if (feet < 5280) {
        return `${Math.round(feet)} ft`
      } else {
        const miles = feet / 5280
        return `${miles.toFixed(1)} mi`
      }
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date: Date, locale?: Locale): string {
    const currentLocale = locale || this.currentLocale
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    try {
      const rtf = new Intl.RelativeTimeFormat(this.getIntlLocale(currentLocale), {
        numeric: 'auto'
      })
      
      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second')
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
      }
    } catch (error) {
      console.warn('Relative time formatting error:', error)
      return this.formatDate(date, currentLocale)
    }
  }

  /**
   * Get Intl-compatible locale string
   */
  private getIntlLocale(locale: Locale): string {
    const localeMap: Record<Locale, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'ar': 'ar-SA',
      'he': 'he-IL'
    }
    return localeMap[locale] || 'en-US'
  }

  /**
   * Add observer for locale changes
   */
  addObserver(callback: (locale: Locale) => void): () => void {
    this.observers.add(callback)
    return () => this.observers.delete(callback)
  }

  /**
   * Notify all observers of locale change
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.currentLocale))
  }

  /**
   * Get translation statistics for debugging
   */
  getTranslationStats(): Record<Locale, { total: number; missing: number }> {
    const stats: Record<string, { total: number; missing: number }> = {}
    
    const countKeys = (obj: any, prefix = ''): string[] => {
      const keys: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null) {
          keys.push(...countKeys(value, fullKey))
        } else if (typeof value === 'string') {
          keys.push(fullKey)
        }
      }
      return keys
    }

    const englishTranslations = this.loadedTranslations.get('en')
    const englishKeys = englishTranslations ? countKeys(englishTranslations) : []
    
    for (const [locale, localeTranslations] of this.loadedTranslations.entries()) {
      const localeKeys = countKeys(localeTranslations)
      const missing = englishKeys.filter(key => !localeKeys.includes(key))
      
      stats[locale] = {
        total: englishKeys.length,
        missing: missing.length
      }
    }
    
    return stats as Record<Locale, { total: number; missing: number }>
  }

  /**
   * Validate translation completeness
   */
  validateTranslations(): { locale: Locale; missingKeys: string[] }[] {
    const results: { locale: Locale; missingKeys: string[] }[] = []
    
    const getAllKeys = (obj: any, prefix = ''): string[] => {
      const keys: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null) {
          keys.push(...getAllKeys(value, fullKey))
        } else {
          keys.push(fullKey)
        }
      }
      return keys
    }

    const englishTranslations = this.loadedTranslations.get('en')
    const englishKeys = englishTranslations ? getAllKeys(englishTranslations) : []
    
    for (const [locale, localeTranslations] of this.loadedTranslations.entries()) {
      if (locale === 'en') continue
      
      const localeKeys = getAllKeys(localeTranslations)
      const missingKeys = englishKeys.filter(key => {
        return !this.getTranslation(key, locale as Locale)
      })
      
      if (missingKeys.length > 0) {
        results.push({
          locale: locale as Locale,
          missingKeys
        })
      }
    }
    
    return results
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for actual hit rate
    }
  }

  /**
   * Get all translation keys for a locale
   */
  getTranslationKeys(locale: Locale): string[] {
    const translations = this.loadedTranslations.get(locale)
    if (!translations) return []

    const getAllKeys = (obj: any, prefix = ''): string[] => {
      const keys: string[] = []
      
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null) {
          keys.push(...getAllKeys(value, fullKey))
        } else if (typeof value === 'string') {
          keys.push(fullKey)
        }
      }
      
      return keys
    }

    return getAllKeys(translations)
  }
}

// Export singleton instance
export const i18nService = new I18nService()

// Initialize on module load
if (typeof window !== 'undefined') {
  i18nService.loadPersistedLocale()
}

export default i18nService 