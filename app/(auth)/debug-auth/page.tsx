'use client'

import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

export default function DebugAuthPage() {
  const { loginWithGoogle, error, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleGoogleLogin = async () => {
    try {
      console.log('Attempting Google login...')
      setDebugInfo({ status: 'attempting', timestamp: new Date().toISOString() })
      
      await loginWithGoogle()
      
      setDebugInfo({ status: 'success', timestamp: new Date().toISOString() })
    } catch (err: any) {
      console.error('Google login error:', err)
      setDebugInfo({ 
        status: 'error', 
        error: err.message,
        code: err.code,
        timestamp: new Date().toISOString(),
        fullError: err
      })
    }
  }

  // Check Firebase config
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Google OAuth Debug Page
        </h1>

        <div className="grid gap-6">
          {/* Firebase Configuration */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono">
              <pre>{JSON.stringify(firebaseConfig, null, 2)}</pre>
            </div>
            <div className="mt-4">
              <h3 className="font-medium text-gray-700">Status:</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li className={firebaseConfig.apiKey ? 'text-green-600' : 'text-red-600'}>
                  ✓ API Key: {firebaseConfig.apiKey ? 'Set' : 'Missing'}
                </li>
                <li className={firebaseConfig.authDomain ? 'text-green-600' : 'text-red-600'}>
                  ✓ Auth Domain: {firebaseConfig.authDomain ? 'Set' : 'Missing'}
                </li>
                <li className={firebaseConfig.projectId ? 'text-green-600' : 'text-red-600'}>
                  ✓ Project ID: {firebaseConfig.projectId ? 'Set' : 'Missing'}
                </li>
                <li className={firebaseConfig.appId ? 'text-green-600' : 'text-red-600'}>
                  ✓ App ID: {firebaseConfig.appId ? 'Set' : 'Missing'}
                </li>
              </ul>
            </div>
          </div>

          {/* Google Login Test */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Google Login Test</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
                <strong>Auth Error:</strong> {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Testing Google Login...' : 'Test Google Login'}
            </button>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
              <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">🛠️ Next Steps</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>
                <strong>Enable Google Auth in Firebase:</strong>
                <br />
                Go to Firebase Console → Authentication → Sign-in method → Enable Google
              </li>
              <li>
                <strong>Set up OAuth Consent Screen:</strong>
                <br />
                Go to Google Cloud Console → APIs & Services → OAuth consent screen
              </li>
              <li>
                <strong>Create OAuth Credentials:</strong>
                <br />
                Go to Google Cloud Console → APIs & Services → Credentials
              </li>
              <li>
                <strong>Add Authorized Domains:</strong>
                <br />
                Add localhost:3000, localhost:3002, and your production domain
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 