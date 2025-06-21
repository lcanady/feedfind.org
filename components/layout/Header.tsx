'use client'

import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth()

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
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="block">
              <h1 className="text-3xl font-bold text-purple-600">
                feedfind
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                find food assistance near you
              </p>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/add-organization" 
              className="text-blue-600 hover:underline text-sm"
            >
              add your organization
            </Link>
            
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
                    admin
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-blue-600 hover:underline text-sm"
                >
                  logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  login
                </Link>
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu - simplified for now */}
          <div className="md:hidden">
            {!loading && !isAuthenticated && (
              <Link 
                href="/login" 
                className="text-blue-600 hover:underline text-sm"
              >
                login
              </Link>
            )}
            {!loading && isAuthenticated && (
              <div className="flex items-center space-x-3">
                {/* Admin link for mobile */}
                {(user?.role === 'admin' || user?.role === 'superuser') && (
                  <Link 
                    href="/admin" 
                    className="text-red-600 hover:underline text-sm font-medium"
                    title="Admin Dashboard"
                  >
                    admin
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-blue-600 hover:underline text-sm"
                >
                  logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 