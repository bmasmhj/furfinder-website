import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/marketing/MarketingPrimitives'
import { termsSections, supportEmail } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Terms of Use - The Fur Finder',
  description: 'Terms of use for The Fur Finder.',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalPageLayout
        tone="teal"
        title="The Fur Finder Terms of Use"
        subtitle="Please read these terms carefully"
        meta="Effective date: June 11, 2026 | Version 2.0"
      >
        {termsSections.map((section) => (
          <LegalSection key={section.title} title={section.title} body={section.body} />
        ))}
        <LegalSection title="13. Contact" body={`For questions or reports about these terms, contact ${supportEmail}.`} />
        <div className="flex flex-wrap gap-3">
          <Link className="font-semibold text-primary hover:underline" href="/privacy-policy">Privacy Policy</Link>
          <Link className="font-semibold text-primary hover:underline" href="/support">Support</Link>
          <Link className="font-semibold text-primary hover:underline" href="/safety-tips">Safety Tips</Link>
        </div>
      </LegalPageLayout>
    </div>
  )
}
