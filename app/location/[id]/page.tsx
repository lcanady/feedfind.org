import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLocationById } from '@/lib/databaseService'
import { Location } from '@/types/database'
import { Clock, MapPin, Phone, Globe, Users, Calendar } from 'lucide-react'
import Header from '@/components/layout/Header'
import { FooterAd, HeaderAd, SidebarAd } from '@/components/ui/AdSense'

interface LocationPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const location = await getLocationById(resolvedParams.id)
    if (!location) {
      return {
        title: 'Location Not Found - FeedFind.org'
      }
    }

    return {
      title: `${location.name} - FeedFind.org`,
      description: location.description || `Food assistance at ${location.name} in ${location.address}`
    }
  } catch (error) {
    return {
      title: 'Location Not Found - FeedFind.org'
    }
  }
}

export default async function LocationPage({ params }: LocationPageProps) {
  let location: Location | null = null
  
  try {
    const resolvedParams = await params
    location = await getLocationById(resolvedParams.id)
  } catch (error) {
    console.error('Error fetching location:', error)
  }

  if (!location) {
    notFound()
  }

  const isOpen = location.currentStatus === 'open'
  const statusColor = isOpen ? 'text-green-600' : 'text-red-600'
  const statusBg = isOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header Ad */}
          <div className="mb-6">
            <HeaderAd />
          </div>

          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {location.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{location.address}</span>
                </div>
                {location.description && (
                  <p className="text-gray-700 mb-4">{location.description}</p>
                )}
              </div>
              
              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-lg border ${statusBg}`}>
                <div className="flex items-center">
                  <Clock className={`h-5 w-5 mr-2 ${statusColor}`} />
                  <span className={`font-semibold ${statusColor}`}>
                    {isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact & Hours */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact & Hours
              </h2>
              
              <div className="space-y-4">
                {location.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <a 
                      href={`tel:${location.phone}`}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {location.phone}
                    </a>
                  </div>
                )}
                
                {location.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3" />
                    <a 
                      href={location.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                               {location.operatingHours && (
                   <div>
                     <div className="flex items-center mb-2">
                       <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                       <span className="font-medium text-gray-900">Operating Hours</span>
                     </div>
                     <div className="ml-8 text-gray-600">
                       Contact location for current hours
                     </div>
                   </div>
                 )}
              </div>
            </div>

            {/* Services & Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Services & Requirements
              </h2>
              
              <div className="space-y-4">
                {location.services && location.services.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-900">Services:</span>
                    <div className="ml-2 text-gray-600">
                      {location.services.join(', ')}
                    </div>
                  </div>
                )}

                {location.eligibilityRequirements && location.eligibilityRequirements.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-900 block mb-2">Eligibility Requirements:</span>
                    <ul className="ml-6 text-gray-600 space-y-1">
                      {location.eligibilityRequirements.map((req: string, index: number) => (
                        <li key={index} className="list-disc">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {location.capacity && (
                  <div>
                    <span className="font-medium text-gray-900">Capacity:</span>
                    <span className="ml-2 text-gray-600">{location.capacity} people</span>
                  </div>
                )}

                {location.accessibilityFeatures && location.accessibilityFeatures.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-900 block mb-2">Accessibility Features:</span>
                    <div className="ml-2 text-gray-600">
                      {location.accessibilityFeatures.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mid-page Ad */}
          <div className="my-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
              <SidebarAd />
            </div>
          </div>

          {/* Additional Information */}
          {location.adminNotes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Information
              </h2>
              <p className="text-gray-700">{location.adminNotes}</p>
            </div>
          )}

          {/* Map Section (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Location Map
            </h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive map coming soon</p>
                <p className="text-sm">{location.address}</p>
              </div>
            </div>
          </div>

          {/* Back to Main Page */}
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Back to Search
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
            <p>© 2024 feedfind.org - connecting communities with food assistance resources</p>
          </div>
        </div>
      </div>
    </main>
  )
} 