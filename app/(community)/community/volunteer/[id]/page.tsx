'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { useVolunteerOpportunities } from '@/hooks/useCommunity'

export default function VolunteerOpportunityPage() {
  const params = useParams()
  const opportunityId = params.id as string
  const [hasApplied, setHasApplied] = useState(false)
  
  const { opportunities, loading } = useVolunteerOpportunities()
  const opportunity = opportunities.find(o => o.id === opportunityId)

  const formatTimeAgo = (date: Date | any) => {
    if (!date) return 'Unknown'
    const actualDate = date instanceof Date ? date : date.toDate()
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks === 1) return '1 week ago'
    return `${diffInWeeks} weeks ago`
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'Urgent Need'
      case 'high':
        return 'High Priority'
      case 'normal':
        return 'Normal'
      case 'low':
        return 'Low Priority'
      default:
        return urgency
    }
  }

  const handleApply = () => {
    if (opportunity?.contactEmail) {
      const subject = `Volunteer Application: ${opportunity.title}`
      const body = `Hello,\n\nI would like to volunteer for the "${opportunity.title}" opportunity.\n\nPlease let me know the next steps.\n\nThank you!`
      window.location.href = `mailto:${opportunity.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setHasApplied(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">Loading opportunity...</div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Opportunity Not Found</h1>
            <p className="text-gray-600 mb-6">The volunteer opportunity you're looking for doesn't exist or is no longer available.</p>
            <Link href="/community/volunteer" className="text-blue-600 hover:underline">
              ← Back to Volunteer Opportunities
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/community" className="hover:text-blue-600">Community</Link>
          <span className="mx-2">/</span>
          <Link href="/community/volunteer" className="hover:text-blue-600">Volunteer Opportunities</Link>
          <span className="mx-2">/</span>
          <span>{opportunity.title}</span>
        </nav>

        {/* Opportunity Details */}
        <article className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(opportunity.urgency)}`}>
                {getUrgencyLabel(opportunity.urgency)}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                {opportunity.category.replace('_', ' ')}
              </span>
              {opportunity.isOngoing && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Ongoing Opportunity
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{opportunity.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-medium text-gray-900">{opportunity.organization}</div>
                  <div className="text-sm text-gray-500">
                    Posted {formatTimeAgo(opportunity.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {opportunity.spotsTotal && (
                  <div className="text-sm text-gray-500">
                    {opportunity.spotsAvailable || 0} of {opportunity.spotsTotal} spots available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Location</div>
                  <div className="text-gray-600">{opportunity.location}</div>
                  {opportunity.isRemote && (
                    <div className="text-sm text-green-600">Remote opportunity available</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Time Commitment</div>
                  <div className="text-gray-600">{opportunity.timeCommitment}</div>
                  {opportunity.schedule && (
                    <div className="text-sm text-gray-500">{opportunity.schedule}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a3 3 0 110-6 3 3 0 010 6zm-7 4a7 7 0 1114 0H3z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Requirements</div>
                  <div className="text-gray-600">
                    {opportunity.backgroundCheckRequired && (
                      <div className="text-sm">Background check required</div>
                    )}
                    {opportunity.trainingRequired && (
                      <div className="text-sm">Training provided</div>
                    )}
                    {opportunity.ageRestriction && (
                      <div className="text-sm">Age requirement: {opportunity.ageRestriction}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Contact</div>
                  <div className="text-gray-600">{opportunity.contactEmail}</div>
                  {opportunity.contactPhone && (
                    <div className="text-gray-600">{opportunity.contactPhone}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Opportunity</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </div>

          {/* Skills & Requirements */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Qualifications</h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {opportunity.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Make a Difference?</h3>
                <p className="text-gray-600">
                  Join our community of volunteers helping fight food insecurity.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {!hasApplied ? (
                  <>
                    <button
                      onClick={handleApply}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Apply Now
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Save
                    </button>
                  </>
                ) : (
                  <div className="text-green-600 font-medium">
                    ✓ Application sent! They'll contact you soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Opportunities */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">More Opportunities</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {opportunities
              .filter(opp => opp.id !== opportunity.id && opp.organization === opportunity.organization)
              .slice(0, 2)
              .map((relatedOpp) => (
                <Link 
                  key={relatedOpp.id} 
                  href={`/community/volunteer/${relatedOpp.id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-gray-900 mb-2">{relatedOpp.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{relatedOpp.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{relatedOpp.timeCommitment}</span>
                    <span className={`px-2 py-1 rounded-full ${getUrgencyColor(relatedOpp.urgency)}`}>
                      {getUrgencyLabel(relatedOpp.urgency)}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
          {opportunities.filter(opp => opp.id !== opportunity.id).length === 0 && (
            <p className="text-gray-500 text-center py-4">No other opportunities available at this time.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
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
                <li><a href="#" className="text-blue-600 hover:underline">donate to local organizations</a></li>
                <li><Link href="/community/forums" className="text-blue-600 hover:underline">community forums</Link></li>
                <li><Link href="/community/resources" className="text-blue-600 hover:underline">resource guides</Link></li>
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
            <p>© 2025 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </div>
  )
} 