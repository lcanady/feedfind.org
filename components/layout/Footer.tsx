'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              About
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/help" className="text-base text-gray-600 hover:text-gray-900">
                  Help & FAQ
                </Link>
              </li>
              <li>
                <Link href="/help#safety-tips" className="text-base text-gray-600 hover:text-gray-900">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-base text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/community/resources" className="text-base text-gray-600 hover:text-gray-900">
                  Resource Guides
                </Link>
              </li>
              <li>
                <Link href="/community/volunteer" className="text-base text-gray-600 hover:text-gray-900">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link href="/community/events" className="text-base text-gray-600 hover:text-gray-900">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/community/forums" className="text-base text-gray-600 hover:text-gray-900">
                  Forums
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              For Providers
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/add-organization" className="text-base text-gray-600 hover:text-gray-900">
                  Add Your Organization
                </Link>
              </li>
              <li>
                <Link href="/update-listing" className="text-base text-gray-600 hover:text-gray-900">
                  Update Your Listing
                </Link>
              </li>
              <li>
                <Link href="/provider-resources" className="text-base text-gray-600 hover:text-gray-900">
                  Provider Resources
                </Link>
              </li>
              <li>
                <Link href="/bulkposting" className="text-base text-gray-600 hover:text-gray-900">
                  Bulk Posting
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://twitter.com/feedfind" className="text-base text-gray-600 hover:text-gray-900">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://facebook.com/feedfind" className="text-base text-gray-600 hover:text-gray-900">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com/feedfind" className="text-base text-gray-600 hover:text-gray-900">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://github.com/feedfind" className="text-base text-gray-600 hover:text-gray-900">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-500 text-center">
            &copy; {new Date().getFullYear()} FeedFind. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 