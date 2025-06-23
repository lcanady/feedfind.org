'use client'

import { useState, useEffect } from 'react'
import { validateZipCode } from '@/lib/locationService'
import { useLocation } from '@/hooks/useLocation'

interface LocationPromptProps {
  onClose: () => void
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({ onClose }) => {
  const [zipCode, setZipCode] = useState('')
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const { zipCode: storedZipCode, setUserZipCode } = useLocation()

  useEffect(() => {
    // Show prompt if no zipcode is stored
    if (!storedZipCode) {
      setIsVisible(true)
    }
  }, [storedZipCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateZipCode(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }

    // Save using the location hook
    setUserZipCode(zipCode)
    setIsVisible(false)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 bg-trust-blue text-white p-4 shadow-lg"
      style={{ zIndex: 1000 }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm sm:text-base">
          Help us show you relevant food assistance locations by setting your ZIP code
        </p>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP code"
              aria-label="ZIP code"
              className="px-3 py-2 rounded text-text-primary w-32"
              maxLength={5}
            />
            {error && (
              <p className="text-xs text-alert-red mt-1 absolute" role="alert">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="bg-white text-trust-blue px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Set Location
          </button>
        </form>
      </div>
    </div>
  )
} 