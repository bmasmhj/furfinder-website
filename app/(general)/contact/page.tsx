import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSection } from '@/components/marketing/MarketingPrimitives'
import {
  faqItems,
  partnershipsEmail,
  privacyEmail,
  supportEmail,
} from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Contact - The Fur Finder',
  description: 'Get in touch with The Fur Finder team for support, partnerships, or account help.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="bg-gradient-to-b from-background to-teal-50/50 px-6 py-20 text-center dark:to-teal-950/10 md:px-8">
          <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
            Contact
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] text-foreground md:text-6xl">Get in touch with the team.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            Whether you need support, want to discuss a partnership, or have feedback on the product, this is the best place to start.
          </p>
        </section>

        <MarketingSection
          title="How we can help"
          description="Use the path that best matches your request so the right team can respond faster."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Support',
                body: 'Questions about reports, matching, accounts, subscriptions, or app access.',
                email: supportEmail,
              },
              {
                title: 'Partnerships',
                body: 'For vets, shelters, rescues, and organisations joining our directory or partner network.',
                email: partnershipsEmail,
                href: 'https://partners.thefurfinder.com/partner/signup',
                cta: 'Start partner intake',
              },
              {
                title: 'Privacy & Data',
                body: 'For deletion requests, privacy concerns, and policy-related questions.',
                email: privacyEmail,
              },
            ].map((card) => (
              <article key={card.title} className="rounded-3xl border border-border bg-card p-8">
                <h2 className="text-xl font-bold text-foreground">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.body}</p>
                {card.href ? (
                  <div className="mt-6 space-y-2">
                    <Link
                      href={card.href}
                      className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
                    >
                      {card.cta}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Or email <a className="font-semibold text-primary hover:underline" href={`mailto:${card.email}`}>{card.email}</a>
                    </p>
                  </div>
                ) : (
                  <a
                    href={`mailto:${card.email}`}
                    className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
                  >
                    {card.email}
                  </a>
                )}
              </article>
            ))}
          </div>
        </MarketingSection>

        <section className="border-y border-border bg-muted/50">
          <MarketingSection eyebrow="FAQ" title="Popular questions" description="A few of the questions we hear most often." centered>
            <div className="mx-auto max-w-4xl space-y-3">
              {faqItems.slice(0, 4).map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-border bg-card px-6 py-5">
                  <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-8 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </MarketingSection>
        </section>
      </main>
    </div>
  )
}
