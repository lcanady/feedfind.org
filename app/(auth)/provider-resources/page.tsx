'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../../../components/layout/Header'
import { HeaderAd, FooterAd } from '@/components/ui/AdSense'

interface ResourceSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

interface FAQ {
  question: string
  answer: string
}

export default function ProviderResourcesPage() {
  const [activeSection, setActiveSection] = useState<string>('getting-started')
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const sections: ResourceSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Quick setup guide for new providers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'dashboard-guide',
      title: 'Dashboard Guide',
      description: 'How to use your provider dashboard effectively',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'status-updates',
      title: 'Status Updates',
      description: 'Best practices for keeping your availability current',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      description: 'Tips for maximizing your impact on the platform',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'support',
      title: 'Support & Contact',
      description: 'Get help when you need it',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  const faqs: FAQ[] = [
    {
      question: "How do I register my organization on FeedFind.org?",
      answer: "Click 'Register Your Organization' from your provider dashboard or visit the provider registration page. You'll need basic information about your organization including name, contact details, address, and services offered."
    },
    {
      question: "How long does it take for my organization to be approved?",
      answer: "Most organizations are reviewed and approved within 1-2 business days. We'll email you once your organization has been approved and is live on the platform."
    },
    {
      question: "How do I update my organization's availability status?",
      answer: "From your provider dashboard, you can update your status to Open, Closed, or Limited. You can also add notes about current food availability, estimated wait times, and special instructions."
    },
    {
      question: "Can I manage multiple locations from one account?",
      answer: "Yes! You can add multiple locations to your organization and manage their statuses independently. Each location can have its own operating hours, services, and availability updates."
    },
    {
      question: "What information should I include in status updates?",
      answer: "Include current availability (open/closed/limited), food availability, estimated wait times, any special requirements or restrictions, and temporary changes to services or hours."
    },
    {
      question: "How do I handle user reviews and feedback?",
      answer: "You can view reviews through your dashboard. We encourage responding to feedback professionally and using it to improve your services. You can flag inappropriate reviews for moderation."
    },
    {
      question: "What if I need to temporarily close or change services?",
      answer: "Update your status immediately through the dashboard. You can set temporary closures, add special notes, and update your regular operating hours as needed."
    },
    {
      question: "How can I see analytics about my listings?",
      answer: "Your provider dashboard includes analytics showing visitor counts, popular times, status update frequency, and user satisfaction ratings to help you understand your impact."
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started with FeedFind.org</h3>
              <p className="text-gray-600 mb-6">
                Welcome to FeedFind.org! This guide will help you set up your organization and start connecting with people in need of food assistance in your community.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 1: Register Your Organization</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Create your provider account and submit your organization information for review.
                </p>
                <Link 
                  href="/add-organization" 
                  className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                >
                  Start Registration →
                </Link>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 2: Wait for Approval</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Our team will review your application within 1-2 business days. You'll receive an email confirmation once approved.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 3: Set Up Your Locations</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Add your service locations, operating hours, and available services to help people find you.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 4: Keep Information Current</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Regularly update your availability status, food availability, and any changes to services or hours.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Start Checklist</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>✓ Complete organization registration form</li>
                <li>✓ Add accurate contact information and address</li>
                <li>✓ Select all services you provide</li>
                <li>✓ Set your regular operating hours</li>
                <li>✓ Upload organization logo or photo (optional)</li>
                <li>✓ Write a helpful description of your services</li>
              </ul>
            </div>
          </div>
        )

      case 'dashboard-guide':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Provider Dashboard Guide</h3>
              <p className="text-gray-600 mb-6">
                Your provider dashboard is your control center for managing your organization's presence on FeedFind.org.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Dashboard Overview</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Get a quick snapshot of your organization's activity and performance.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Total visits and user engagement</li>
                  <li>• Recent status updates and changes</li>
                  <li>• User reviews and ratings</li>
                  <li>• Quick action buttons for common tasks</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Location Management</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Add, edit, and manage all your service locations from one place.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Add new locations with addresses and coordinates</li>
                  <li>• Update location-specific information</li>
                  <li>• Set individual operating hours for each location</li>
                  <li>• Manage services offered at each location</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Status Updates</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Keep your availability information current with real-time updates.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Update status to Open, Closed, or Limited</li>
                  <li>• Add notes about food availability</li>
                  <li>• Set estimated wait times</li>
                  <li>• Bulk update multiple locations at once</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Analytics & Insights</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Track your impact and understand how people are finding your services.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• View visit counts and popular times</li>
                  <li>• Monitor user satisfaction ratings</li>
                  <li>• Track status update frequency</li>
                  <li>• Export data for reporting</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'status-updates':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Update Best Practices</h3>
              <p className="text-gray-600 mb-6">
                Keeping your availability status current is crucial for helping people avoid wasted trips and find food when they need it.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🟢 Open Status</h4>
                <p className="text-green-800 text-sm mb-2">Use when you're currently serving and have food available.</p>
                <div className="text-xs text-green-700">
                  <p><strong>Include:</strong> Current food availability, estimated wait time, any special requirements</p>
                  <p><strong>Example:</strong> "Open with fresh produce and pantry items available. No wait time. Bring ID and proof of address."</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">🟡 Limited Status</h4>
                <p className="text-yellow-800 text-sm mb-2">Use when you're open but have restrictions or limited availability.</p>
                <div className="text-xs text-yellow-700">
                  <p><strong>Include:</strong> What's limited, when normal service resumes, current wait time</p>
                  <p><strong>Example:</strong> "Limited service - pantry items only, no fresh produce. 15-minute wait expected."</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🔴 Closed Status</h4>
                <p className="text-red-800 text-sm mb-2">Use when you're not currently serving or have no food available.</p>
                <div className="text-xs text-red-700">
                  <p><strong>Include:</strong> Reason for closure, when you'll reopen, alternative resources if available</p>
                  <p><strong>Example:</strong> "Closed for restock. Reopening tomorrow at 9 AM with fresh delivery."</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Update Frequency Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="inline-block w-16 text-blue-600 font-medium">Daily:</span>
                  <span>Update at opening to confirm current status and food availability</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-16 text-blue-600 font-medium">As Needed:</span>
                  <span>When food runs out, unexpected closures, or service changes occur</span>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-16 text-blue-600 font-medium">End of Day:</span>
                  <span>Update to reflect next day's expected status if different from normal</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'best-practices':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Best Practices</h3>
              <p className="text-gray-600 mb-6">
                Maximize your impact and help more people in your community with these proven strategies.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Profile Optimization</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use a clear, recognizable organization name</li>
                  <li>• Write a comprehensive description of your services</li>
                  <li>• Include all services you offer (food pantry, hot meals, etc.)</li>
                  <li>• Add accurate contact information and website</li>
                  <li>• Upload a logo or photo to build recognition</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Communication Excellence</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use clear, respectful language in all updates</li>
                  <li>• Provide specific details about what's available</li>
                  <li>• Include wait time estimates when possible</li>
                  <li>• Mention any requirements (ID, address proof, etc.)</li>
                  <li>• Share positive news and success stories</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Community Engagement</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Respond professionally to reviews and feedback</li>
                  <li>• Thank users for positive reviews</li>
                  <li>• Address concerns constructively</li>
                  <li>• Share updates about special distributions or events</li>
                  <li>• Collaborate with other local providers</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Data and Analytics</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Review your analytics regularly to understand demand</li>
                  <li>• Track popular times to optimize staffing</li>
                  <li>• Use feedback to improve services</li>
                  <li>• Monitor status update frequency and consistency</li>
                  <li>• Export data for grant applications and reporting</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Impact Maximization Tips</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Update status at least once daily during operating hours</li>
                <li>• Use the "Limited" status instead of "Closed" when you have some resources</li>
                <li>• Provide alternative suggestions when you're closed</li>
                <li>• Cross-promote other local food assistance programs</li>
                <li>• Keep emergency contact information updated</li>
              </ul>
            </div>
          </div>
        )

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Support & Contact</h3>
              <p className="text-gray-600 mb-6">
                We're here to help you succeed on the platform. Here are the ways you can get assistance.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Having trouble with the platform? We can help with technical issues and account problems.
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer"> support@feedfind.org</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Response Time:</span>
                    <span className="text-gray-600"> Within 24 hours on business days</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Account Management</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Need help with your provider account, organization approval, or profile updates?
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer"> providers@feedfind.org</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="text-gray-600"> (555) 123-FEED (3333)</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Training & Onboarding</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Get personalized help setting up your account and training your staff.
                </p>
                <div className="space-y-2">
                  <Link 
                    href="#" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Schedule Training Session
                  </Link>
                  <p className="text-xs text-gray-500">
                    Free 30-minute sessions available for new providers
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Partnership Opportunities</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Interested in deeper collaboration or special programs?
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer"> partnerships@feedfind.org</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Emergency Support</h4>
              <p className="text-green-800 text-sm mb-2">
                For urgent issues affecting your ability to serve clients or critical platform problems:
              </p>
              <div className="text-sm text-green-700">
                <p><strong>Emergency Line:</strong> (555) 911-FEED (3333)</p>
                <p><strong>Available:</strong> 24/7 for critical issues</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Header Ad */}
      <div className="max-w-7xl mx-auto px-4">
        <HeaderAd />
      </div>

      {/* Hero Section */}
      <div className="bg-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Provider Resources</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Everything you need to successfully manage your organization on FeedFind.org and maximize your impact in the community.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Access your dashboard to manage listings, update status, and view analytics for your organization.
            </p>
            <Link 
              href="/provider" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Organization</h3>
            <p className="text-gray-600 mb-4">
              Register a new food assistance organization to help connect your community with resources.
            </p>
            <Link 
              href="/add-organization" 
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Register Organization
            </Link>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Support</h3>
            <p className="text-gray-600 mb-4">
              Contact our support team for technical help, training, or questions about using the platform.
            </p>
            <a 
              href="mailto:support@feedfind.org" 
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started Guide</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to set up your organization and start helping your community find food assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Register</h3>
              <p className="text-sm text-gray-600">
                Create your provider account and submit organization information for review.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Approved</h3>
              <p className="text-sm text-gray-600">
                Wait 1-2 business days for our team to review and approve your application.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Locations</h3>
              <p className="text-sm text-gray-600">
                Set up your service locations with hours, services, and contact information.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Current</h3>
              <p className="text-sm text-gray-600">
                Regularly update your availability status and food availability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Provider Resources</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Essential tools and information to help you make the most of the FeedFind platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Guide</h3>
            <p className="text-gray-600 mb-4">
              Learn how to use your provider dashboard to manage locations, update status, and view analytics.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Managing multiple locations</li>
              <li>• Real-time status updates</li>
              <li>• Analytics and reporting</li>
              <li>• Bulk operations</li>
            </ul>
            <Link href="/provider" className="text-blue-600 hover:underline font-medium">
              Go to Dashboard →
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Updates</h3>
            <p className="text-gray-600 mb-4">
              Best practices for keeping your availability information current and helpful.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-600">Open - Currently serving with food available</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-gray-600">Limited - Open with restrictions</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-gray-600">Closed - Not currently serving</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about using FeedFind as a provider.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === `faq-${index}` ? null : `faq-${index}`)}
                  className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50"
                  aria-expanded={openFaq === `faq-${index}`}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === `faq-${index}` ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === `faq-${index}` && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our support team is ready to help you succeed on the platform. Whether you need technical assistance, 
            training, or have questions about best practices, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@feedfind.org"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </a>
            <a
              href="tel:5551233333"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call (555) 123-FEED
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <FooterAd />
          
          <div className="grid md:grid-cols-4 gap-6 text-sm mt-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">about</h3>
              <ul className="space-y-1">
                <li><Link href="/help" className="text-blue-600 hover:underline">help & FAQ</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">safety tips</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">terms of use</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">privacy policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">providers</h3>
              <ul className="space-y-1">
                <li><Link href="/add-organization" className="text-blue-600 hover:underline">add your organization</Link></li>
                <li><Link href="/update-listing" className="text-blue-600 hover:underline">update your listing</Link></li>
                <li><Link href="/provider-resources" className="text-blue-600 hover:underline">provider resources</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">bulk posting</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">find food</h3>
              <ul className="space-y-1">
                <li><Link href="/search" className="text-blue-600 hover:underline">search locations</Link></li>
                <li><Link href="/map" className="text-blue-600 hover:underline">browse map</Link></li>
                <li><a href="#" className="text-blue-600 hover:underline">mobile app</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">text alerts</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">community</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-blue-600 hover:underline">volunteer</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">donate</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">partnerships</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">contact us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 