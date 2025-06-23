import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '../hooks/useAuth'
import SetupWrapper from '../components/setup/SetupWrapper'
import ErrorBoundary from '../components/setup/ErrorBoundary'
import { LocationProvider } from '../hooks/useLocation'
import LocationPromptWrapper from '../components/layout/LocationPromptWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'feedfind - find food assistance near you',
  description: 'Find food assistance, food banks, soup kitchens, and pantries near you with real-time availability updates.',
  metadataBase: new URL('https://feedfind.org'),
  verification: {
    google: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.replace('ca-pub-', '') || '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense - Only load if valid client ID is provided */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && 
         process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID !== 'ca-pub-1234567890123456' && 
         process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID !== 'ca-pub-your-client-id' && (
          <>
            <meta 
              name="google-adsense-account"
              content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            />
            <Script
              id="google-adsense"
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
              onError={(e) => {
                console.error('AdSense script failed to load:', e)
              }}
            />
          </>
        )}
      </head>
      <body 
        className={`${inter.className} bg-white text-gray-900 min-h-screen`}
        suppressHydrationWarning={true}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-purple-600 text-white px-3 py-2 rounded z-50"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <AuthProvider>
            <LocationProvider>
              <SetupWrapper>
                {children}
                <LocationPromptWrapper />
              </SetupWrapper>
            </LocationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 