import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { MarketingSection } from "@/components/marketing/MarketingPrimitives";
import { supportEmail } from "@/components/marketing/site-content";

export const metadata: Metadata = {
  title: "Support - The Fur Finder",
  description: "Contact The Fur Finder for account, safety, billing, privacy, and app support.",
};

const supportLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/faq", label: "FAQ" },
  { href: "/delete-account", label: "Account deletion" },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-gradient-to-b from-background to-teal-50/50 px-6 py-20 text-center dark:to-teal-950/10 md:px-8">
        <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
          Support
        </span>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
          How can we help?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          Contact us about accounts, subscriptions, purchases, reports, moderation, privacy, safety, or technical issues.
        </p>
        <a
          href={`mailto:${supportEmail}?subject=The%20Fur%20Finder%20Support`}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
        >
          <Mail className="h-4 w-4" />
          {supportEmail}
        </a>
      </section>

      <MarketingSection
        title="Response expectations"
        description="Include the email on your account, device platform, app version, and a short description. Do not send passwords, full payment-card details, or unnecessary medical information."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card p-8">
            <h2 className="text-xl font-bold">Standard support</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              We aim to acknowledge standard requests within 2 business days. Complex account, purchase, privacy, or moderation reviews may take longer, and we will provide an update when possible.
            </p>
          </section>
          <section className="rounded-3xl border border-border bg-card p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Urgent safety
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The Fur Finder is not an emergency service. Contact local emergency services, police, council, or an emergency veterinarian first when a person or animal is in immediate danger, then report the user or content to us.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {supportLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </MarketingSection>
    </main>
  );
}
