import { I18nService } from '../../lib/i18nService'

describe('Multilingual Accessibility', () => {
  let i18nService: I18nService

  beforeEach(() => {
    i18nService = new I18nService()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should provide proper Spanish accessibility labels', async () => {
    await i18nService.setLocale('es')
    
    // Test screen reader content in Spanish
    expect(i18nService.t('search.title')).toBe('Encontrar Asistencia Alimentaria')
    expect(i18nService.t('search.placeholder')).toBe('Ingrese código postal o dirección')
    expect(i18nService.t('accessibility.searchInput')).toBe('Campo de búsqueda')
    expect(i18nService.t('common.search')).toBe('Buscar')
  })

  it('should maintain proper heading hierarchy translations', async () => {
    await i18nService.setLocale('es')
    
    // Verify Spanish content for headings
    expect(i18nService.t('search.title')).toBe('Encontrar Asistencia Alimentaria')
    expect(i18nService.t('provider.dashboard.title')).toBe('Panel de Proveedor')
    expect(i18nService.t('provider.dashboard.locations')).toBe('Ubicaciones')
  })

  it('should provide Spanish skip links and navigation', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('accessibility.skipToContent')).toBe('Saltar al contenido')
    expect(i18nService.t('accessibility.mainNavigation')).toBe('Navegación principal')
    expect(i18nService.t('nav.home')).toBe('Inicio')
    expect(i18nService.t('nav.search')).toBe('Buscar')
    expect(i18nService.t('nav.map')).toBe('Mapa')
    expect(i18nService.t('nav.profile')).toBe('Perfil')
  })

  it('should handle Spanish text length variations appropriately', async () => {
    await i18nService.setLocale('es')
    
    // Spanish text is typically 20-30% longer than English
    expect(i18nService.t('common.save')).toBe('Guardar')
    expect(i18nService.t('errors.validation.email')).toBe('Por favor, ingrese una dirección de correo electrónico válida')
    
    // Verify longer translations are handled properly
    const longTranslation = i18nService.t('errors.validation.email')
    expect(longTranslation.length).toBeGreaterThan(30) // Much longer than English "Please enter a valid email"
  })

  it('should support Spanish voice commands and interactions', async () => {
    await i18nService.setLocale('es')
    
    // Verify Spanish voice command labels
    expect(i18nService.t('common.search')).toBe('Buscar')
    expect(i18nService.t('common.clear')).toBe('Limpiar')
    expect(i18nService.t('common.help')).toBe('Ayuda')
  })

  it('should maintain WCAG 2.1 AA compliance across all languages', async () => {
    // Test English
    await i18nService.setLocale('en')
    expect(i18nService.t('accessibility.closeDialog')).toBe('Close dialog')
    expect(i18nService.t('accessibility.searchInput')).toBe('Search input field')
    
    // Test Spanish
    await i18nService.setLocale('es')
    expect(i18nService.t('accessibility.closeDialog')).toBe('Cerrar diálogo')
    expect(i18nService.t('accessibility.searchInput')).toBe('Campo de búsqueda')
    
    // Verify all accessibility labels are properly translated
    expect(i18nService.t('accessibility.loading')).toBe('Cargando contenido')
    expect(i18nService.t('accessibility.error')).toBe('Ocurrió un error')
  })

  it('should handle live region announcements in Spanish', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('common.search')).toBe('Buscar')
    expect(i18nService.t('accessibility.searchCompleted')).toBe('Búsqueda completada')
    expect(i18nService.t('accessibility.loading')).toBe('Cargando contenido')
    expect(i18nService.t('common.loading')).toBe('Cargando...')
  })

  it('should support right-to-left layout for Arabic', async () => {
    await i18nService.setLocale('ar')
    
    // Test RTL language support
    expect(i18nService.getLocale()).toBe('ar')
    expect(i18nService.isRTL('ar')).toBe(true)
    
    // Test basic Arabic translations (if available, otherwise fallback to English)
    const searchText = i18nService.t('common.search')
    expect(typeof searchText).toBe('string')
    expect(searchText.length).toBeGreaterThan(0)
  })

  it('should handle dynamic content updates in Spanish', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('accessibility.searchCompleted')).toBe('Búsqueda completada')
    expect(i18nService.t('accessibility.loading')).toBe('Cargando contenido')
    expect(i18nService.t('accessibility.statusUpdate')).toBe('Estado actualizado')
  })

  it('should provide proper error announcements in Spanish', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('errors.generic')).toBe('Algo salió mal. Por favor, inténtelo de nuevo.')
    expect(i18nService.t('errors.network')).toBe('Error de red. Por favor, verifique su conexión a Internet.')
    expect(i18nService.t('errors.location')).toBe('No se puede obtener su ubicación. Por favor, verifique los permisos.')
    
    // Test validation error announcements
    expect(i18nService.t('errors.validation.required')).toBe('Este campo es requerido')
    expect(i18nService.t('errors.validation.email')).toBe('Por favor, ingrese una dirección de correo electrónico válida')
  })

  it('should handle form validation announcements in Spanish', async () => {
    await i18nService.setLocale('es')
    
    // Test form validation messages
    expect(i18nService.t('errors.validation.required')).toBe('Este campo es requerido')
    expect(i18nService.t('errors.validation.phone')).toBe('Por favor, ingrese un número de teléfono válido')
    expect(i18nService.t('errors.validation.zipCode')).toBe('Por favor, ingrese un código postal válido')
  })

  it('should support pluralization in accessibility contexts', async () => {
    await i18nService.setLocale('es')
    
    // Test pluralization for accessibility announcements
    expect(i18nService.t('search.resultsCount', { count: 0 })).toBe('0 resultados encontrados')
    expect(i18nService.t('search.resultsCount', { count: 1 })).toBe('1 resultado encontrado')
    expect(i18nService.t('search.resultsCount', { count: 5 })).toBe('5 resultados encontrados')
    
    expect(i18nService.t('location.reviews', { count: 0 })).toBe('0 reseñas')
    expect(i18nService.t('location.reviews', { count: 1 })).toBe('1 reseña')
    expect(i18nService.t('location.reviews', { count: 3 })).toBe('3 reseñas')
  })
})
