import React from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { HeaderAd } from '@/components/ui/AdSense'

export default function AboutPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">About FeedFind</h1>
          <p className="text-lg text-gray-600">Connecting communities with food assistance resources through real-time information and dignified access.</p>
        </header>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Mission</h2>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
            <p className="text-blue-900 text-lg leading-relaxed">
              FeedFind exists to eliminate the uncertainty and wasted trips that people face when seeking food assistance. 
              We believe everyone deserves access to reliable, real-time information about food resources in their community.
            </p>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Every day, millions of people across the country face food insecurity. Traditional methods of finding food assistance 
            often involve calling multiple locations, uncertain hours, and disappointing trips to closed or empty pantries.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our platform provides real-time status updates, accurate hours, and detailed information about food assistance 
            programs, making it easier for people to find the help they need when they need it.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Dignity & Respect</h3>
              <p className="text-gray-600">
                We design our platform with the understanding that seeking food assistance requires courage. 
                Every interaction is crafted to maintain user dignity and respect.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Accessibility First</h3>
              <p className="text-gray-600">
                Our platform is built to be accessible to everyone, regardless of device, internet speed, 
                or technical ability. We prioritize clear navigation and simple interfaces.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Community Collaboration</h3>
              <p className="text-gray-600">
                We work closely with food assistance providers, community organizations, and users to 
                ensure our platform meets real community needs.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600">
                We're committed to being transparent about our data sources, funding, and decision-making 
                processes. Trust is essential to our mission.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Impact</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
                <div className="text-gray-600">Successful Connections</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1,200+</div>
                <div className="text-gray-600">Partner Organizations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                <div className="text-gray-600">User Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Team</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            FeedFind is built by a diverse team of technologists, social workers, and community advocates 
            who are passionate about addressing food insecurity through technology.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our team includes people with lived experience of food insecurity, ensuring that our platform 
            is designed with authentic understanding of the challenges people face.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get Involved</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">
              We're always looking for ways to improve and expand our impact. Whether you're a food assistance provider, 
              community advocate, or someone who wants to help, there are many ways to get involved.
            </p>
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>For Providers:</strong> Register your organization to keep your information up-to-date
              </p>
              <p className="text-gray-600">
                <strong>For Volunteers:</strong> Help us verify information and support community outreach
              </p>
              <p className="text-gray-600">
                <strong>For Partners:</strong> Collaborate with us on data sharing and community initiatives
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Site Footer */}
      <Footer />
    </main>
  )
} 