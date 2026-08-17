import type { Metadata } from "next";
import Link from "next/link";
import { partnershipsEmail } from "@/components/marketing/site-content";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";

export const metadata: Metadata = {
  title: "Manage Ads - The Fur Finder",
  description:
    "Support and campaign-management information for existing The Fur Finder advertisers.",
};

export default function ManageAdsPage() {
  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <Reveal as="h1" className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
            Existing campaign support
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-4 max-w-xl font-body text-[16px] leading-relaxed text-forest/75">
            Self-service campaign management and ad purchasing are not available on this page or inside the iOS app. Existing advertisers can log in to the partner platform, or request changes from the partnerships team.
          </Reveal>
          <Reveal delay={120} className="mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <a
                href="https://partners.thefurfinder.com/partner/login"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-3.5 font-body text-[15px] font-bold text-forest"
              >
                Log in to partner platform
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={`mailto:${partnershipsEmail}?subject=Existing%20Campaign%20Support`}
                className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-forest/15 px-7 py-3.5 font-body text-[15px] font-bold text-forest transition-colors hover:border-forest/35"
              >
                Email campaign support
              </a>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-[20px] border-[1.5px] border-forest/15 bg-card p-7 md:p-8">
          <h2 className="font-display text-[19px] italic text-forest">Campaign controls</h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-forest/75">
            Changes remain subject to the written campaign agreement. Updated advertiser destinations must be valid public https:// links and may be re-reviewed before publication. We can pause or remove misleading, malicious, unsafe, or non-compliant creative and links.
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-forest/75">
            Report a suspicious destination or advertiser through Support. Performance metrics are estimates based on available event data and are not guarantees of clicks, leads, sales, or other outcomes.
          </p>
          <Link
            href="/support"
            className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text"
          >
            Report a destination
          </Link>
        </div>
      </section>
    </div>
  );
}
