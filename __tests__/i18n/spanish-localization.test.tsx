import { I18nService } from '../../lib/i18nService'

describe('Spanish Localization', () => {
  let i18nService: I18nService

  beforeEach(() => {
    i18nService = new I18nService()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should provide comprehensive Spanish translations', async () => {
    await i18nService.setLocale('es')
    
    // Test common UI elements
    expect(i18nService.t('common.search')).toBe('Buscar')
    expect(i18nService.t('common.loading')).toBe('Cargando...')
    expect(i18nService.t('common.save')).toBe('Guardar')
    expect(i18nService.t('common.cancel')).toBe('Cancelar')
    expect(i18nService.t('common.edit')).toBe('Editar')
    expect(i18nService.t('common.delete')).toBe('Eliminar')
    expect(i18nService.t('common.clear')).toBe('Limpiar')
    expect(i18nService.t('common.help')).toBe('Ayuda')
  })

  it('should provide Spanish navigation translations', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('nav.home')).toBe('Inicio')
    expect(i18nService.t('nav.search')).toBe('Buscar')
    expect(i18nService.t('nav.map')).toBe('Mapa')
    expect(i18nService.t('nav.profile')).toBe('Perfil')
    expect(i18nService.t('nav.login')).toBe('Iniciar Sesión')
    expect(i18nService.t('nav.logout')).toBe('Cerrar Sesión')
    expect(i18nService.t('nav.register')).toBe('Registrarse')
  })

  it('should provide Spanish search interface translations', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('search.title')).toBe('Encontrar Asistencia Alimentaria')
    expect(i18nService.t('search.placeholder')).toBe('Ingrese código postal o dirección')
    expect(i18nService.t('search.button')).toBe('Buscar')
  })

  it('should provide Spanish location information translations', async () => {
    await i18nService.setLocale('es')
    
    // Test the location translations that actually exist in our translations.ts
    expect(i18nService.t('location.reviews', { count: 1 })).toBe('1 reseña')
    expect(i18nService.t('location.reviews', { count: 3 })).toBe('3 reseñas')
  })

  it('should provide Spanish error messages', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('errors.generic')).toBe('Algo salió mal. Por favor, inténtelo de nuevo.')
    expect(i18nService.t('errors.network')).toBe('Error de red. Por favor, verifique su conexión a Internet.')
    expect(i18nService.t('errors.location')).toBe('No se puede obtener su ubicación. Por favor, verifique los permisos.')
    expect(i18nService.t('errors.notFound')).toBe('No se encontró la ubicación solicitada.')
    expect(i18nService.t('errors.unauthorized')).toBe('No está autorizado para realizar esta acción.')
    
    // Validation errors
    expect(i18nService.t('errors.validation.required')).toBe('Este campo es requerido')
    expect(i18nService.t('errors.validation.email')).toBe('Por favor, ingrese una dirección de correo electrónico válida')
    expect(i18nService.t('errors.validation.phone')).toBe('Por favor, ingrese un número de teléfono válido')
    expect(i18nService.t('errors.validation.zipCode')).toBe('Por favor, ingrese un código postal válido')
  })

  it('should provide Spanish accessibility labels', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('accessibility.closeDialog')).toBe('Cerrar diálogo')
    expect(i18nService.t('accessibility.searchInput')).toBe('Campo de búsqueda')
    expect(i18nService.t('accessibility.mainNavigation')).toBe('Navegación principal')
    expect(i18nService.t('accessibility.skipToContent')).toBe('Saltar al contenido')
    expect(i18nService.t('accessibility.searchCompleted')).toBe('Búsqueda completada')
    expect(i18nService.t('accessibility.loading')).toBe('Cargando contenido')
    expect(i18nService.t('accessibility.error')).toBe('Ocurrió un error')
  })

  it('should provide Spanish provider dashboard translations', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('provider.dashboard.title')).toBe('Panel de Proveedor')
    expect(i18nService.t('provider.dashboard.locations')).toBe('Ubicaciones')
    expect(i18nService.t('provider.dashboard.addLocation')).toBe('Agregar Ubicación')
    expect(i18nService.t('provider.dashboard.statusUpdates')).toBe('Actualizaciones de Estado')
    expect(i18nService.t('provider.dashboard.updateStatus')).toBe('Actualizar Estado')
    expect(i18nService.t('provider.dashboard.analytics')).toBe('Análisis')
    expect(i18nService.t('provider.dashboard.totalVisits')).toBe('Visitas Totales')
  })

  it('should use culturally appropriate Spanish messaging', async () => {
    await i18nService.setLocale('es')
    
    // Using formal "usted" forms appropriate for service context
    expect(i18nService.t('messages.welcome')).toBe('Bienvenido a FeedFind')
    expect(i18nService.t('messages.howCanWeHelp')).toBe('¿Cómo podemos ayudarle?')
    expect(i18nService.t('messages.privacyAssurance')).toBe('Su información es privada y segura')
    expect(i18nService.t('messages.supportAvailable')).toBe('Apoyo disponible las 24 horas')
  })

  it('should handle Spanish date and time formatting', async () => {
    await i18nService.setLocale('es')
    
    const testDate = new Date('2024-01-15T14:30:00')
    
    // Accept different Spanish date formats
    const formattedDate = i18nService.formatDate(testDate)
    expect(formattedDate).toMatch(/15.*ene.*2024|15.*enero.*2024|15\/1\/2024/)
    
    const relativeTime = i18nService.formatRelativeTime(testDate)
    expect(relativeTime).toMatch(/hace|en/)
    
    // Test distance formatting
    expect(i18nService.formatDistance(1000)).toBe('1.0 km')
    expect(i18nService.formatDistance(500)).toBe('500 m')
  })

  it('should handle Spanish address formatting', async () => {
    await i18nService.setLocale('es')
    
    expect(i18nService.t('address.street')).toBe('Calle')
    expect(i18nService.t('address.city')).toBe('Ciudad')
    expect(i18nService.t('address.state')).toBe('Estado')
    expect(i18nService.t('address.zipCode')).toBe('Código Postal')
    expect(i18nService.t('address.country')).toBe('País')
  })

  it('should handle Spanish pluralization', async () => {
    await i18nService.setLocale('es')
    
    // Test pluralization with different counts using the actual keys
    expect(i18nService.t('search.resultsCount', { count: 0 })).toBe('0 resultados encontrados')
    expect(i18nService.t('search.resultsCount', { count: 1 })).toBe('1 resultado encontrado')
    expect(i18nService.t('search.resultsCount', { count: 5 })).toBe('5 resultados encontrados')
    
    // Test location reviews pluralization
    expect(i18nService.t('location.reviews', { count: 0 })).toBe('0 reseñas')
    expect(i18nService.t('location.reviews', { count: 1 })).toBe('1 reseña')
    expect(i18nService.t('location.reviews', { count: 3 })).toBe('3 reseñas')
  })

  it('should maintain translation consistency across Spanish', async () => {
    await i18nService.setLocale('es')
    
    // Test that common words are consistently translated
    const searchInCommon = i18nService.t('common.search')
    const searchInNav = i18nService.t('nav.search')
    const searchInSearchModule = i18nService.t('search.button')
    
    expect(searchInCommon).toBe('Buscar')
    expect(searchInNav).toBe('Buscar')
    expect(searchInSearchModule).toBe('Buscar')
  })

  it('should provide fallback for missing translations', async () => {
    await i18nService.setLocale('es')
    
    // Test fallback behavior for non-existent keys
    const missingKey = i18nService.t('nonexistent.key')
    expect(missingKey).toBe('nonexistent.key') // Should return the key itself as fallback
  })

  it('should handle nested translation keys correctly', async () => {
    await i18nService.setLocale('es')
    
    // Test deeply nested keys
    expect(i18nService.t('errors.validation.email')).toBe('Por favor, ingrese una dirección de correo electrónico válida')
    expect(i18nService.t('provider.dashboard.title')).toBe('Panel de Proveedor')
    expect(i18nService.t('accessibility.searchInput')).toBe('Campo de búsqueda')
  })
}) 