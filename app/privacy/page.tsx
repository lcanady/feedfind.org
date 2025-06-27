import React from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { HeaderAd } from '@/components/ui/AdSense'

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-4">Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
          <p className="text-sm text-gray-500">Last updated: January 1, 2025</p>
        </header>

        {/* Summary */}
        <section className="mb-12">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">Privacy Summary</h2>
            <ul className="space-y-2 text-blue-800">
              <li>• We collect minimal information necessary to provide our services</li>
              <li>• We never sell or share your personal information with third parties</li>
              <li>• Location data is only used to help you find nearby food assistance</li>
              <li>• You can use our service without creating an account</li>
              <li>• We use industry-standard security to protect your data</li>
            </ul>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Information We Collect</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Email address and name (when you create an account)</li>
                <li>Organization information (for food assistance providers)</li>
                <li>Reviews and comments you submit</li>
                <li>Feedback and support messages</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Information We Collect Automatically</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Location data (only when you choose to share it for search results)</li>
                <li>Device and browser information</li>
                <li>Usage patterns and preferences</li>
                <li>IP address and general location (city/state level)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Information We Don't Collect</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>We don't track your food assistance visits</li>
                <li>We don't store sensitive personal information</li>
                <li>We don't require identification to use our service</li>
                <li>We don't collect unnecessary personal details</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How We Use Your Information</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Primary Uses</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide location-based search results</li>
                <li>Enable provider account management</li>
                <li>Process and display reviews</li>
                <li>Respond to support requests</li>
                <li>Improve our service quality</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">We Will Never</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Sell your personal information to third parties</li>
                <li>Share your location data without permission</li>
                <li>Send you unsolicited marketing emails</li>
                <li>Track you across other websites</li>
                <li>Require unnecessary personal information</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Location Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location Privacy</h2>
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-medium text-green-900 mb-3">Your Location is Protected</h3>
            <div className="space-y-3 text-green-800">
              <p>Location sharing is always optional and controlled by you:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>We only access location when you click "Use My Location"</li>
                <li>Location data is used only for that specific search</li>
                <li>We don't store your precise location</li>
                <li>You can always search by ZIP code instead</li>
                <li>Location permissions can be revoked at any time</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Sharing</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Limited Sharing</h3>
              <p className="text-gray-600 mb-3">We only share information in these specific circumstances:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>To protect the safety of users or the public</li>
                <li>In the event of a business transfer (with continued privacy protection)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Service Providers</h3>
              <p className="text-gray-600 mb-3">We work with trusted service providers who help us operate our platform:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Cloud hosting services (data is encrypted)</li>
                <li>Analytics services (data is anonymized)</li>
                <li>Email services (only for service communications)</li>
                <li>All providers are bound by strict privacy agreements</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Rights & Choices</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Access & Control</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>View and update your account information</li>
                <li>Delete your account and associated data</li>
                <li>Request a copy of your data</li>
                <li>Opt out of non-essential communications</li>
                <li>Control location sharing permissions</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Managing Your Privacy</h3>
              <p className="text-gray-600 mb-3">You can control your privacy through:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Browser settings and cookie controls</li>
                <li>Location permissions in your device settings</li>
                <li>Account privacy settings on our platform</li>
                <li>Contacting us for specific requests</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Security</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How We Protect Your Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>All data is encrypted in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information</li>
              <li>Secure authentication systems</li>
              <li>Incident response procedures</li>
            </ul>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Children's Privacy</h2>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-3">Under 13 Protection</h3>
            <p className="text-yellow-800">
              Our service is not directed to children under 13. We do not knowingly collect personal information 
              from children under 13. If we learn that we have collected such information, we will delete it immediately. 
              Parents who believe their child has provided information to us should contact us at privacy@feedfind.org.
            </p>
          </div>
        </section>

        {/* Policy Changes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Policy Updates</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              We may update this privacy policy from time to time. When we do:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>We'll notify you of significant changes</li>
              <li>The updated date will be shown at the top</li>
              <li>Previous versions will be available upon request</li>
              <li>Continued use indicates acceptance of changes</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Privacy Questions?</h3>
            <p className="text-blue-800 mb-4">
              If you have questions about this privacy policy or how we handle your information, please contact us:
            </p>
            <div className="space-y-2 text-blue-800">
              <p>Email: privacy@feedfind.org</p>
              <p>Phone: (555) 123-FEED</p>
              <p>Mail: FeedFind Privacy Team, 123 Community Drive, Austin, TX 78701</p>
            </div>
          </div>
        </section>
      </div>

      {/* Site Footer */}
      <Footer />
    </main>
  )
} 