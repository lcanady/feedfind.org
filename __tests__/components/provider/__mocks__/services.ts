// Mock service instances
export const mockServices = {
  provider: {
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    getLocations: jest.fn(),
    getAnalytics: jest.fn()
  },
  location: {
    getByProviderId: jest.fn(),
    updateStatus: jest.fn(),
    bulkUpdateStatus: jest.fn(),
    update: jest.fn()
  },
  statusUpdate: {
    getRecentByProviderId: jest.fn(),
    updateLocationStatus: jest.fn(),
    create: jest.fn()
  }
};

// Mock class factory
export function createMockClass(mockInstance: any) {
  return new Proxy(function() {}, {
    construct() {
      return mockInstance;
    },
    get(target, prop) {
      if (prop === 'prototype') {
        return mockInstance;
      }
      return mockInstance[prop];
    }
  });
}

// Mock service classes
export const mockServiceClasses = {
  ProviderService: createMockClass(mockServices.provider),
  LocationService: createMockClass(mockServices.location),
  StatusUpdateService: createMockClass(mockServices.statusUpdate)
}; 