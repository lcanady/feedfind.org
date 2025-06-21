import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { i18nService } from '../../lib/i18nService'

describe('Internationalization', () => {
  beforeEach(() => {
    // Reset i18n service to English
    i18nService.setLocale('en')
  })

  it('should load English translations correctly', () => {
    const title = i18nService.t('common.search')
    expect(title).toBe('Search')
    
    const locale = i18nService.getLocale()
    expect(locale).toBe('en')
  })

  it('should load Spanish translations correctly', () => {
    i18nService.setLocale('es')
    
    const title = i18nService.t('common.search')
    expect(title).toBe('Buscar')
    
    const locale = i18nService.getLocale()
    expect(locale).toBe('es')
  })

  it('should handle missing translation keys gracefully', () => {
    const missing = i18nService.t('nonexistent.key')
    expect(missing).toBe('nonexistent.key')
  })

  it('should format dates and numbers for different locales', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')
    const testNumber = 1234.56

    // English formatting
    const enDateFormat = i18nService.formatDate(testDate, 'en')
    const enNumberFormat = i18nService.formatNumber(testNumber, 'en')
    
    expect(enDateFormat).toMatch(/Jan|January/)
    expect(enNumberFormat).toBe('1,234.56')

    // Spanish formatting
    const esDateFormat = i18nService.formatDate(testDate, 'es')
    const esNumberFormat = i18nService.formatNumber(testNumber, 'es')
    
    expect(esDateFormat).toMatch(/ene|enero/)
    expect(esNumberFormat).toBe('1234,56')
  })

  it('should handle pluralization rules correctly', () => {
    // English pluralization
    const singleReview = i18nService.t('location.reviews', { count: 1 })
    const multipleReviews = i18nService.t('location.reviews', { count: 3 })
    
    expect(singleReview).toBe('1 review')
    expect(multipleReviews).toBe('3 reviews')
    
    // Spanish pluralization
    i18nService.setLocale('es')
    const singleReviewEs = i18nService.t('location.reviews', { count: 1 })
    const multipleReviewsEs = i18nService.t('location.reviews', { count: 3 })
    
    expect(singleReviewEs).toBe('1 reseña')
    expect(multipleReviewsEs).toBe('3 reseñas')
  })

  it('should support right-to-left languages for future expansion', () => {
    // Test RTL language support infrastructure
    const isRTL = i18nService.isRTL('ar') // Arabic
    expect(isRTL).toBe(true)

    const isLTR = i18nService.isRTL('en') // English
    expect(isLTR).toBe(false)

    const isSpanishLTR = i18nService.isRTL('es') // Spanish
    expect(isSpanishLTR).toBe(false)
  })

  it('should handle translation interpolation with variables', () => {
    const interpolated = i18nService.t('search.resultsCount', { count: 5 })
    expect(interpolated).toBe('5 results found')
    
    // Test in Spanish
    i18nService.setLocale('es')
    const interpolatedEs = i18nService.t('search.resultsCount', { count: 5 })
    expect(interpolatedEs).toBe('5 resultados encontrados')
  })

  it('should validate translation completeness', () => {
    const englishKeys = i18nService.getTranslationKeys('en')
    const spanishKeys = i18nService.getTranslationKeys('es')
    
    expect(englishKeys.length).toBeGreaterThan(0)
    expect(spanishKeys.length).toBeGreaterThan(0)
    
    // Check for core translation keys
    expect(englishKeys).toContain('common.search')
    expect(spanishKeys).toContain('common.search')
  })
}) 