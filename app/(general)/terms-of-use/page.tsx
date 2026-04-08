import type { Metadata } from 'next'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import { LegalPageLayout, LegalSection } from '@/components/marketing/MarketingPrimitives'
import { termsSections, supportEmail } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Terms of Use - The Fur Finder',
  description: 'Terms of use for The Fur Finder.',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <LegalPageLayout
        tone="teal"
        title="The Fur Finder Terms of Use"
        subtitle="Please read these terms carefully"
        meta="Last updated: February 2026 | Version 1.0"
      >
        {termsSections.map((section) => (
          <LegalSection key={section.title} title={section.title} body={section.body} />
        ))}
        <LegalSection title="6. Contact" body={`For questions about these terms, contact us at:\n\nEmail: ${supportEmail}`} />
      </LegalPageLayout>
    </div>
  )
}
