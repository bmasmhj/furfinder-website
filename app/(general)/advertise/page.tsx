import type { Metadata } from "next";
import Link from "next/link";
import { partnershipsEmail } from "@/components/marketing/site-content";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";

export const metadata: Metadata = {
  title: "Advertise - The Fur Finder",
  description:
    "Advertising enquiries, pricing approach, campaign terms, and content standards for The Fur Finder.",
};

const cards = [
  {
    title: "Pricing",
    body: "Pricing is custom quoted based on placement, duration, audience, creative work, and campaign scope. There is no published fixed price and no charge until both parties accept a written insertion order or campaign agreement showing all fees, dates, and cancellation terms.",
  },
  {
    title: "Campaign terms",
    body: "Proposals identify the campaign period, placement, budget, deliverables, invoicing, cancellation rules, and any make-good terms. Impressions, clicks, leads, sales, reunions, or other performance outcomes are not guaranteed.",
  },
  {
    title: "Content and links",
    body: "Creative, claims, targeting, and destination links are moderated. Links must use a valid public https:// address. Misleading claims, unsafe products, malware, deceptive redirects, and prohibited content are rejected or removed.",
  },
  {
    title: "iOS availability",
    body: "Ad purchasing and campaign management are not available inside the iOS app. The app does not redirect iOS users into an external digital-purchase flow. Advertiser enquiries on this website are business-to-business requests reviewed by our team.",
  },
];

export default function AdvertisePage() {
  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <Reveal as="h1" className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
            Advertising enquiries
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-4 max-w-xl font-body text-[16px] leading-relaxed text-forest/75">
            Self-service ad purchasing is not available. Eligible businesses and organisations can request a reviewed campaign proposal through our partner platform.
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={(i % 4) * 60} className="rounded-[20px] border-[1.5px] border-forest/15 bg-card p-7">
              <h2 className="font-display text-[19px] italic text-forest">{card.title}</h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-forest/75">{card.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-forest/10 bg-forest px-6 py-16 text-center text-cream md:py-20">
        <Reveal as="h2" className="font-display text-[26px] italic tracking-[-0.01em] max-md:text-[22px]">
          Become an advertising partner
        </Reveal>
        <Reveal delay={60} className="mx-auto mt-2 max-w-[46ch] font-body text-[15px] leading-relaxed text-cream/65">
          Advertisers join through our partner platform, where campaigns are reviewed before anything goes live.
        </Reveal>
        <Reveal delay={120} className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <a
              href="https://partners.thefurfinder.com/partner/signup"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-3.5 font-body text-[15px] font-bold text-forest"
            >
              Request a campaign quote
            </a>
          </Magnetic>
          <Magnetic>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-cream/25 px-7 py-3.5 font-body text-[15px] font-bold text-cream transition-colors hover:border-cream/50"
            >
              Report an advertiser or link
            </Link>
          </Magnetic>
        </Reveal>
        <Reveal delay={160} className="mt-6 font-body text-[13px] text-cream/60">
          Or email{" "}
          <a href={`mailto:${partnershipsEmail}?subject=Advertising%20Enquiry`} className="underline decoration-cream/40 decoration-2 underline-offset-4 hover:text-cream">
            {partnershipsEmail}
          </a>
        </Reveal>
      </section>
    </div>
  );
}
