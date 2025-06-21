export const translations = {
  en: {
    // Common UI elements
    common: {
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      required: 'Required',
      optional: 'Optional',
      clear: 'Clear',
      help: 'Help',
      more: 'More',
      less: 'Less',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      retry: 'Retry',
      refresh: 'Refresh',
      update: 'Update',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      select: 'Select',
      back: 'Back',
      continue: 'Continue',
      finish: 'Finish',
      yes: 'Yes',
      no: 'No',
      ok: 'OK'
    },

    // Navigation
    navigation: {
      home: 'Home',
      search: 'Search',
      map: 'Map',
      profile: 'Profile',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      dashboard: 'Dashboard',
      settings: 'Settings',
      help: 'Help'
    },

    // Search interface
    search: {
      title: 'Find Food Assistance',
      description: 'Locate food banks, pantries, and meal programs near you',
      placeholder: 'Enter ZIP code or address',
      useLocation: 'Use My Location',
      filters: 'Filters',
      results: 'Search Results',
      noResults: 'No locations found',
      distance: 'Distance',
      status: 'Status',
      type: 'Type',
      hours: 'Hours',
      sortBy: 'Sort by',
      showMap: 'Show Map',
      showList: 'Show List',
      resultsCount: 'Found {{count}} results',
      filterOptions: 'Filter options to refine your search',
      clearFilters: 'Clear all filters',
      applyFilters: 'Apply filters',
      searchHelp: 'Enter your location to find nearby food assistance resources',
      searchCompleted: 'Search completed'
    },

    // Location information
    location: {
      open: 'Open',
      closed: 'Closed',
      limited: 'Limited',
      unknown: 'Unknown',
      hours: 'Hours',
      phone: 'Phone',
      address: 'Address',
      directions: 'Get Directions',
      website: 'Website',
      email: 'Email',
      services: 'Services',
      requirements: 'Requirements',
      notes: 'Notes',
      lastUpdated: 'Last Updated',
      details: 'Details',
      reviews: '{{count}} review || {{count}} reviews',
      rating: 'Rating',
      writeReview: 'Write a Review',
      reportIssue: 'Report an Issue',
      share: 'Share',
      favorite: 'Add to Favorites',
      unfavorite: 'Remove from Favorites',
      callLocation: 'Call Location',
      visitWebsite: 'Visit Website'
    },

    // Forms
    form: {
      email: 'Email',
      emailPlaceholder: 'Enter your email address',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      name: 'Name',
      namePlaceholder: 'Enter your full name',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      address: 'Address',
      addressPlaceholder: 'Enter your address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      zipCodePlaceholder: 'Enter ZIP code',
      message: 'Message',
      messagePlaceholder: 'Enter your message',
      subject: 'Subject',
      subjectPlaceholder: 'Enter subject',
      organization: 'Organization',
      organizationPlaceholder: 'Enter organization name',
      title: 'Title',
      titlePlaceholder: 'Enter title',
      description: 'Description',
      descriptionPlaceholder: 'Enter description',
      website: 'Website',
      websitePlaceholder: 'Enter website URL'
    },

    // Address components
    address: {
      street: 'Street',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country'
    },

    // Error messages
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Please check your connection.',
      location: 'Unable to get your location.',
      notFound: 'Location not found.',
      unauthorized: 'You are not authorized to perform this action.',
      forbidden: 'Access denied.',
      serverError: 'Server error. Please try again later.',
      timeout: 'Request timed out. Please try again.',
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        zipCode: 'Please enter a valid ZIP code',
        url: 'Please enter a valid URL',
        minLength: 'Must be at least {{min}} characters',
        maxLength: 'Must be no more than {{max}} characters',
        passwordMatch: 'Passwords do not match',
        invalidFormat: 'Invalid format'
      },
      auth: {
        invalidCredentials: 'Invalid email or password',
        emailExists: 'An account with this email already exists',
        weakPassword: 'Password is too weak',
        accountDisabled: 'Account has been disabled',
        tooManyRequests: 'Too many requests. Please try again later'
      }
    },

    // Success messages
    success: {
      saved: 'Successfully saved',
      updated: 'Successfully updated',
      deleted: 'Successfully deleted',
      sent: 'Successfully sent',
      submitted: 'Successfully submitted',
      registered: 'Account created successfully',
      loggedIn: 'Logged in successfully',
      loggedOut: 'Logged out successfully',
      passwordReset: 'Password reset email sent'
    },

    // Provider dashboard
    provider: {
      dashboard: {
        title: 'Provider Dashboard',
        locations: 'Locations',
        addLocation: 'Add Location',
        editLocation: 'Edit Location',
        deleteLocation: 'Delete Location',
        statusUpdates: 'Status Updates',
        updateStatus: 'Update Status',
        bulkUpdate: 'Bulk Update',
        analytics: 'Analytics',
        totalVisits: 'Total Visits',
        recentUpdates: 'Recent Updates',
        notifications: 'Notifications',
        settings: 'Settings',
        profile: 'Profile',
        support: 'Support'
      }
    },

    // Admin interface
    admin: {
      dashboard: 'Admin Dashboard',
      users: 'Users',
      providers: 'Providers',
      locations: 'Locations',
      reviews: 'Reviews',
      reports: 'Reports',
      settings: 'Settings',
      moderation: 'Content Moderation',
      approve: 'Approve',
      reject: 'Reject',
      ban: 'Ban User',
      unban: 'Unban User',
      statistics: 'Statistics'
    },

    // Accessibility labels
    accessibility: {
      closeDialog: 'Close dialog',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      mainNavigation: 'Main navigation',
      skipToContent: 'Skip to main content',
      searchInput: 'Search input',
      searchForm: 'Search form',
      searchHelp: 'Enter your location to find nearby resources',
      filterPanel: 'Filter panel',
      expand: 'Expand',
      collapse: 'Collapse',
      loading: 'Loading content',
      error: 'Error occurred',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      searchCompleted: 'Search completed',
      searchHistory: 'Search history',
      currentPage: 'Current page',
      pageNavigation: 'Page navigation',
      sortOptions: 'Sort options',
      viewOptions: 'View options'
    },

    // Cultural messaging
    messages: {
      welcome: 'Welcome to FeedFind',
      howCanWeHelp: 'How can we help you?',
      privacyAssurance: 'Your information is private and secure',
      supportAvailable: '24/7 support available',
      noJudgment: 'No questions asked, no judgment',
      dignityRespected: 'Your dignity is respected here',
      communitySupport: 'Community support when you need it',
      freeService: 'This service is completely free'
    },

    // Modal dialogs
    modal: {
      title: 'Information',
      description: 'Additional details and information',
      confirmDelete: 'Are you sure you want to delete this item?',
      confirmAction: 'Are you sure you want to continue?',
      unsavedChanges: 'You have unsaved changes. Do you want to continue?'
    },

    // Date and time
    dateTime: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This week',
      lastWeek: 'Last week',
      thisMonth: 'This month',
      lastMonth: 'Last month',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night'
    },

    // Status indicators
    status: {
      online: 'Online',
      offline: 'Offline',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      verified: 'Verified',
      unverified: 'Unverified'
    }
  },

  es: {
    // Common UI elements
    common: {
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      required: 'Requerido',
      optional: 'Opcional',
      clear: 'Limpiar',
      help: 'Ayuda',
      more: 'Más',
      less: 'Menos',
      edit: 'Editar',
      delete: 'Eliminar',
      confirm: 'Confirmar',
      retry: 'Reintentar',
      refresh: 'Actualizar',
      update: 'Actualizar',
      view: 'Ver',
      download: 'Descargar',
      upload: 'Subir',
      select: 'Seleccionar',
      back: 'Atrás',
      continue: 'Continuar',
      finish: 'Finalizar',
      yes: 'Sí',
      no: 'No',
      ok: 'Aceptar'
    },

    // Navigation
    navigation: {
      home: 'Inicio',
      search: 'Buscar',
      map: 'Mapa',
      profile: 'Perfil',
      about: 'Acerca de',
      contact: 'Contacto',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      dashboard: 'Panel',
      settings: 'Configuración',
      help: 'Ayuda'
    },

    // Search interface
    search: {
      title: 'Encontrar Asistencia Alimentaria',
      description: 'Localice bancos de alimentos, despensas y programas de comidas cerca de usted',
      placeholder: 'Ingrese código postal o dirección',
      useLocation: 'Usar Mi Ubicación',
      filters: 'Filtros',
      results: 'Resultados de Búsqueda',
      noResults: 'No se encontraron ubicaciones',
      distance: 'Distancia',
      status: 'Estado',
      type: 'Tipo',
      hours: 'Horarios',
      sortBy: 'Ordenar por',
      showMap: 'Mostrar Mapa',
      showList: 'Mostrar Lista',
      resultsCount: 'Se encontraron {{count}} resultados',
      filterOptions: 'Opciones de filtro para refinar su búsqueda',
      clearFilters: 'Limpiar todos los filtros',
      applyFilters: 'Aplicar filtros',
      searchHelp: 'Ingrese su ubicación para encontrar recursos cercanos',
      searchCompleted: 'Búsqueda completada'
    },

    // Location information
    location: {
      open: 'Abierto',
      closed: 'Cerrado',
      limited: 'Limitado',
      unknown: 'Desconocido',
      hours: 'Horarios',
      phone: 'Teléfono',
      address: 'Dirección',
      directions: 'Obtener Direcciones',
      website: 'Sitio Web',
      email: 'Correo Electrónico',
      services: 'Servicios',
      requirements: 'Requisitos',
      notes: 'Notas',
      lastUpdated: 'Última Actualización',
      details: 'Detalles',
      reviews: '{{count}} reseña || {{count}} reseñas',
      rating: 'Calificación',
      writeReview: 'Escribir una Reseña',
      reportIssue: 'Reportar un Problema',
      share: 'Compartir',
      favorite: 'Agregar a Favoritos',
      unfavorite: 'Quitar de Favoritos',
      callLocation: 'Llamar a la Ubicación',
      visitWebsite: 'Visitar Sitio Web'
    },

    // Forms
    form: {
      email: 'Correo Electrónico',
      emailPlaceholder: 'Ingrese su dirección de correo electrónico',
      password: 'Contraseña',
      passwordPlaceholder: 'Ingrese su contraseña',
      confirmPassword: 'Confirmar Contraseña',
      firstName: 'Nombre',
      lastName: 'Apellido',
      name: 'Nombre Completo',
      namePlaceholder: 'Ingrese su nombre completo',
      phone: 'Número de Teléfono',
      phonePlaceholder: 'Ingrese su número de teléfono',
      address: 'Dirección',
      addressPlaceholder: 'Ingrese su dirección',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: 'Código Postal',
      zipCodePlaceholder: 'Ingrese código postal',
      message: 'Mensaje',
      messagePlaceholder: 'Ingrese su mensaje',
      subject: 'Asunto',
      subjectPlaceholder: 'Ingrese el asunto',
      organization: 'Organización',
      organizationPlaceholder: 'Ingrese el nombre de la organización',
      title: 'Título',
      titlePlaceholder: 'Ingrese el título',
      description: 'Descripción',
      descriptionPlaceholder: 'Ingrese la descripción',
      website: 'Sitio Web',
      websitePlaceholder: 'Ingrese la URL del sitio web'
    },

    // Address components
    address: {
      street: 'Calle',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: 'Código Postal',
      country: 'País'
    },

    // Error messages
    errors: {
      generic: 'Algo salió mal. Por favor, inténtelo de nuevo.',
      network: 'Error de red. Por favor, verifique su conexión.',
      location: 'No se puede obtener su ubicación.',
      notFound: 'Ubicación no encontrada.',
      unauthorized: 'No está autorizado para realizar esta acción.',
      forbidden: 'Acceso denegado.',
      serverError: 'Error del servidor. Por favor, inténtelo más tarde.',
      timeout: 'Se agotó el tiempo de espera. Por favor, inténtelo de nuevo.',
      validation: {
        required: 'Este campo es requerido',
        email: 'Por favor, ingrese una dirección de correo electrónico válida',
        phone: 'Por favor, ingrese un número de teléfono válido',
        zipCode: 'Por favor, ingrese un código postal válido',
        url: 'Por favor, ingrese una URL válida',
        minLength: 'Debe tener al menos {{min}} caracteres',
        maxLength: 'No debe tener más de {{max}} caracteres',
        passwordMatch: 'Las contraseñas no coinciden',
        invalidFormat: 'Formato inválido'
      },
      auth: {
        invalidCredentials: 'Correo electrónico o contraseña inválidos',
        emailExists: 'Ya existe una cuenta con este correo electrónico',
        weakPassword: 'La contraseña es muy débil',
        accountDisabled: 'La cuenta ha sido deshabilitada',
        tooManyRequests: 'Demasiadas solicitudes. Por favor, inténtelo más tarde'
      }
    },

    // Success messages
    success: {
      saved: 'Guardado exitosamente',
      updated: 'Actualizado exitosamente',
      deleted: 'Eliminado exitosamente',
      sent: 'Enviado exitosamente',
      submitted: 'Enviado exitosamente',
      registered: 'Cuenta creada exitosamente',
      loggedIn: 'Sesión iniciada exitosamente',
      loggedOut: 'Sesión cerrada exitosamente',
      passwordReset: 'Correo de restablecimiento de contraseña enviado'
    },

    // Provider dashboard
    provider: {
      dashboard: {
        title: 'Panel de Proveedor',
        locations: 'Ubicaciones',
        addLocation: 'Agregar Ubicación',
        editLocation: 'Editar Ubicación',
        deleteLocation: 'Eliminar Ubicación',
        statusUpdates: 'Actualizaciones de Estado',
        updateStatus: 'Actualizar Estado',
        bulkUpdate: 'Actualización Masiva',
        analytics: 'Analíticas',
        totalVisits: 'Total de Visitas',
        recentUpdates: 'Actualizaciones Recientes',
        notifications: 'Notificaciones',
        settings: 'Configuración',
        profile: 'Perfil',
        support: 'Soporte'
      }
    },

    // Admin interface
    admin: {
      dashboard: 'Panel de Administrador',
      users: 'Usuarios',
      providers: 'Proveedores',
      locations: 'Ubicaciones',
      reviews: 'Reseñas',
      reports: 'Reportes',
      settings: 'Configuración',
      moderation: 'Moderación de Contenido',
      approve: 'Aprobar',
      reject: 'Rechazar',
      ban: 'Prohibir Usuario',
      unban: 'Desprohibir Usuario',
      statistics: 'Estadísticas'
    },

    // Accessibility labels
    accessibility: {
      closeDialog: 'Cerrar diálogo',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      mainNavigation: 'Navegación principal',
      skipToContent: 'Saltar al contenido',
      searchInput: 'Campo de búsqueda',
      searchForm: 'Formulario de búsqueda',
      searchHelp: 'Ingrese su ubicación para encontrar recursos cercanos',
      filterPanel: 'Panel de filtros',
      expand: 'Expandir',
      collapse: 'Contraer',
      loading: 'Cargando contenido',
      error: 'Ocurrió un error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      searchCompleted: 'Búsqueda completada',
      searchHistory: 'Historial de búsqueda',
      currentPage: 'Página actual',
      pageNavigation: 'Navegación de páginas',
      sortOptions: 'Opciones de ordenamiento',
      viewOptions: 'Opciones de vista'
    },

    // Cultural messaging (using formal "usted" forms)
    messages: {
      welcome: 'Bienvenido a FeedFind',
      howCanWeHelp: '¿Cómo podemos ayudarle?',
      privacyAssurance: 'Su información es privada y segura',
      supportAvailable: 'Apoyo disponible las 24 horas',
      noJudgment: 'Sin preguntas, sin juicios',
      dignityRespected: 'Su dignidad es respetada aquí',
      communitySupport: 'Apoyo comunitario cuando lo necesite',
      freeService: 'Este servicio es completamente gratuito'
    },

    // Modal dialogs
    modal: {
      title: 'Información',
      description: 'Detalles e información adicional',
      confirmDelete: '¿Está seguro de que desea eliminar este elemento?',
      confirmAction: '¿Está seguro de que desea continuar?',
      unsavedChanges: 'Tiene cambios sin guardar. ¿Desea continuar?'
    },

    // Date and time
    dateTime: {
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      thisWeek: 'Esta semana',
      lastWeek: 'Semana pasada',
      thisMonth: 'Este mes',
      lastMonth: 'Mes pasado',
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
      night: 'Madrugada'
    },

    // Status indicators
    status: {
      online: 'En línea',
      offline: 'Fuera de línea',
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      verified: 'Verificado',
      unverified: 'No verificado'
    }
  }
} 