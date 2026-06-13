import type { Metadata } from "next";
import Link from "next/link";
import { partnershipsEmail } from "@/components/marketing/site-content";

export const metadata: Metadata = {
  title: "Manage Ads - The Fur Finder",
  description:
    "Support and campaign-management information for existing The Fur Finder advertisers.",
};

export default function ManageAdsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-blue-50/40 px-6 py-24 text-center dark:to-blue-950/10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex rounded-full bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          Manage Ads
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.05em] text-foreground md:text-6xl">
          Existing campaign support
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
          Self-service campaign management and ad purchasing are not available on this page or inside the iOS app. Existing advertisers can request creative, destination, schedule, billing, or cancellation changes from the partnerships team.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Include your business name and campaign reference when emailing{" "}
          <a className="font-semibold text-primary hover:underline" href={`mailto:${partnershipsEmail}`}>
            {partnershipsEmail}
          </a>
          .
        </p>
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 text-left">
          <h2 className="text-lg font-bold text-foreground">Campaign controls</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Changes remain subject to the written campaign agreement. Updated advertiser destinations must be valid public https:// links and may be re-reviewed before publication. We can pause or remove misleading, malicious, unsafe, or non-compliant creative and links.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Report a suspicious destination or advertiser through Support. Performance metrics are estimates based on available event data and are not guarantees of clicks, leads, sales, or other outcomes.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${partnershipsEmail}?subject=Existing%20Campaign%20Support`}
            className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
          >
            Email campaign support
          </a>
          <Link
            href="/support"
            className="inline-flex rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Report a destination
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
