import type { Metadata } from 'next'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import { MarketingSection } from '@/components/marketing/MarketingPrimitives'
import { faqItems, supportEmail } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Contact - The Fur Finder',
  description: 'Get in touch with The Fur Finder team for support, partnerships, or account help.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a2e]">
      <main>
        <section className="bg-[linear-gradient(180deg,#fff_0%,#f0fdfc_100%)] px-6 py-20 text-center md:px-8">
          <span className="inline-flex rounded-full bg-[#e8f8f7] px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2cbcb6]">
            Contact
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">Get in touch with the team.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#6b7280]">
            Whether you need support, want to discuss a partnership, or have feedback on the product, this is the best place to start.
          </p>
        </section>

        <MarketingSection title="How we can help" description="The original support page content has been refocused into clear contact paths instead of a placeholder form.">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Support',
                body: 'Questions about reports, matching, accounts, or subscriptions.',
              },
              {
                title: 'Partnerships',
                body: 'For vets, shelters, rescues, and organisations interested in joining the directory.',
              },
              {
                title: 'Privacy & Data',
                body: 'For deletion requests, privacy concerns, and legal policy questions.',
              },
            ].map((card) => (
              <article key={card.title} className="rounded-3xl border border-[#e5e7eb] bg-white p-8">
                <h2 className="text-xl font-bold text-[#1a1a2e]">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#6b7280]">{card.body}</p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="mt-6 inline-flex rounded-xl bg-[#ff6b4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
                >
                  {supportEmail}
                </a>
              </article>
            ))}
          </div>
        </MarketingSection>

        <section className="border-y border-[#f3f4f6] bg-[#f9fafb]">
          <MarketingSection eyebrow="FAQ" title="Popular questions" description="A few of the questions we hear most often." centered>
            <div className="mx-auto max-w-4xl space-y-3">
              {faqItems.slice(0, 4).map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-5">
                  <h3 className="text-base font-semibold text-[#1a1a2e]">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-8 text-[#6b7280]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </MarketingSection>
        </section>
      </main>
    </div>
  )
}
