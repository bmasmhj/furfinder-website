import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/marketing/MarketingPrimitives'
import { privacyEmail, privacySections } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Privacy Policy - The Fur Finder',
  description: 'Privacy policy for The Fur Finder.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <div className="border-b border-border">
          <LegalPageLayout
            title="The Fur Finder Privacy Policy"
            subtitle="Your privacy matters to us"
            meta="Effective date: June 11, 2026 | Version 2.0"
          >
            <div className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Data Protection Compliant
            </div>
            <p className="text-[15px] leading-8 text-muted-foreground">
              The Fur Finder is committed to protecting personal information and your privacy. We comply with all applicable privacy laws and regulations. Your trust is essential to our mission.
            </p>
            {privacySections.map((section) => (
              <LegalSection key={section.title} title={section.title} body={section.body} />
            ))}
            <LegalSection
              title="12. Contact Us"
              body={`If you have questions, a complaint, or want to exercise a privacy right, email ${privacyEmail}. You may also use our Support page or Account Deletion page. We may verify your identity before acting on a request.`}
            />
            <div className="flex flex-wrap gap-3">
              <Link className="font-semibold text-primary hover:underline" href="/support">Support</Link>
              <Link className="font-semibold text-primary hover:underline" href="/delete-account">Delete Account</Link>
              <Link className="font-semibold text-primary hover:underline" href="/terms-of-use">Terms of Use</Link>
            </div>
          </LegalPageLayout>
        </div>

        <section className="mx-auto max-w-4xl px-6 py-12 md:px-8">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h3 className="mb-3 text-xl font-bold text-foreground">Questions about Privacy?</h3>
            <p className="mb-4 text-muted-foreground">
              If you have any concerns about your personal information or our privacy practices, we&apos;re here to help.
            </p>
            <a
              href={`mailto:${privacyEmail}?subject=Privacy%20Inquiry`}
              className="inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e55a3a]"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
