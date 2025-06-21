/**
 * Translations for FeedFind.org
 * 
 * Comprehensive translation system supporting:
 * - English (primary)
 * - Spanish (Latino community focus)
 * - Future: Arabic and Hebrew (RTL support)
 */

// Define translations inline for better test compatibility
const commonEn = {
  "loading": "Loading...",
  "save": "Save",
  "cancel": "Cancel",
  "edit": "Edit",
  "delete": "Delete",
  "search": "Search",
  "clear": "Clear",
  "help": "Help"
}

const searchEn = {
  "title": "Find Food Assistance",
  "placeholder": "Enter ZIP code or address",
  "button": "Search",
  "resultsCount_one": "{{count}} result found",
  "resultsCount_other": "{{count}} results found"
}

const locationEn = {
  "reviews_one": "{{count}} review",
  "reviews_other": "{{count}} reviews"
}

const commonEs = {
  "loading": "Cargando...",
  "save": "Guardar",
  "cancel": "Cancelar",
  "edit": "Editar",
  "delete": "Eliminar",
  "search": "Buscar",
  "clear": "Limpiar",
  "help": "Ayuda"
}

const searchEs = {
  "title": "Encontrar Asistencia Alimentaria",
  "placeholder": "Ingrese código postal o dirección",
  "button": "Buscar",
  "resultsCount_one": "{{count}} resultado encontrado",
  "resultsCount_other": "{{count}} resultados encontrados"
}

const locationEs = {
  "reviews_one": "{{count}} reseña",
  "reviews_other": "{{count}} reseñas"
}

// Combine translations by namespace
export const translations = {
  en: {
    common: commonEn,
    search: searchEn,
    location: locationEn,
    // Navigation
    nav: {
      home: "Home",
      search: "Search",
      map: "Map",
      profile: "Profile",
      login: "Login",
      logout: "Logout",
      register: "Register"
    },
    // Error messages
    errors: {
      generic: "Something went wrong. Please try again.",
      network: "Network error. Please check your connection.",
      location: "Unable to get your location. Please check permissions.",
      notFound: "The requested location was not found.",
      unauthorized: "You are not authorized to perform this action.",
      validation: {
        required: "This field is required",
        email: "Please enter a valid email address",
        phone: "Please enter a valid phone number",
        zipCode: "Please enter a valid ZIP code"
      }
    },
    // Address formatting
    address: {
      street: "Street",
      city: "City", 
      state: "State",
      zipCode: "ZIP Code",
      country: "Country"
    },
    // Accessibility labels
    accessibility: {
      closeDialog: "Close dialog",
      searchInput: "Search input field",
      mainNavigation: "Main navigation",
      skipToContent: "Skip to main content",
      searchCompleted: "Search completed",
      statusUpdate: "Status updated",
      loading: "Loading content",
      error: "Error occurred"
    },
    // Provider dashboard
    provider: {
      dashboard: {
        title: "Provider Dashboard",
        locations: "Locations",
        addLocation: "Add Location",
        statusUpdates: "Status Updates", 
        updateStatus: "Update Status",
        analytics: "Analytics",
        totalVisits: "Total Visits"
      }
    },
    // Messages
    messages: {
      welcome: "Welcome to FeedFind",
      howCanWeHelp: "How can we help you?",
      privacyAssurance: "Your information is private and secure",
      supportAvailable: "Support available 24/7"
    }
  },
  es: {
    common: commonEs,
    search: searchEs,
    location: locationEs,
    // Navigation
    nav: {
      home: "Inicio",
      search: "Buscar",
      map: "Mapa",
      profile: "Perfil",
      login: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      register: "Registrarse"
    },
    // Error messages
    errors: {
      generic: "Algo salió mal. Por favor, inténtelo de nuevo.",
      network: "Error de red. Por favor, verifique su conexión a Internet.",
      location: "No se puede obtener su ubicación. Por favor, verifique los permisos.",
      notFound: "No se encontró la ubicación solicitada.",
      unauthorized: "No está autorizado para realizar esta acción.",
      validation: {
        required: "Este campo es requerido",
        email: "Por favor, ingrese una dirección de correo electrónico válida",
        phone: "Por favor, ingrese un número de teléfono válido",
        zipCode: "Por favor, ingrese un código postal válido"
      }
    },
    // Address formatting
    address: {
      street: "Calle",
      city: "Ciudad",
      state: "Estado", 
      zipCode: "Código Postal",
      country: "País"
    },
    // Accessibility labels
    accessibility: {
      closeDialog: "Cerrar diálogo",
      searchInput: "Campo de búsqueda",
      mainNavigation: "Navegación principal",
      skipToContent: "Saltar al contenido",
      searchCompleted: "Búsqueda completada",
      statusUpdate: "Estado actualizado",
      loading: "Cargando contenido",
      error: "Ocurrió un error"
    },
    // Provider dashboard
    provider: {
      dashboard: {
        title: "Panel de Proveedor",
        locations: "Ubicaciones",
        addLocation: "Agregar Ubicación",
        statusUpdates: "Actualizaciones de Estado",
        updateStatus: "Actualizar Estado", 
        analytics: "Análisis",
        totalVisits: "Visitas Totales"
      }
    },
    // Messages
    messages: {
      welcome: "Bienvenido a FeedFind",
      howCanWeHelp: "¿Cómo podemos ayudarle?",
      privacyAssurance: "Su información es privada y segura",
      supportAvailable: "Apoyo disponible las 24 horas"
    }
  }
} 