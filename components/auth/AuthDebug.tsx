'use client'

import { useAuth } from '../../hooks/useAuth'

export default function AuthDebug() {
  const { user, loading, error, isAuthenticated } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {loading ? '🔄 true' : '✅ false'}</div>
      <div>Authenticated: {isAuthenticated ? '✅ true' : '❌ false'}</div>
      <div>User: {user?.email || 'null'}</div>
      <div>Name: {user?.displayName || user?.profile?.firstName || 'none'}</div>
      {error && <div className="text-red-300">Error: {error}</div>}
    </div>
  )
} 