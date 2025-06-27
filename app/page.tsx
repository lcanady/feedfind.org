import { Suspense } from 'react'
import Link from 'next/link'
import { HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'
import Header from '@/components/layout/Header'
import SuccessMessage from '@/components/ui/SuccessMessage'
import { MainSearchForm } from '@/components/search/MainSearchForm'
import CategoryNavigation from '@/components/features/CategoryNavigation'
import RecentListings from '@/components/features/RecentListings'

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Success Message */}
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      {/* Screen reader accessible main heading */}
      <h1 className="sr-only">feedfind - Find Food Assistance Near You</h1>

      {/* Non-obtrusive header ad */}
      <div className="max-w-7xl mx-auto px-4">
        <HeaderAd />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Left Sidebar - Categories */}
          <div className="md:col-span-1">
            <CategoryNavigation />

            {/* Non-obtrusive sidebar ad */}
            <SidebarAd />
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {/* Search Bar */}
            <MainSearchForm />

            {/* Recent Listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  recent food assistance listings
                </h2>
                <div className="text-sm text-gray-500">
                  <span className="mr-4">view: </span>
                  <Link href="/search" className="text-blue-600 hover:underline mr-2">list</Link>
                  <Link href="/map" className="text-blue-600 hover:underline">map</Link>
                </div>
              </div>

              {/* Recent Listings Component */}
              <Suspense 
                fallback={
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-b border-gray-200 pb-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                }
              >
                <RecentListings limit={8} />
              </Suspense>

              {/* View All Link */}
              <div className="mt-6 text-center">
                <Link 
                  href="/search"
                  className="text-blue-600 hover:underline font-medium"
                >
                  view all food assistance locations →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How FeedFind Works section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How FeedFind Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform connects you with real-time food assistance information, 
              ensuring you never make a wasted trip to an empty or closed location.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Search Your Area
              </h3>
              <p className="text-gray-600">
                Enter your ZIP code or use GPS to find food assistance locations near you.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🕒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-Time Status
              </h3>
              <p className="text-gray-600">
                See current availability, wait times, and operating hours updated by providers.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Directions
              </h3>
              <p className="text-gray-600">
                Access contact information, directions, and details about services offered.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/search" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Searching Now
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Non-obtrusive footer ad */}
          <FooterAd />
          
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">about</h3>
              <ul className="space-y-1">
                <li><Link href="/help" className="text-blue-600 hover:underline">help & FAQ</Link></li>
                <li><Link href="/help#safety-tips" className="text-blue-600 hover:underline">safety tips</Link></li>
                <li><Link href="/terms" className="text-blue-600 hover:underline">terms of use</Link></li>
                <li><Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
              <ul className="space-y-1">
                <li><Link href="/add-organization" className="text-blue-600 hover:underline">add your organization</Link></li>
                <li><Link href="/update-listing" className="text-blue-600 hover:underline">update your listing</Link></li>
                <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                <li><Link href="/bulkposting" className="text-blue-600 hover:underline">bulk posting</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">community</h3>
              <ul className="space-y-1">
                <li><Link href="/community/volunteer" className="text-blue-600 hover:underline">volunteer opportunities</Link></li>
                <li><Link href="/contact#partnerships" className="text-blue-600 hover:underline">donate to local organizations</Link></li>
                <li><Link href="/community/forums" className="text-blue-600 hover:underline">community forums</Link></li>
                <li><Link href="/community/resources" className="text-blue-600 hover:underline">resource guides</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">contact</h3>
              <ul className="space-y-1">
                <li><Link href="/contact#report-problems" className="text-blue-600 hover:underline">report an issue</Link></li>
                <li><Link href="/contact#feedback-suggestions" className="text-blue-600 hover:underline">suggest improvements</Link></li>
                <li><Link href="/contact#partnerships-media" className="text-blue-600 hover:underline">partnership inquiries</Link></li>
                <li><Link href="/contact#feedback-suggestions" className="text-blue-600 hover:underline">feedback</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2025 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </main>
  )
} 