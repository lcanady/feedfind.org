'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { seedCommunityData } from '@/lib/seedCommunityData'
import { useCommunityData, useForumPosts, useVolunteerOpportunities, useCommunityEvents, useCommunityResources } from '@/hooks/useCommunity'

export default function TestCommunityPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  // Community data hooks
  const { stats, recentActivity, loading: overviewLoading } = useCommunityData()
  const { posts, loading: postsLoading } = useForumPosts()
  const { opportunities, loading: opportunitiesLoading } = useVolunteerOpportunities()
  const { events, loading: eventsLoading } = useCommunityEvents()
  const { resources, loading: resourcesLoading } = useCommunityResources()

  const handleSeedData = async () => {
    setIsSeeding(true)
    setSeedResult(null)
    
    try {
      await seedCommunityData()
      setSeedResult('Community data seeded successfully!')
    } catch (error) {
      setSeedResult(`Error seeding data: ${error}`)
    } finally {
      setIsSeeding(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', data: { stats, recentActivity }, loading: overviewLoading },
    { id: 'posts', label: 'Forum Posts', data: posts, loading: postsLoading },
    { id: 'volunteers', label: 'Volunteer Ops', data: opportunities, loading: opportunitiesLoading },
    { id: 'events', label: 'Events', data: events, loading: eventsLoading },
    { id: 'resources', label: 'Resources', data: resources, loading: resourcesLoading }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Community Firebase Integration Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test real-time Firebase integration for community features. Use the seed button to populate test data.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isSeeding ? 'Seeding Data...' : 'Seed Community Data'}
            </button>
            
            {seedResult && (
              <div className={`px-4 py-2 rounded-lg ${
                seedResult.includes('Error') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {seedResult}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.loading && (
                  <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Community Stats</h2>
                {overviewLoading ? (
                  <div className="animate-pulse">Loading stats...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
                      <div className="text-sm text-gray-600">Members</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.volunteerHours}</div>
                      <div className="text-sm text-gray-600">Volunteer Hours</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalResources}</div>
                      <div className="text-sm text-gray-600">Resources Shared</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.totalEvents}</div>
                      <div className="text-sm text-gray-600">Active Events</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {overviewLoading ? (
                  <div className="animate-pulse">Loading activity...</div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-600">by {activity.author}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.date.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Forum Posts ({posts.length})</h2>
              {postsLoading ? (
                <div className="animate-pulse">Loading posts...</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{post.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Category: {post.category}</span>
                            <span>By: {post.authorName}</span>
                            <span>Likes: {post.likes}</span>
                            <span>Replies: {post.replies}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Volunteer Opportunities ({opportunities.length})</h2>
              {opportunitiesLoading ? (
                <div className="animate-pulse">Loading opportunities...</div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{opp.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Organization: {opp.organization}</span>
                            <span>Location: {opp.location}</span>
                            <span>Commitment: {opp.timeCommitment}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              opp.urgency === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {opp.urgency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Community Events ({events.length})</h2>
              {eventsLoading ? (
                <div className="animate-pulse">Loading events...</div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Date: {event.date instanceof Date ? event.date.toLocaleDateString() : event.date.toDate().toLocaleDateString()}</span>
                            <span>Location: {event.location}</span>
                            <span>Type: {event.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Community Resources ({resources.length})</h2>
              {resourcesLoading ? (
                <div className="animate-pulse">Loading resources...</div>
              ) : (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Category: {resource.category}</span>
                            <span>Type: {resource.type}</span>
                            <span>Views: {resource.views}</span>
                            <span>Likes: {resource.likes}</span>
                            <span>By: {resource.authorName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 