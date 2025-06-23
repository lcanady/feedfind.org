'use client'

import React from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ProfileForm from '@/components/forms/ProfileForm'
import Header from '@/components/layout/Header'
import { HeaderAd } from '@/components/ui/AdSense'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <nav className="text-sm text-gray-500 mb-2">
              <a href="/" className="hover:text-blue-600">Home</a>
              <span className="mx-2">/</span>
              <span>Profile Settings</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600 max-w-3xl">
              Manage your account settings, notification preferences, and privacy options.
            </p>
          </div>

          {/* Top Banner Ad */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <HeaderAd />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProfileForm />
        </div>
      </div>
    </ProtectedRoute>
  )
} 