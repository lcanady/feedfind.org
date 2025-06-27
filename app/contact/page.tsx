import React from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { HeaderAd } from '@/components/ui/AdSense'

export default function ContactPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Header Ad */}
      <div className="max-w-7xl mx-auto px-4">
        <HeaderAd />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">We're here to help. Reach out to us with questions, feedback, or support needs.</p>
        </header>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12">
          <h2 className="text-lg font-medium text-red-900 mb-2">Need Immediate Food Assistance?</h2>
          <p className="text-red-800 mb-3">
            If you need immediate food assistance, please call 211 to connect with emergency food services in your area. 
            This service is available 24/7.
          </p>
          <p className="text-red-800">
            For mental health emergencies, call 988 (Suicide & Crisis Lifeline) or 911 for immediate emergency services.
          </p>
        </div>

        {/* Contact Methods */}
        <section id="get-in-touch" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get In Touch</h2>
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* General Support */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Support</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Email:</span>
                  <a href="mailto:support@feedfind.org" className="text-blue-600 hover:underline">
                    support@feedfind.org
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Phone:</span>
                  <a href="tel:+15551234333" className="text-blue-600 hover:underline">
                    (555) 123-FEED
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Hours:</span>
                  <span className="text-gray-600">Monday-Friday, 9am-5pm EST</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                For general questions, technical support, and user assistance.
              </p>
            </div>

            {/* Provider Support */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Support</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Email:</span>
                  <a href="mailto:providers@feedfind.org" className="text-blue-600 hover:underline">
                    providers@feedfind.org
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Phone:</span>
                  <a href="tel:+15551234777" className="text-blue-600 hover:underline">
                    (555) 123-PROV
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Hours:</span>
                  <span className="text-gray-600">Monday-Friday, 8am-6pm EST</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                For food assistance providers, organizations, and partners.
              </p>
            </div>

            {/* Technical Issues */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Issues</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Email:</span>
                  <a href="mailto:tech@feedfind.org" className="text-blue-600 hover:underline">
                    tech@feedfind.org
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Response:</span>
                  <span className="text-gray-600">Within 24 hours</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Report bugs, accessibility issues, or technical problems.
              </p>
            </div>

            {/* Feedback & Suggestions */}
            <div id="feedback-suggestions" className="bg-white rounded-lg border border-gray-200 p-6 scroll-mt-16">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback & Suggestions</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Email:</span>
                  <a href="mailto:feedback@feedfind.org" className="text-blue-600 hover:underline">
                    feedback@feedfind.org
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Response:</span>
                  <span className="text-gray-600">Within 3 business days</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Share ideas, suggestions, or feedback to help us improve.
              </p>
            </div>
          </div>
        </section>

        {/* Partnerships */}
        <section id="partnerships-media" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Partnerships & Media</h2>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Interested in Partnering With Us?</h3>
            <p className="text-blue-800 mb-4">
              We welcome partnerships with food assistance organizations, technology companies, 
              government agencies, and community groups.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium text-blue-900 w-24">Partnerships:</span>
                <a href="mailto:partnerships@feedfind.org" className="text-blue-600 hover:underline">
                  partnerships@feedfind.org
                </a>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-blue-900 w-24">Media:</span>
                <a href="mailto:media@feedfind.org" className="text-blue-600 hover:underline">
                  media@feedfind.org
                </a>
              </div>
            </div>
          </div>

          <div id="partnerships" className="bg-green-50 rounded-lg border border-green-200 p-6 scroll-mt-16">
            <h3 className="text-lg font-medium text-green-900 mb-3">Donate to Local Organizations</h3>
            <p className="text-green-800 mb-4">
              While FeedFind doesn't directly accept donations, we can help you find reputable local food assistance 
              organizations that would greatly benefit from your support.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium text-green-900 w-24">Find Local Orgs:</span>
                <a href="/search" className="text-green-600 hover:underline">
                  Search for organizations near you
                </a>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-green-900 w-24">Donation Help:</span>
                <a href="mailto:donations@feedfind.org" className="text-green-600 hover:underline">
                  donations@feedfind.org
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Reporting Issues */}
        <section id="report-problems" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Report Problems</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Incorrect Information</h3>
              <p className="text-gray-600 mb-4">
                If you find incorrect information about a location (hours, status, contact info), please let us know so we can update it quickly.
              </p>
              <a href="mailto:corrections@feedfind.org" className="text-blue-600 hover:underline font-medium">
                corrections@feedfind.org
              </a>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Inappropriate Content</h3>
              <p className="text-gray-600 mb-4">
                Report inappropriate reviews, comments, or other content that violates our community guidelines.
              </p>
              <a href="mailto:moderation@feedfind.org" className="text-blue-600 hover:underline font-medium">
                moderation@feedfind.org
              </a>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Discrimination or Safety Concerns</h3>
              <p className="text-gray-600 mb-4">
                If you experienced discrimination or have safety concerns at a food assistance location, we want to help address the issue.
              </p>
              <a href="mailto:safety@feedfind.org" className="text-blue-600 hover:underline font-medium">
                safety@feedfind.org
              </a>
            </div>
          </div>
        </section>

        {/* Office Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Office</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">FeedFind Headquarters</h3>
            <div className="space-y-2 text-gray-600">
              <p>123 Community Drive</p>
              <p>Social Impact Center, Suite 200</p>
              <p>Austin, TX 78701</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <em>Note: We primarily operate remotely. Please contact us via email or phone for the fastest response.</em>
            </p>
          </div>
        </section>

        {/* Response Times */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What to Expect</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Response Times</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Urgent issues: Within 4 hours</li>
                  <li>• General support: Within 24 hours</li>
                  <li>• Feedback: Within 3 business days</li>
                  <li>• Partnerships: Within 1 week</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">How We Can Help</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Technical support and troubleshooting</li>
                  <li>• Account and registration assistance</li>
                  <li>• Information corrections and updates</li>
                  <li>• Accessibility support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Site Footer */}
      <Footer />
    </main>
  )
} 