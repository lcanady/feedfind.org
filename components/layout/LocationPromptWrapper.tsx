'use client'

import dynamic from 'next/dynamic'

const LocationPrompt = dynamic(() => import('../ui/LocationPrompt').then(mod => ({ default: mod.LocationPrompt })), {
  ssr: false
})

export default function LocationPromptWrapper() {
  return <LocationPrompt onClose={() => {}} />
} 