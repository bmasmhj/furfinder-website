import type { Metadata } from "next";
import Link from "next/link";
import { partnershipsEmail } from "@/components/marketing/site-content";

export const metadata: Metadata = {
  title: "Advertise - The Fur Finder",
  description:
    "Advertising enquiries, pricing approach, campaign terms, and content standards for The Fur Finder.",
};

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-orange-50/40 px-6 py-24 text-center dark:to-orange-950/10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex rounded-full bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">
          Advertise
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.05em] text-foreground md:text-6xl">
          Advertising enquiries
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
          Self-service ad purchasing is not available. Eligible businesses and organisations can request a reviewed campaign proposal through this website.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 text-left md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Pricing</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Pricing is custom quoted based on placement, duration, audience, creative work, and campaign scope. There is no published fixed price and no charge until both parties accept a written insertion order or campaign agreement showing all fees, dates, and cancellation terms.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Campaign terms</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Proposals identify the campaign period, placement, budget, deliverables, invoicing, cancellation rules, and any make-good terms. Impressions, clicks, leads, sales, reunions, or other performance outcomes are not guaranteed.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Content and links</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Creative, claims, targeting, and destination links are moderated. Links must use a valid public https:// address. Misleading claims, unsafe products, malware, deceptive redirects, and prohibited content are rejected or removed.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">iOS availability</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Ad purchasing and campaign management are not available inside the iOS app. The app does not redirect iOS users into an external digital-purchase flow. Advertiser enquiries on this website are business-to-business requests reviewed by our team.
            </p>
          </section>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${partnershipsEmail}?subject=Advertising%20Enquiry`}
            className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
          >
            Request a campaign quote
          </a>
          <Link
            href="/support"
            className="inline-flex rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Report an advertiser or link
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
