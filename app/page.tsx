import { Suspense } from 'react'
import Link from 'next/link'
import { HeaderAd, SidebarAd, FooterAd } from '@/components/ui/AdSense'
import Header from '@/components/layout/Header'
import SuccessMessage from '@/components/ui/SuccessMessage'

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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-4">
                food assistance
              </h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    food banks
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    food pantries
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    soup kitchens
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    meal delivery
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    community gardens
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    senior services
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    wic/snap assistance
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                resources
              </h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    nutrition education
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    cooking classes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    emergency assistance
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    holiday programs
                  </a>
                </li>
              </ul>
            </div>

            {/* Non-obtrusive sidebar ad */}
            <SidebarAd />
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {/* Search Bar */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <form className="flex gap-3">
                <input
                  type="text"
                  id="location-search"
                  name="location"
                  placeholder="search location (zip code, city, neighborhood)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  aria-label="Search for food assistance by location"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  search
                </button>
              </form>
              <div className="flex gap-4 mt-3 text-xs">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-1" />
                  open now
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-1" />
                  within 5 miles
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-1" />
                  no registration required
                </label>
              </div>
            </div>

            {/* Recent Listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  recent food assistance listings
                </h2>
                <div className="text-sm text-gray-500">
                  <span className="mr-4">view: </span>
                  <a href="#" className="text-blue-600 hover:underline mr-2">list</a>
                  <a href="#" className="text-blue-600 hover:underline">map</a>
                </div>
              </div>

              {/* Listings */}
              <div className="space-y-3">
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-blue-600 hover:underline font-medium">
                        <a href="#" className="block">
                          Community Food Bank - Emergency Food Distribution
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Fresh produce, canned goods, and pantry staples available. No appointment needed.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                        <span>📍 Downtown - 1.2 miles</span>
                        <span className="text-green-600 font-medium">🟢 OPEN NOW</span>
                        <span>⏰ Mon-Fri 9am-4pm</span>
                        <span>👥 No registration required</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <div>updated: 2h ago</div>
                      <div className="mt-1">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-blue-600 hover:underline font-medium">
                        <a href="#" className="block">
                          St. Mary&apos;s Soup Kitchen - Hot Meals Daily
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Free hot lunch served daily. All are welcome, no questions asked.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                        <span>📍 Midtown - 2.3 miles</span>
                        <span className="text-green-600 font-medium">🟢 OPEN NOW</span>
                        <span>⏰ Daily 11:30am-1pm</span>
                        <span>🍽️ Hot meals</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <div>updated: 4h ago</div>
                      <div className="mt-1">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          serving now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-blue-600 hover:underline font-medium">
                        <a href="#" className="block">
                          Westside Food Pantry - Weekend Distribution
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Weekend food distribution with fresh vegetables and dairy products.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                        <span>📍 Westside - 3.1 miles</span>
                        <span className="text-amber-600 font-medium">🟡 LIMITED STOCK</span>
                        <span>⏰ Sat-Sun 10am-2pm</span>
                        <span>📋 Registration preferred</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <div>updated: 6h ago</div>
                      <div className="mt-1">
                        <span className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                          limited
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-blue-600 hover:underline font-medium">
                        <a href="#" className="block">
                          Mobile Food Truck - East Park Distribution
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Weekly mobile food distribution at East Park. Variety of fresh and non-perishable items.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                        <span>📍 East Park - 4.2 miles</span>
                        <span className="text-red-600 font-medium">🔴 CLOSED</span>
                        <span>⏰ Wednesdays 12pm-3pm</span>
                        <span>🚚 Mobile service</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <div>updated: 1d ago</div>
                      <div className="mt-1">
                        <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          closed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-blue-600 hover:underline font-medium">
                        <a href="#" className="block">
                          Senior Center Nutrition Program
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Meals and groceries for seniors 60+. Call ahead for availability.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                        <span>📍 Northside - 1.8 miles</span>
                        <span className="text-green-600 font-medium">🟢 OPEN NOW</span>
                        <span>⏰ Mon-Fri 8am-3pm</span>
                        <span>👴 Seniors 60+</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <div>updated: 3h ago</div>
                      <div className="mt-1">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          call ahead
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Load More */}
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:underline text-sm">
                  load more listings →
                </button>
              </div>
            </div>
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
                <li><a href="#" className="text-blue-600 hover:underline">help & FAQ</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">safety tips</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">terms of use</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">privacy policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
              <ul className="space-y-1">
                <li><Link href="/provider-register" as="/provider-register" className="text-blue-600 hover:underline">add your organization</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">update your listing</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">provider resources</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">bulk posting</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">community</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">volunteer opportunities</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">donate to local organizations</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">community forums</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">resource guides</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">contact</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">report an issue</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">suggest improvements</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">partnership inquiries</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2024 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </main>
  )
} 