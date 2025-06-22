'use client'

import React, { useState } from 'react'
import Header from '../../../components/layout/Header'
import { seedDatabase, checkExistingData } from '../../../lib/seedData'

export default function DebugSeedPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasData, setHasData] = useState<boolean | null>(null)

  const checkData = async () => {
    setLoading(true)
    try {
      const exists = await checkExistingData()
      setHasData(exists)
      setMessage(exists ? 'Database has existing location data' : 'Database appears empty')
    } catch (error) {
      setMessage('Error checking database: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const runSeed = async () => {
    setLoading(true)
    setMessage('Seeding database...')
    
    try {
      const success = await seedDatabase()
      if (success) {
        setMessage('Database seeded successfully! You can now test the search functionality.')
        setHasData(true)
      } else {
        setMessage('Failed to seed database. Check console for errors.')
      }
    } catch (error) {
      setMessage('Error seeding database: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Database Seeding Tool
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Debug Tool:</strong> This page allows you to populate the database with sample food assistance locations 
              for testing the search functionality. Use this only in development.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <button
                onClick={checkData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Database Status'}
              </button>
            </div>

            {hasData !== null && (
              <div className={`p-4 rounded-lg ${
                hasData 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-orange-50 border border-orange-200 text-orange-800'
              }`}>
                <p className="font-medium">
                  {hasData ? '✓ Database has data' : '⚠ Database is empty'}
                </p>
              </div>
            )}

            <div>
              <button
                onClick={runSeed}
                disabled={loading || hasData === true}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Seeding...
                  </>
                ) : (
                  'Seed Database'
                )}
              </button>
              
              {hasData && (
                <p className="text-sm text-gray-600 mt-2">
                  Database already has data. Clear it first if you want to re-seed.
                </p>
              )}
            </div>

            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">{message}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Overview</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>3 Provider Organizations:</strong> Community Food Bank, Downtown Soup Kitchen, West Coast Food Network</p>
              <p>• <strong>5 Food Assistance Locations:</strong> Various types including food pantries, soup kitchen, and mobile pantry</p>
              <p>• <strong>Geographic Coverage:</strong> New York (ZIP 10001, 10002) and California (ZIP 90210, 90211)</p>
              <p>• <strong>Test Search Queries:</strong> Try searching for "10001", "90210", "New York", or "Los Angeles"</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex space-x-4">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Home
              </a>
              <a
                href="/search"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Test Search →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 