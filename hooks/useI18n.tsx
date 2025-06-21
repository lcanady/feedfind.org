'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { i18nService, Locale, TranslationKey, TranslationParams } from '../lib/i18nService'

/**
 * I18n Context Type
 */
interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency?: string) => string
  formatDistance: (meters: number) => string
  formatRelativeTime: (date: Date) => string
  isRTL: boolean
  isLoading: boolean
}

/**
 * I18n Context
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined)

/**
 * I18n Provider Props
 */
export interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
  defaultLocale?: Locale
}

/**
 * I18n Provider Component
 * 
 * Provides internationalization context to the entire application
 * with support for Spanish language and future RTL languages.
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  initialLocale,
  defaultLocale = 'en'
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale
    // In test environment, use defaultLocale
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return defaultLocale
    }
    return i18nService.loadPersistedLocale()
  })
  const [isLoading, setIsLoading] = useState(false)

  // Set initial locale
  useEffect(() => {
    if (initialLocale && initialLocale !== locale) {
      setLocaleState(initialLocale)
      i18nService.setLocale(initialLocale)
    }
  }, [initialLocale, locale])

  // Subscribe to locale changes from the service
  useEffect(() => {
    const unsubscribe = i18nService.addObserver((newLocale) => {
      setLocaleState(newLocale)
    })

    return unsubscribe
  }, [])

  // Update document attributes when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = i18nService.isRTL(locale) ? 'rtl' : 'ltr'
    }
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setIsLoading(true)
    i18nService.setLocale(newLocale)
    setIsLoading(false)
  }

  const t = (key: TranslationKey, params?: TranslationParams): string => {
    return i18nService.t(key, params)
  }

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return i18nService.formatDate(date, locale, options)
  }

  const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return i18nService.formatTime(date, locale, options)
  }

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return i18nService.formatNumber(number, locale, options)
  }

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return i18nService.formatCurrency(amount, currency, locale)
  }

  const formatDistance = (meters: number): string => {
    return i18nService.formatDistance(meters, locale)
  }

  const formatRelativeTime = (date: Date): string => {
    return i18nService.formatRelativeTime(date, locale)
  }

  const contextValue: I18nContextValue = {
    locale,
    setLocale,
    t,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    formatDistance,
    formatRelativeTime,
    isRTL: i18nService.isRTL(locale),
    isLoading
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * Hook to access the full i18n context
 */
export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

/**
 * Hook for simple translation access
 */
export const useTranslation = () => {
  const { t } = useI18n()
  return { t }
}

/**
 * Hook for locale management
 */
export const useLocale = () => {
  const { locale, setLocale, isRTL } = useI18n()
  return { locale, setLocale, isRTL }
}

/**
 * Hook for formatting functions
 */
export const useFormatting = () => {
  const { 
    formatDate, 
    formatTime, 
    formatNumber, 
    formatCurrency, 
    formatDistance, 
    formatRelativeTime 
  } = useI18n()
  
  return {
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    formatDistance,
    formatRelativeTime
  }
}

/**
 * Higher-order component to provide i18n context
 */
export const withI18n = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    const i18n = useI18n()
    return <Component {...props} {...i18n} />
  }
  
  WrappedComponent.displayName = `withI18n(${Component.displayName || Component.name})`
  return WrappedComponent
}

/**
 * Language switcher component
 */
interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons'
  className?: string
  showLabels?: boolean
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
  showLabels = true
}) => {
  const { locale, setLocale, t } = useI18n()

  const languages = [
    { code: 'en' as Locale, name: 'English', nativeName: 'English' },
    { code: 'es' as Locale, name: 'Spanish', nativeName: 'Español' },
    { code: 'ar' as Locale, name: 'Arabic', nativeName: 'العربية' },
    { code: 'he' as Locale, name: 'Hebrew', nativeName: 'עברית' }
  ]

  if (variant === 'dropdown') {
    return (
      <div className={`language-switcher ${className}`}>
        {showLabels && (
          <label htmlFor="language-select" className="sr-only">
            {t('accessibility.selectLanguage')}
          </label>
        )}
        <select
          id="language-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('accessibility.selectLanguage')}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className={`language-switcher ${className}`} role="group" aria-label={t('accessibility.selectLanguage')}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            locale === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={locale === lang.code}
          title={lang.name}
        >
          {showLabels ? lang.nativeName : lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/**
 * Text component that automatically handles RTL text direction
 */
interface I18nTextProps {
  children: ReactNode
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

export const I18nText: React.FC<I18nTextProps> = ({ 
  children, 
  className = '', 
  as: Component = 'span' 
}) => {
  const { isRTL } = useI18n()
  
  return (
    <Component 
      className={`${className} ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </Component>
  )
}

/**
 * Hook for handling pluralization
 */
export const usePlural = () => {
  const { locale } = useI18n()
  
  const plural = (count: number, forms: string[]): string => {
    const pluralRules = new Intl.PluralRules(locale)
    const rule = pluralRules.select(count)
    
    switch (rule) {
      case 'zero':
        return forms[0] || forms[forms.length - 1] || ''
      case 'one':
        return forms[0] || forms[forms.length - 1] || ''
      case 'two':
        return forms[1] || forms[0] || forms[forms.length - 1] || ''
      case 'few':
        return forms[2] || forms[1] || forms[0] || forms[forms.length - 1] || ''
      case 'many':
        return forms[3] || forms[2] || forms[1] || forms[0] || forms[forms.length - 1] || ''
      case 'other':
        return forms[forms.length - 1] || forms[0] || forms[1] || ''
      default:
        return forms[0] || forms[forms.length - 1] || ''
    }
  }
  
  return { plural }
}

/**
 * Hook for handling currency formatting with locale-specific defaults
 */
export const useCurrency = () => {
  const { locale, formatCurrency } = useI18n()
  
  const getDefaultCurrency = (): string => {
    switch (locale) {
      case 'es':
        return 'USD' // Most Spanish speakers in US context use USD
      case 'ar':
        return 'SAR' // Saudi Riyal for Arabic
      case 'he':
        return 'ILS' // Israeli Shekel for Hebrew
      default:
        return 'USD'
    }
  }
  
  const formatLocalCurrency = (amount: number, currency?: string): string => {
    return formatCurrency(amount, currency || getDefaultCurrency())
  }
  
  return { formatLocalCurrency, getDefaultCurrency }
}

/**
 * Hook for handling date/time formatting with locale-specific defaults
 */
export const useDateTime = () => {
  const { locale, formatDate, formatTime, formatRelativeTime } = useI18n()
  
  const formatShortDate = (date: Date): string => {
    return formatDate(date, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  const formatLongDate = (date: Date): string => {
    return formatDate(date, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }
  
  const formatShortTime = (date: Date): string => {
    return formatTime(date, { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  const formatLongTime = (date: Date): string => {
    return formatTime(date, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }
  
  return {
    formatShortDate,
    formatLongDate,
    formatShortTime,
    formatLongTime,
    formatRelativeTime
  }
}

export default useI18n 