'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SuccessMessage() {
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'profile-updated') {
      setShowSuccessMessage(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [searchParams])

  if (!showSuccessMessage) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div 
        className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between"
        role="alert"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Profile updated successfully!</span>
          <span className="ml-2 text-green-600">Your settings have been saved.</span>
        </div>
        <button
          onClick={() => setShowSuccessMessage(false)}
          className="text-green-500 hover:text-green-700 ml-4"
          aria-label="Close message"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
} 