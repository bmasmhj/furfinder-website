import type { Metadata } from 'next'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import { LegalPageLayout, LegalSection } from '@/components/marketing/MarketingPrimitives'
import { privacySections, supportEmail } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Privacy Policy - The Fur Finder',
  description: 'Privacy policy for The Fur Finder.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <LegalPageLayout
        title="The Fur Finder Privacy Policy"
        subtitle="Your privacy matters to us"
        meta="Last updated: February 2026 | Version 1.0"
      >
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2 text-sm font-semibold text-[#059669]">
          Australian Privacy Act Compliant
        </div>
        <p className="text-[15px] leading-8 text-[#4a4a6a]">
          The Fur Finder is committed to protecting personal information in line with the Australian Privacy Act 1988 and the Australian Privacy Principles. This page adapts the template content into the Next.js site while preserving the same intent.
        </p>
        {privacySections.map((section) => (
          <LegalSection key={section.title} title={section.title} body={section.body} />
        ))}
        <LegalSection
          title="6. Contact Us"
          body={`If you have questions about this policy or want to exercise your privacy rights, contact us at:\n\nEmail: ${supportEmail}`}
        />
      </LegalPageLayout>
    </div>
  )
}
