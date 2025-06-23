'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { validateZipCode } from '@/lib/locationService'

interface LocationContextType {
  zipCode: string | null
  setUserZipCode: (zipCode: string) => void
  clearZipCode: () => void
}

const LocationContext = createContext<LocationContextType>({
  zipCode: null,
  setUserZipCode: () => {},
  clearZipCode: () => {}
})

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zipCode, setZipCode] = useState<string | null>(null)

  useEffect(() => {
    // Load zipcode from localStorage on mount
    const storedZip = localStorage.getItem('userZipCode')
    if (storedZip && validateZipCode(storedZip)) {
      setZipCode(storedZip)
    }
  }, [])

  const setUserZipCode = (newZipCode: string) => {
    if (validateZipCode(newZipCode)) {
      localStorage.setItem('userZipCode', newZipCode)
      setZipCode(newZipCode)
    }
  }

  const clearZipCode = () => {
    localStorage.removeItem('userZipCode')
    setZipCode(null)
  }

  return (
    <LocationContext.Provider value={{ zipCode, setUserZipCode, clearZipCode }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
} 