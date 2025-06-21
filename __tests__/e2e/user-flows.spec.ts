import { test, expect, Page } from '@playwright/test'

// Helper functions for common actions
const fillSearchForm = async (page: Page, query: string) => {
  await page.fill('[data-testid="search-input"]', query)
  await page.click('[data-testid="search-button"]')
}

const waitForSearchResults = async (page: Page) => {
  await page.waitForSelector('[data-testid="location-list"]', { timeout: 5000 })
}

const loginAsUser = async (page: Page, email: string, password: string) => {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/')
}

const loginAsProvider = async (page: Page) => {
  await loginAsUser(page, 'provider@test.com', 'password123')
}

const loginAsAdmin = async (page: Page) => {
  await loginAsUser(page, 'admin@test.com', 'password123')
}

test.describe('Food Seeker User Journey', () => {
  test('Food seeker can find and visit location', async ({ page }) => {
    // Start at homepage
    await page.goto('/')
    
    // Verify page loads correctly
    await expect(page.locator('h1')).toContainText('feedfind')
    await expect(page.locator('text=find food assistance near you')).toBeVisible()
    
    // Perform search
    await fillSearchForm(page, '12345')
    
    // Wait for and verify search results
    await waitForSearchResults(page)
    await expect(page.locator('[data-testid="location-list"]')).toBeVisible()
    
    // Verify search results contain expected elements
    const firstLocation = page.locator('[data-testid="location-card"]').first()
    await expect(firstLocation).toBeVisible()
    await expect(firstLocation.locator('[data-testid="location-name"]')).toBeVisible()
    await expect(firstLocation.locator('[data-testid="location-status"]')).toBeVisible()
    await expect(firstLocation.locator('[data-testid="location-distance"]')).toBeVisible()
    
    // Click on first location
    await firstLocation.click()
    
    // Verify location details page
    await expect(page.locator('[data-testid="location-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="location-address"]')).toBeVisible()
    await expect(page.locator('[data-testid="location-hours"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-info"]')).toBeVisible()
    
    // Test directions functionality
    const directionsButton = page.locator('[data-testid="directions-button"]')
    if (await directionsButton.isVisible()) {
      await directionsButton.click()
      // Should open Google Maps or show directions
      await expect(page.locator('[data-testid="directions-info"]')).toBeVisible()
    }
    
    // Test review functionality (if user is logged in)
    const reviewButton = page.locator('[data-testid="leave-review-button"]')
    if (await reviewButton.isVisible()) {
      await reviewButton.click()
      await expect(page.locator('[data-testid="review-form"]')).toBeVisible()
      
      // Fill out review form
      await page.selectOption('[data-testid="rating-select"]', '5')
      await page.fill('[data-testid="review-text"]', 'Great service and friendly staff!')
      await page.click('[data-testid="submit-review-button"]')
      
      // Verify review submission
      await expect(page.locator('text=Thank you for your review')).toBeVisible()
    }
  })

  test('Food seeker can use GPS location for search', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation'])
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.0060 })
    
    await page.goto('/')
    
    // Click "Use My Location" button
    await page.click('[data-testid="use-location-button"]')
    
    // Wait for location permission and search
    await waitForSearchResults(page)
    
    // Verify results are sorted by distance
    const locationCards = page.locator('[data-testid="location-card"]')
    const firstDistance = await locationCards.first().locator('[data-testid="location-distance"]').textContent()
    const secondDistance = await locationCards.nth(1).locator('[data-testid="location-distance"]').textContent()
    
    // Extract numeric values and compare
    const firstMiles = parseFloat(firstDistance?.match(/[\d.]+/)?.[0] || '0')
    const secondMiles = parseFloat(secondDistance?.match(/[\d.]+/)?.[0] || '0')
    
    expect(firstMiles).toBeLessThanOrEqual(secondMiles)
  })

  test('Food seeker can filter search results', async ({ page }) => {
    await page.goto('/')
    await fillSearchForm(page, '12345')
    await waitForSearchResults(page)
    
    // Open filters
    await page.click('[data-testid="filters-toggle"]')
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible()
    
    // Filter by status
    await page.check('[data-testid="filter-open-only"]')
    await page.click('[data-testid="apply-filters"]')
    
    // Verify all results show "Open" status
    const statusElements = page.locator('[data-testid="location-status"]')
    const statusCount = await statusElements.count()
    
    for (let i = 0; i < statusCount; i++) {
      const statusText = await statusElements.nth(i).textContent()
      expect(statusText).toContain('OPEN')
    }
    
    // Filter by distance
    await page.selectOption('[data-testid="distance-filter"]', '5')
    await page.click('[data-testid="apply-filters"]')
    
    // Verify all results are within 5 miles
    const distanceElements = page.locator('[data-testid="location-distance"]')
    const distanceCount = await distanceElements.count()
    
    for (let i = 0; i < distanceCount; i++) {
      const distanceText = await distanceElements.nth(i).textContent()
      const miles = parseFloat(distanceText?.match(/[\d.]+/)?.[0] || '0')
      expect(miles).toBeLessThanOrEqual(5)
    }
  })

  test('Food seeker can switch between list and map view', async ({ page }) => {
    await page.goto('/')
    await fillSearchForm(page, '12345')
    await waitForSearchResults(page)
    
    // Should start in list view
    await expect(page.locator('[data-testid="location-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="location-map"]')).not.toBeVisible()
    
    // Switch to map view
    await page.click('[data-testid="map-view-toggle"]')
    await expect(page.locator('[data-testid="location-map"]')).toBeVisible()
    await expect(page.locator('[data-testid="location-list"]')).not.toBeVisible()
    
    // Verify map has markers
    const markerCount = await page.locator('[data-testid="map-marker"]').count()
    expect(markerCount).toBeGreaterThan(0)
    
    // Click on a map marker
    await page.locator('[data-testid="map-marker"]').first().click()
    
    // Verify info window appears
    await expect(page.locator('[data-testid="map-info-window"]')).toBeVisible()
    
    // Switch back to list view
    await page.click('[data-testid="list-view-toggle"]')
    await expect(page.locator('[data-testid="location-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="location-map"]')).not.toBeVisible()
  })
})

test.describe('Provider User Journey', () => {
  test('Provider can register and manage locations', async ({ page }) => {
    // Register as new provider
    await page.goto('/register')
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newprovider@test.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="confirm-password-input"]', 'password123')
    await page.fill('[data-testid="organization-name-input"]', 'Test Food Bank')
    await page.fill('[data-testid="contact-person-input"]', 'John Doe')
    await page.fill('[data-testid="phone-input"]', '(555) 123-4567')
    
    await page.click('[data-testid="register-button"]')
    
    // Should redirect to dashboard or pending approval page
    await expect(page.locator('text=registration successful')).toBeVisible()
    
    // Login as existing provider
    await loginAsProvider(page)
    
    // Navigate to provider dashboard
    await page.goto('/provider/dashboard')
    await expect(page.locator('[data-testid="provider-dashboard"]')).toBeVisible()
    
    // Add new location
    await page.click('[data-testid="add-location-button"]')
    await expect(page.locator('[data-testid="location-form"]')).toBeVisible()
    
    // Fill location form
    await page.fill('[data-testid="location-name-input"]', 'Downtown Distribution Center')
    await page.fill('[data-testid="location-address-input"]', '123 Main St, New York, NY 10001')
    await page.fill('[data-testid="location-phone-input"]', '(555) 987-6543')
    await page.fill('[data-testid="location-description-input"]', 'Free food distribution every Tuesday and Thursday')
    
    // Set operating hours
    await page.selectOption('[data-testid="monday-open"]', '09:00')
    await page.selectOption('[data-testid="monday-close"]', '17:00')
    await page.selectOption('[data-testid="tuesday-open"]', '09:00')
    await page.selectOption('[data-testid="tuesday-close"]', '17:00')
    
    await page.click('[data-testid="save-location-button"]')
    
    // Verify location was added
    await expect(page.locator('text=Location added successfully')).toBeVisible()
    await expect(page.locator('[data-testid="location-list"]')).toContainText('Downtown Distribution Center')
  })

  test('Provider can update location status', async ({ page }) => {
    await loginAsProvider(page)
    await page.goto('/provider/dashboard')
    
    // Find first location and update status
    const firstLocation = page.locator('[data-testid="location-item"]').first()
    await expect(firstLocation).toBeVisible()
    
    // Check current status
    const currentStatus = await firstLocation.locator('[data-testid="location-status"]').textContent()
    
    // Click status update button
    await firstLocation.locator('[data-testid="update-status-button"]').click()
    await expect(page.locator('[data-testid="status-update-modal"]')).toBeVisible()
    
    // Change status
    const newStatus = currentStatus?.includes('Open') ? 'closed' : 'open'
    await page.selectOption('[data-testid="status-select"]', newStatus)
    await page.fill('[data-testid="status-notes"]', `Updated status to ${newStatus} via E2E test`)
    
    await page.click('[data-testid="confirm-status-update"]')
    
    // Verify status was updated
    await expect(page.locator('text=Status updated successfully')).toBeVisible()
    
    // Verify new status is displayed
    const updatedStatus = await firstLocation.locator('[data-testid="location-status"]').textContent()
    expect(updatedStatus).not.toBe(currentStatus)
  })

  test('Provider can bulk update multiple locations', async ({ page }) => {
    await loginAsProvider(page)
    await page.goto('/provider/dashboard')
    
    // Select multiple locations
    const checkboxes = page.locator('[data-testid="location-checkbox"]')
    const checkboxCount = await checkboxes.count()
    const selectCount = Math.min(2, checkboxCount)
    
    for (let i = 0; i < selectCount; i++) {
      await checkboxes.nth(i).check()
    }
    
    // Click bulk update button
    await page.click('[data-testid="bulk-update-button"]')
    await expect(page.locator('[data-testid="bulk-update-modal"]')).toBeVisible()
    
    // Set bulk status
    await page.selectOption('[data-testid="bulk-status-select"]', 'limited')
    await page.fill('[data-testid="bulk-notes"]', 'Limited supplies due to high demand')
    
    await page.click('[data-testid="confirm-bulk-update"]')
    
    // Verify bulk update success
    await expect(page.locator('text=Bulk update completed')).toBeVisible()
    
    // Verify selected locations have updated status
    const selectedLocations = page.locator('[data-testid="location-item"]:has([data-testid="location-checkbox"]:checked)')
    const locationCount = await selectedLocations.count()
    
    for (let i = 0; i < locationCount; i++) {
      const status = await selectedLocations.nth(i).locator('[data-testid="location-status"]').textContent()
      expect(status).toContain('LIMITED')
    }
  })
})

test.describe('Admin User Journey', () => {
  test('Admin can moderate content and approve providers', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Navigate to admin dashboard
    await page.goto('/admin')
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
    
    // Navigate to content moderation
    await page.click('[data-testid="content-moderation-tab"]')
    await expect(page.locator('[data-testid="content-moderation"]')).toBeVisible()
    
    // Review flagged content
    const flaggedItems = page.locator('[data-testid="flagged-item"]')
    const flaggedCount = await flaggedItems.count()
    
    if (flaggedCount > 0) {
      const firstItem = flaggedItems.first()
      
      // Review content
      await firstItem.locator('[data-testid="review-button"]').click()
      await expect(page.locator('[data-testid="content-review-modal"]')).toBeVisible()
      
      // Approve content
      await page.click('[data-testid="approve-content-button"]')
      await page.fill('[data-testid="moderation-notes"]', 'Content approved - meets community guidelines')
      await page.click('[data-testid="confirm-approval"]')
      
      // Verify approval
      await expect(page.locator('text=Content approved successfully')).toBeVisible()
    }
    
    // Navigate to provider approval
    await page.click('[data-testid="provider-approval-tab"]')
    await expect(page.locator('[data-testid="provider-approval"]')).toBeVisible()
    
    // Review pending providers
    const pendingProviders = page.locator('[data-testid="pending-provider"]')
    const pendingCount = await pendingProviders.count()
    
    if (pendingCount > 0) {
      const firstProvider = pendingProviders.first()
      
      // Review provider application
      await firstProvider.locator('[data-testid="review-provider-button"]').click()
      await expect(page.locator('[data-testid="provider-review-modal"]')).toBeVisible()
      
      // Approve provider
      await page.click('[data-testid="approve-provider-button"]')
      await page.fill('[data-testid="approval-notes"]', 'Provider verified and approved')
      await page.click('[data-testid="confirm-provider-approval"]')
      
      // Verify approval
      await expect(page.locator('text=Provider approved successfully')).toBeVisible()
    }
  })

  test('Admin can view system analytics', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    
    // Navigate to analytics tab
    await page.click('[data-testid="analytics-tab"]')
    await expect(page.locator('[data-testid="system-analytics"]')).toBeVisible()
    
    // Verify analytics widgets are present
    await expect(page.locator('[data-testid="total-users-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="active-locations-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-metrics-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="provider-metrics-widget"]')).toBeVisible()
    
    // Test date range filtering
    await page.selectOption('[data-testid="date-range-select"]', 'last-30-days')
    await page.click('[data-testid="update-analytics-button"]')
    
    // Verify analytics update
    await expect(page.locator('[data-testid="analytics-loading"]')).toBeVisible()
    await expect(page.locator('[data-testid="analytics-loading"]')).not.toBeVisible()
    
    // Export analytics data
    await page.click('[data-testid="export-analytics-button"]')
    
    // Verify download initiated
    const downloadPromise = page.waitForEvent('download')
    await downloadPromise
  })

  test('Admin can manage user roles and permissions', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    
    // Navigate to user management
    await page.click('[data-testid="user-management-tab"]')
    await expect(page.locator('[data-testid="user-management"]')).toBeVisible()
    
    // Search for a user
    await page.fill('[data-testid="user-search-input"]', 'test@example.com')
    await page.click('[data-testid="search-users-button"]')
    
    // Select user and modify role
    const userRow = page.locator('[data-testid="user-row"]').first()
    await userRow.locator('[data-testid="edit-user-button"]').click()
    
    await expect(page.locator('[data-testid="edit-user-modal"]')).toBeVisible()
    
    // Change user role
    await page.selectOption('[data-testid="user-role-select"]', 'provider')
    await page.fill('[data-testid="role-change-reason"]', 'User requested provider access')
    
    await page.click('[data-testid="save-user-changes"]')
    
    // Verify role change
    await expect(page.locator('text=User role updated successfully')).toBeVisible()
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('Application works correctly in different browsers', async ({ page, browserName }) => {
    await page.goto('/')
    
    // Basic functionality test
    await expect(page.locator('h1')).toContainText('feedfind')
    
    // Search functionality
    await fillSearchForm(page, '10001')
    await waitForSearchResults(page)
    
    // Verify browser-specific features
    if (browserName === 'chromium') {
      // Test Chrome-specific features
      await expect(page.locator('[data-testid="location-list"]')).toBeVisible()
    } else if (browserName === 'firefox') {
      // Test Firefox-specific features
      await expect(page.locator('[data-testid="location-list"]')).toBeVisible()
    } else if (browserName === 'webkit') {
      // Test Safari-specific features
      await expect(page.locator('[data-testid="location-list"]')).toBeVisible()
    }
  })
})

test.describe('Mobile Responsiveness', () => {
  test('Application works on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-search-form"]')).toBeVisible()
    
    // Test mobile search
    await page.fill('[data-testid="search-input"]', '12345')
    await page.click('[data-testid="search-button"]')
    
    await waitForSearchResults(page)
    
    // Verify mobile-optimized results
    await expect(page.locator('[data-testid="mobile-location-card"]')).toBeVisible()
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })
}) 