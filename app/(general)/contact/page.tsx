import type { Metadata } from 'next'
import Link from 'next/link'
import {
  faqItems,
  partnershipsEmail,
  privacyEmail,
  supportEmail,
} from '@/components/marketing/site-content'
import Reveal from '@/components/marketing/Reveal'

export const metadata: Metadata = {
  title: 'Contact - The Fur Finder',
  description: 'Get in touch with The Fur Finder team for support, partnerships, or account help.',
}

const cards = [
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
]

export default function ContactPage() {
  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <Reveal as="h1" className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
            Get in touch with the team.
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-4 max-w-xl font-body text-[16px] leading-relaxed text-forest/75">
            Whether you need support, want to discuss a partnership, or have feedback on the product, this is the best place to start.
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal as="h2" className="text-center font-display text-[26px] italic text-forest max-md:text-[22px]">
            How we can help
          </Reveal>
          <Reveal delay={40} className="mx-auto mb-12 mt-3 max-w-lg text-center font-body text-[14.5px] text-forest/70">
            Use the path that best matches your request so the right team can respond faster.
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card, i) => (
              <Reveal key={card.title} delay={i * 60} className="flex flex-col rounded-[20px] border-[1.5px] border-forest/15 bg-card p-7">
                <h3 className="font-display text-[19px] italic text-forest">{card.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-forest/75">{card.body}</p>
                {card.href ? (
                  <div className="mt-6 space-y-2">
                    <Link
                      href={card.href}
                      className="inline-flex rounded-xl bg-amber px-5 py-3 font-body text-sm font-bold text-forest"
                    >
                      {card.cta}
                    </Link>
                    <p className="font-body text-xs text-forest/75">
                      Or email <a className="font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text" href={`mailto:${card.email}`}>{card.email}</a>
                    </p>
                  </div>
                ) : (
                  <a
                    href={`mailto:${card.email}`}
                    className="mt-6 inline-flex rounded-xl bg-amber px-5 py-3 font-body text-sm font-bold text-forest"
                  >
                    {card.email}
                  </a>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-forest/10 bg-muted/60 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal as="h2" className="text-center font-display text-[26px] italic text-forest max-md:text-[22px]">
            Popular questions
          </Reveal>
          <Reveal delay={40} className="mx-auto mb-10 mt-3 max-w-lg text-center font-body text-[14.5px] text-forest/70">
            A few of the questions we hear most often.
          </Reveal>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqItems.slice(0, 4).map((faq, i) => (
              <Reveal key={faq.question} delay={i * 40} className="rounded-2xl border-[1.5px] border-forest/15 bg-card px-6 py-5">
                <h3 className="font-body text-[15px] font-semibold text-forest">{faq.question}</h3>
                <p className="mt-3 font-body text-sm leading-8 text-forest/75">{faq.answer}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
