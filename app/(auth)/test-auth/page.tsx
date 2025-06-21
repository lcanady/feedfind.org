'use client'

import Link from 'next/link'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import { useAuth } from '../../../hooks/useAuth'

function TestDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Authentication Success!
        </h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">User Details:</h2>
            <div className="mt-2 bg-gray-50 p-3 rounded">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>User ID:</strong> {user?.uid}</p>
              <p><strong>Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestAuthPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <TestDashboard />
      </div>
    </ProtectedRoute>
  )
} 