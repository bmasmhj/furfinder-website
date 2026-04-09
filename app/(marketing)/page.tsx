import { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pet Reunite AI - Reunite Lost Pets with AI Matching',
  description: 'Using advanced AI to match lost and found pets. Fast, accurate, and trusted by thousands of pet owners.',
  openGraph: {
    title: 'Pet Reunite AI - Reunite Lost Pets with AI Matching',
    description: 'Using advanced AI to match lost and found pets. Fast, accurate, and trusted by thousands of pet owners.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-background to-muted">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-input bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  AI-Powered Matching Technology
                </div>

                <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                  Reunite Lost Pets Faster
                </h1>

                <p className="text-xl text-muted-foreground">
                  Advanced AI matching technology connects lost and found pets instantly. No more endless searching—reunite families in minutes, not weeks.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild size="lg" className="text-base h-12">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base h-12">
                    <Link href="#how-it-works">See How It Works</Link>
                  </Button>
                </div>

                <div className="flex flex-col gap-3 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Success rate: 94% reunions within 48 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Trusted by 50,000+ pet owners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Free for the first 30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent rounded-2xl blur-3xl"></div>
              <div className="relative bg-card border border-input rounded-2xl p-8 shadow-lg">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🐾</div>
                    <p className="text-sm text-muted-foreground">AI Matching Dashboard</p>
                    <p className="text-2xl font-bold text-foreground mt-2">94% Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-card border-y border-input py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">TRUSTED BY PET OWNERS WORLDWIDE</p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 items-center justify-items-center">
            <div className="text-2xl font-bold text-foreground">50K+</div>
            <div className="text-2xl font-bold text-foreground">94%</div>
            <div className="text-2xl font-bold text-foreground">48hrs</div>
            <div className="text-2xl font-bold text-foreground">24/7</div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 items-center justify-items-center mt-2">
            <div className="text-xs text-muted-foreground text-center">Pet Owners</div>
            <div className="text-xs text-muted-foreground text-center">Success Rate</div>
            <div className="text-xs text-muted-foreground text-center">Avg. Reunion</div>
            <div className="text-xs text-muted-foreground text-center">Support</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How Pet Reunite AI Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to reunite your pet with your family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Report Lost/Found',
                description: 'Upload a photo and details of your lost or found pet in seconds'
              },
              {
                step: '2',
                title: 'AI Analysis',
                description: 'Our advanced AI analyzes the photo and matches it with reports in the database'
              },
              {
                step: '3',
                title: 'Instant Reunion',
                description: 'Get connected with pet owners through our secure messaging platform'
              }
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                  <span className="text-lg font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-input py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Help Reunite Pets Today</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of pet owners using Pet Reunite AI. Start free—no credit card required.
          </p>
          <Button asChild size="lg" className="text-base h-12">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
