import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/marketing/Header';
import Footer from '@//components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Pet Reunite AI - Reunite Lost Pets with AI-Powered Matching',
  description: 'Find your lost pet using advanced AI matching technology. Report lost or found pets and connect with other pet owners in your community.',
  keywords: 'lost pet, found pet, pet search, AI matching, pet reunion, lost dog, lost cat',
  openGraph: {
    title: 'Pet Reunite AI - Reunite Lost Pets',
    description: 'Find your lost pet using advanced AI matching technology.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-50 to-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-6 text-pretty">
              Reunite with Your Beloved Pet
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto text-balance">
              Advanced AI technology helps reconnect lost pets with their families. Report lost or found pets and let our intelligent matching system work to bring them home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-block rounded-full bg-brand-600 px-8 py-3 text-lg font-semibold text-white hover:bg-brand-700 transition">
                Get Started for Free
              </Link>
              <Link href="#how-it-works" className="inline-block rounded-full border-2 border-brand-600 px-8 py-3 text-lg font-semibold text-brand-600 hover:bg-brand-50 transition">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">10K+</div>
                <p className="text-neutral-600">Pets Reunited</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">95%</div>
                <p className="text-neutral-600">Match Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-600 mb-2">24/7</div>
                <p className="text-neutral-600">Active Matching</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-brand-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Report Your Pet</h3>
                <p className="text-neutral-600">Upload photos and details about your lost or found pet. Our system captures breed, color, location, and distinctive features.</p>
              </div>

              <div className="bg-white p-8 rounded-xl border border-brand-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">AI Matching</h3>
                <p className="text-neutral-600">Our advanced AI analyzes photos and details to find potential matches in our network of reported pets.</p>
              </div>

              <div className="bg-white p-8 rounded-xl border border-brand-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Connect & Reunite</h3>
                <p className="text-neutral-600">Get notifications of potential matches and connect directly with other pet owners to arrange reunion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-neutral-900 mb-12 text-center">Why Pet Owners Trust Us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                    <span className="text-xl">🔒</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Your Data is Safe</h3>
                  <p className="text-neutral-600">We use enterprise-grade encryption to protect your pet&apos;s information and personal data.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                    <span className="text-xl">⚡</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Real-Time Matching</h3>
                  <p className="text-neutral-600">Our AI works around the clock to find matches within hours, not days.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                    <span className="text-xl">👥</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Community Support</h3>
                  <p className="text-neutral-600">Join thousands of pet owners helping each other find their beloved companions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                    <span className="text-xl">✨</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Success Stories</h3>
                  <p className="text-neutral-600">95% of pets reported through our platform are successfully reunited with their families.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6">Start Your Pet&apos;s Journey Home</h2>
            <p className="text-xl mb-8 text-brand-100">
              Every moment counts. Report your lost pet today and let our AI help bring them home.
            </p>
            <Link href="/signup" className="inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-brand-600 hover:bg-brand-50 transition">
              Create Your Account Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
