import React from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { HeaderAd } from '@/components/ui/AdSense'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 mb-4">These terms govern your use of FeedFind and our services.</p>
          <p className="text-sm text-gray-500">Last updated: January 1, 2025</p>
        </header>

        {/* Summary */}
        <section className="mb-12">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">Terms Summary</h2>
            <ul className="space-y-2 text-blue-800">
              <li>• Our service is free to use for finding food assistance</li>
              <li>• Be respectful and honest in your interactions</li>
              <li>• We work to keep information accurate but can't guarantee it</li>
              <li>• Report problems or inaccurate information to help us improve</li>
              <li>• These terms help ensure our platform serves everyone fairly</li>
            </ul>
          </div>
        </section>

        {/* Acceptance */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Acceptance of Terms</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 leading-relaxed">
              By using FeedFind, you agree to these terms of service. If you don't agree with any part of these terms, 
              please don't use our service. We may update these terms from time to time, and continued use means 
              you accept any changes.
            </p>
          </div>
        </section>

        {/* Our Service */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Service</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">What We Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Real-time information about food assistance locations</li>
                <li>Search tools to find resources near you</li>
                <li>Platform for providers to update their information</li>
                <li>Community features for sharing experiences</li>
                <li>Educational resources about food assistance</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">What We Don't Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Direct food assistance or social services</li>
                <li>Guarantee that locations are open or have food available</li>
                <li>Medical, legal, or professional advice</li>
                <li>Emergency services (call 911 for emergencies)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Responsibilities</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Acceptable Use</h3>
              <p className="text-gray-600 mb-3">When using our platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide accurate information when creating accounts or reviews</li>
                <li>Respect other users and service providers</li>
                <li>Use the service only for its intended purpose</li>
                <li>Report inaccurate information to help keep our database current</li>
                <li>Follow all applicable laws and regulations</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Prohibited Activities</h3>
              <p className="text-gray-600 mb-3">You must not:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Submit false, misleading, or inappropriate content</li>
                <li>Harass, discriminate against, or threaten other users</li>
                <li>Attempt to compromise the security of our platform</li>
                <li>Use automated tools to scrape or abuse our service</li>
                <li>Post spam, advertisements, or irrelevant content</li>
                <li>Impersonate others or create fake accounts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Provider Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">For Service Providers</h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-medium text-green-900 mb-3">Provider Responsibilities</h3>
              <p className="text-green-800 mb-3">As a registered food assistance provider, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-green-800">
                <li>Keep your organization information accurate and up-to-date</li>
                <li>Update your status regularly (open/closed/limited)</li>
                <li>Provide services without discrimination based on protected characteristics</li>
                <li>Maintain appropriate standards of service and safety</li>
                <li>Respond to inquiries and feedback in a timely manner</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Process</h3>
              <p className="text-gray-600 mb-3">To maintain platform integrity:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>We may verify organization information and credentials</li>
                <li>False information may result in removal from our platform</li>
                <li>We reserve the right to investigate reported problems</li>
                <li>Providers must be legitimate food assistance organizations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Content & Reviews */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Content & Reviews</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">User-Generated Content</h3>
              <p className="text-gray-600 mb-3">When you post reviews or comments:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>You retain ownership of your content</li>
                <li>You grant us permission to display and moderate it</li>
                <li>Content must be relevant, respectful, and honest</li>
                <li>We may remove content that violates our guidelines</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Content Guidelines</h3>
              <p className="text-gray-600 mb-3">All content must be:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Based on genuine experience</li>
                <li>Free from hate speech, discrimination, or harassment</li>
                <li>Respectful of people's dignity and circumstances</li>
                <li>Focused on the service experience rather than personal details</li>
                <li>Constructive and helpful to other users</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Information Accuracy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Information Accuracy</h2>
          
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-3">Important Disclaimer</h3>
            <div className="space-y-3 text-yellow-800">
              <p>
                While we work hard to keep information accurate and current, we cannot guarantee that all 
                information on our platform is completely up-to-date or error-free.
              </p>
              <p><strong>Always confirm details directly with service providers when possible:</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Call ahead to verify hours and availability</li>
                <li>Check requirements and eligibility criteria</li>
                <li>Confirm location and contact information</li>
                <li>Ask about current services and restrictions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacy</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
              your information. By using our service, you also agree to our Privacy Policy.
            </p>
            <p className="text-gray-600 mt-3">
              <a href="/privacy" className="text-blue-600 hover:underline">
                Read our full Privacy Policy →
              </a>
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Limitation of Liability</h2>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              FeedFind is an information platform. We provide our service "as is" without warranties of any kind. 
              We are not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Accuracy of third-party information</li>
              <li>Availability of food assistance services</li>
              <li>Actions or policies of service providers</li>
              <li>Outcomes from using information on our platform</li>
              <li>Technical issues or service interruptions</li>
            </ul>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Termination</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Your Rights</h3>
              <p className="text-gray-600">
                You can stop using our service at any time. If you have an account, you can delete it 
                from your account settings or by contacting us.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Our Rights</h3>
              <p className="text-gray-600 mb-3">
                We may suspend or terminate accounts that violate these terms, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Posting inappropriate or harmful content</li>
                <li>Attempting to abuse or compromise our system</li>
                <li>Providing false information repeatedly</li>
                <li>Harassing other users or staff</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Changes to These Terms</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              We may update these terms from time to time to reflect changes in our service or legal requirements. When we do:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>We'll update the "last modified" date at the top</li>
              <li>Significant changes will be communicated to users</li>
              <li>Continued use of our service means you accept the new terms</li>
              <li>Previous versions are available upon request</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Questions or Concerns</h2>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Get in Touch</h3>
            <p className="text-blue-800 mb-4">
              If you have questions about these terms of service or need to report a problem, please contact us:
            </p>
            <div className="space-y-2 text-blue-800">
              <p>Email: legal@feedfind.org</p>
              <p>Phone: (555) 123-FEED</p>
              <p>Mail: FeedFind Legal Team, 123 Community Drive, Austin, TX 78701</p>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Governing Law</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600">
              These terms are governed by the laws of the State of Texas, United States. 
              Any disputes will be resolved in the appropriate courts of Travis County, Texas.
            </p>
          </div>
        </section>
      </div>

      {/* Site Footer */}
      <Footer />
    </main>
  )
} 