import React from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { HeaderAd, FooterAd } from '@/components/ui/AdSense'

export default function HelpPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">Find answers to common questions and learn how to use our platform effectively.</p>
      </header>

      {/* Quick Links Section */}
      <section className="mb-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link 
            href="#finding-food"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-blue-600">Finding Food Assistance</h3>
            <p className="text-sm text-gray-600 mt-1">Learn how to search for food resources near you</p>
          </Link>
          <Link 
            href="#providers"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-blue-600">For Service Providers</h3>
            <p className="text-sm text-gray-600 mt-1">Information for food banks and pantries</p>
          </Link>
          <Link 
            href="#accessibility"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-blue-600">Accessibility</h3>
            <p className="text-sm text-gray-600 mt-1">Learn about our accessibility features</p>
          </Link>
          <Link 
            href="#safety-tips"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-blue-600">Safety Tips</h3>
            <p className="text-sm text-gray-600 mt-1">Important safety guidelines and your rights</p>
          </Link>
          <Link 
            href="#technical"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-blue-600">Technical Support</h3>
            <p className="text-sm text-gray-600 mt-1">Get help with technical issues</p>
          </Link>
        </div>
      </section>

      {/* Finding Food Section */}
      <section id="finding-food" className="mb-12 scroll-mt-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Finding Food Assistance</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I find food assistance near me?</h3>
            <p className="text-gray-600 mb-4">You can find food assistance in two easy ways:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Enter your ZIP code in the search bar</li>
              <li>Click "Use My Location" to find resources nearby</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What do the different status indicators mean?</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-success-green mr-2"></span>
                <span className="font-medium text-success-green">Open</span>
                <span className="text-gray-600 ml-2">- Currently serving and accepting visitors</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-warning-amber mr-2"></span>
                <span className="font-medium text-warning-amber">Limited</span>
                <span className="text-gray-600 ml-2">- Resources available but may be restricted</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-alert-red mr-2"></span>
                <span className="font-medium text-alert-red">Closed</span>
                <span className="text-gray-600 ml-2">- Not currently serving or temporarily closed</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What information will I need?</h3>
            <p className="text-gray-600 mb-2">Most locations only require basic information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>ZIP code or current location</li>
              <li>Number of people needing assistance (optional)</li>
              <li>Some locations may require ID (check location details)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section id="providers" className="mb-12 scroll-mt-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">For Service Providers</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I register my organization?</h3>
            <p className="text-gray-600 mb-4">To register as a service provider:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click "Register as Provider" in the navigation</li>
              <li>Fill out the organization details form</li>
              <li>Verify your email address</li>
              <li>Complete the verification process</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How do I update our status?</h3>
            <p className="text-gray-600 mb-4">You can update your location's status in several ways:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Through the provider dashboard</li>
              <li>Using our mobile app</li>
              <li>Via SMS updates (if enabled)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="mb-12 scroll-mt-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Accessibility</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What accessibility features are available?</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Screen reader compatibility</li>
              <li>Keyboard navigation support</li>
              <li>High contrast mode</li>
              <li>Text size adjustment</li>
              <li>Alternative text for images</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Language Support</h3>
            <p className="text-gray-600 mb-2">Our platform is available in:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>English</li>
              <li>Spanish (Español)</li>
              <li>More languages coming soon</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Safety Tips Section */}
      <section id="safety-tips" className="mb-12 scroll-mt-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Safety Tips</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Your Safety Comes First</h3>
            <p className="text-blue-800">
              We want you to feel safe and secure when seeking food assistance. These tips can help you have a positive experience.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Before You Go</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Check the location's current status and hours</li>
              <li>Call ahead if possible to confirm availability</li>
              <li>Bring required documentation (if listed)</li>
              <li>Let someone know where you're going and when you plan to return</li>
              <li>Plan your transportation and route in advance</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">At the Location</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Follow all posted guidelines and staff instructions</li>
              <li>Be respectful to staff and other visitors</li>
              <li>Keep personal belongings secure</li>
              <li>Stay with children at all times</li>
              <li>If you feel unsafe, trust your instincts and leave</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Food Safety</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Check expiration dates on perishable items</li>
              <li>Store food properly after pickup</li>
              <li>Don't take damaged or spoiled items</li>
              <li>Report any food safety concerns to staff</li>
              <li>Follow safe food handling practices at home</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Digital Safety</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Use secure networks when accessing our platform</li>
              <li>Don't share your login credentials with others</li>
              <li>Be cautious about sharing personal information online</li>
              <li>Report suspicious activity or inappropriate content</li>
              <li>Keep your device and browser updated</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Know Your Rights</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>You have the right to be treated with dignity and respect</li>
              <li>Services should be provided without discrimination</li>
              <li>You shouldn't be required to participate in religious activities</li>
              <li>Your personal information should be kept confidential</li>
              <li>You can report concerns to location management or our support team</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <h3 className="text-lg font-medium text-red-900 mb-3">If You Experience Problems</h3>
            <div className="space-y-3 text-red-800">
              <p>If you experience discrimination, unsafe conditions, or other problems:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Document the incident (date, time, location, people involved)</li>
                <li>Report to the location manager or supervisor</li>
                <li>Contact our support team at support@feedfind.org</li>
                <li>For emergencies, contact local authorities immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Support Section */}
      <section id="technical" className="mb-12 scroll-mt-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Technical Support</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Having technical issues?</h3>
            <p className="text-gray-600 mb-4">If you're experiencing technical difficulties:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Try refreshing the page</li>
              <li>Contact support if issues persist</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Support</h3>
            <p className="text-gray-600 mb-4">Need additional help? Our support team is available:</p>
            <div className="space-y-2 text-gray-600">
              <p>Email: support@feedfind.org</p>
              <p>Phone: (555) 123-FEED</p>
              <p>Hours: Monday-Friday, 9am-5pm EST</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Notice */}
      <div className="bg-alert-red bg-opacity-10 border border-alert-red border-opacity-20 rounded-lg p-6">
        <h2 className="text-lg font-medium text-alert-red mb-2">Need Immediate Assistance?</h2>
        <p className="text-gray-800">
          If you need immediate food assistance, call 211 to connect with emergency food services in your area.
          This service is available 24/7 and can help connect you with resources right away.
        </p>
      </div>
    </div>

      {/* Footer Ad */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <FooterAd />
      </div>

      {/* Site Footer */}
      <Footer />
  </main>
  )
} 