'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false)
  const [providersDropdownOpen, setProvidersDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get user display name - prefer first name, fall back to email
  const getUserDisplayName = () => {
    if (user?.profile?.firstName) {
      return user.profile.firstName
    }
    if (user?.displayName) {
      return user.displayName
    }
    return user?.email || 'User'
  }

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <h1 className="text-2xl font-bold text-purple-600">
                feedfind
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                find food assistance near you
              </p>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search */}
            <Link 
              href="/search" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Search
            </Link>

            {/* Map */}
            <Link 
              href="/map" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Map
            </Link>

            {/* Community Dropdown */}
            <div className="relative"
                 onMouseEnter={() => setCommunityDropdownOpen(true)}
                 onMouseLeave={() => setCommunityDropdownOpen(false)}>
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Community
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {communityDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link href="/community" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Community Home
                    </Link>
                    <Link href="/community/forums" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Forums
                    </Link>
                    <Link href="/community/volunteer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Volunteer Opportunities
                    </Link>
                    <Link href="/community/events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Events
                    </Link>
                    <Link href="/community/resources" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Resource Guides
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Providers Dropdown */}
            <div className="relative"
                 onMouseEnter={() => setProvidersDropdownOpen(true)}
                 onMouseLeave={() => setProvidersDropdownOpen(false)}>
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Providers
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {providersDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link href="/add-organization" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Add Your Organization
                    </Link>
                    <Link href="/update-listing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Update Your Listing
                    </Link>
                    <Link href="/provider-resources" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Provider Resources
                    </Link>
                    <Link href="/bulkposting" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Bulk Posting
                    </Link>
                    {isAuthenticated && (
                      <Link href="/provider" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Provider Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Links */}
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {getUserDisplayName()}
                </span>

                {/* Admin link for admin/superuser roles */}
                {(user?.role === 'admin' || user?.role === 'superuser') && (
                  <Link 
                    href="/admin" 
                    className="text-red-600 hover:underline text-sm font-medium"
                    title="Admin Dashboard"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/search" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/map" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Map
              </Link>
              
              {/* Community Section */}
              <div className="px-3 py-2">
                <div className="text-gray-900 font-medium text-base mb-2">Community</div>
                <div className="pl-4 space-y-1">
                  <Link href="/community" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Community Home
                  </Link>
                  <Link href="/community/forums" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Forums
                  </Link>
                  <Link href="/community/volunteer" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Volunteer Opportunities
                  </Link>
                  <Link href="/community/events" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Events
                  </Link>
                  <Link href="/community/resources" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Resource Guides
                  </Link>
                </div>
              </div>

              {/* Providers Section */}
              <div className="px-3 py-2">
                <div className="text-gray-900 font-medium text-base mb-2">Providers</div>
                <div className="pl-4 space-y-1">
                  <Link href="/add-organization" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Add Your Organization
                  </Link>
                  <Link href="/update-listing" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Update Your Listing
                  </Link>
                  <Link href="/provider-resources" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Provider Resources
                  </Link>
                  <Link href="/bulkposting" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Bulk Posting
                  </Link>
                  {isAuthenticated && (
                    <Link href="/provider" className="block py-1 text-sm text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Provider Dashboard
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {loading ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                ) : isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm text-gray-700">
                      Welcome, {getUserDisplayName()}
                    </div>
                    {(user?.role === 'admin' || user?.role === 'superuser') && (
                      <Link 
                        href="/admin" 
                        className="block px-3 py-2 text-red-600 hover:bg-gray-50 rounded-md text-base font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      href="/profile" 
                      className="block px-3 py-2 text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-base font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link 
                      href="/login" 
                      className="block px-3 py-2 text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-base font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 