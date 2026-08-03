import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { supportEmail } from "@/components/marketing/site-content";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";

export const metadata: Metadata = {
  title: "Support - The Fur Finder",
  description: "Contact The Fur Finder for account, safety, billing, privacy, and app support.",
};

const supportLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/faq", label: "FAQ" },
];

export default function SupportPage() {
  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <Reveal as="h1" className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
            How can we help?
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-4 max-w-xl font-body text-[16px] leading-relaxed text-forest/75">
            Contact us about accounts, subscriptions, purchases, reports, moderation, privacy, safety, or technical issues.
          </Reveal>
          <Reveal delay={120} className="mt-8">
            <Magnetic>
              <a
                href={`mailto:${supportEmail}?subject=The%20Fur%20Finder%20Support`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-3.5 font-body text-[15px] font-bold text-forest"
              >
                <Mail className="h-4 w-4" />
                {supportEmail}
              </a>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal as="h2" className="font-display text-[24px] italic text-forest max-md:text-[20px]">
            Response expectations
          </Reveal>
          <Reveal delay={40} className="mt-3 max-w-[60ch] font-body text-[14.5px] leading-relaxed text-forest/75">
            Include the email on your account, device platform, app version, and a short description. Do not send passwords, full payment-card details, or unnecessary medical information.
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Reveal className="rounded-[20px] border-[1.5px] border-forest/15 bg-card p-7">
              <h3 className="font-display text-[19px] italic text-forest">Standard support</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-forest/75">
                We aim to acknowledge standard requests within 2 business days. Complex account, purchase, privacy, or moderation reviews may take longer, and we will provide an update when possible.
              </p>
            </Reveal>
            <Reveal delay={60} className="rounded-[20px] border-[1.5px] border-forest/15 bg-card p-7">
              <h3 className="flex items-center gap-2 font-display text-[19px] italic text-forest">
                <ShieldCheck className="h-5 w-5 text-forest/60" strokeWidth={1.75} />
                Urgent safety
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-forest/75">
                The Fur Finder is not an emergency service. Contact local emergency services, police, council, or an emergency veterinarian first when a person or animal is in immediate danger, then report the user or content to us.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120} className="mt-8 flex flex-wrap gap-3">
            {supportLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border-[1.5px] border-forest/15 bg-card px-5 py-3 font-body text-sm font-semibold text-forest transition-colors hover:border-forest/35"
              >
                {item.label}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
