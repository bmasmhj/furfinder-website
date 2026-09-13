import type { Metadata } from "next";
import { Globe, Smartphone, Shield, Search } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";
import { downloadApp } from "@/lib/downloadHandler";
import Link from "next/link";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";

export const metadata: Metadata = {
  title: "Get The Fur Finder - Current Platform Availability",
  description:
    "Download The Fur Finder for iOS, request Android beta access, or open the web experience.",
};

const webAppUrl = "https://app.thefurfinder.com?skiponboarding=true";

const highlights = [
  { icon: Search, label: "Suggested Matches", desc: "Review and verify possible matches" },
  { icon: Shield, label: "Safety First", desc: "Reporting and community guidance" },
  { icon: Globe, label: "Web Access", desc: "Open the current browser experience" },
];

export default function DownloadPage() {
  return (
    <div className="bg-cream text-forest">
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest px-6 py-24 text-center text-cream md:py-28">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" viewBox="0 0 1440 500" preserveAspectRatio="none">
          <path d="M-40 80 C 300 20, 600 140, 900 70 S 1500 90, 1600 40" stroke="hsl(var(--cream))" strokeWidth="1.5" fill="none" />
          <path d="M-40 400 C 300 340, 600 460, 900 390 S 1500 410, 1600 360" stroke="hsl(var(--cream))" strokeWidth="1.5" fill="none" />
        </svg>

        <div className="relative mx-auto max-w-3xl">
          <Reveal as="h1" className="font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] max-md:text-[32px]">
            Get The Fur Finder
          </Reveal>

          <Reveal delay={60} className="mx-auto mt-5 max-w-lg font-body text-[16.5px] leading-relaxed text-cream/70">
            Download the iOS app, request Android beta access, or open the web experience from your browser.
          </Reveal>

          {/* Download buttons */}
          <Reveal delay={120} className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Magnetic className="w-full sm:w-auto">
              <Link
                href={downloadApp("ios")}
                className="inline-flex w-full items-center gap-3 rounded-xl border-[1.5px] border-cream/20 px-7 py-4 transition-colors hover:border-amber sm:w-auto"
              >
                <Apple className="h-7 w-7 fill-current" />
                <div className="text-left">
                  <span className="block font-body text-[10px] font-normal text-cream/55">Download on</span>
                  <span className="block font-body text-lg font-bold leading-tight">App Store</span>
                </div>
              </Link>
            </Magnetic>

            <Magnetic className="w-full sm:w-auto">
              <Link
                href={downloadApp("android")}
                className="inline-flex w-full items-center gap-3 rounded-xl border-[1.5px] border-cream/20 px-7 py-4 transition-colors hover:border-amber sm:w-auto"
              >
                <PlayStore className="h-7 w-7 fill-current" />
                <div className="text-left">
                  <span className="block font-body text-[10px] font-normal text-cream/55">Request access to</span>
                  <span className="block font-body text-lg font-bold leading-tight">Android Beta</span>
                </div>
              </Link>
            </Magnetic>

            <Magnetic className="w-full sm:w-auto">
              <a
                href={webAppUrl}
                className="inline-flex w-full items-center gap-3 rounded-xl border-[1.5px] border-cream/20 px-7 py-4 transition-colors hover:border-amber sm:w-auto"
              >
                <Globe className="h-7 w-7" strokeWidth={1.75} />
                <div className="text-left">
                  <span className="block font-body text-[10px] font-normal text-cream/55">Open in browser</span>
                  <span className="block font-body text-lg font-bold leading-tight">Web App</span>
                </div>
              </a>
            </Magnetic>
          </Reveal>

          <Reveal delay={180} className="mt-6 font-body text-[13px] text-cream/55">
            Beta capacity and platform availability may change.
          </Reveal>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-forest/10 px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-x-10 border-t border-forest/10 sm:grid-cols-3">
          {highlights.map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 60}
              className="flex items-start gap-3.5 border-b border-forest/10 py-7 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:pr-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-forest/15 text-forest">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-body text-[14px] font-bold text-forest">{item.label}</h3>
                <p className="mt-0.5 font-body text-[13px] text-forest/70">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Platform details */}
      <section className="px-6 py-20 md:py-24">
        <Reveal as="h2" className="text-center font-display text-[30px] italic tracking-[-0.01em] text-forest max-md:text-[24px]">
          Choose an available option
        </Reveal>
        <Reveal delay={60} className="mx-auto mb-14 mt-3 max-w-lg text-center font-body text-[14.5px] text-forest/70">
          These links describe the channels currently offered. We do not display unavailable store buttons or purchase options.
        </Reveal>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {/* iOS */}
          <Reveal delay={0} className="flex flex-col items-center rounded-[20px] border-[1.5px] border-forest/15 bg-card p-8 text-center">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
              <Apple className="h-7 w-7 fill-current" />
            </span>
            <h3 className="font-display text-[20px] italic text-forest">iOS app</h3>
            <p className="mt-1 font-body text-[13px] text-forest/70">Available from the App Store</p>
            <Link
              href={downloadApp("ios")}
              className="mt-6 w-full rounded-xl bg-amber py-3 font-body text-sm font-bold text-forest"
            >
              Download on App Store →
            </Link>
          </Reveal>

          {/* Android */}
          <Reveal delay={70} className="flex flex-col items-center rounded-[20px] border-[1.5px] border-forest/15 bg-card p-8 text-center">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
              <PlayStore className="h-7 w-7 fill-current" />
            </span>
            <h3 className="font-display text-[20px] italic text-forest">Android beta</h3>
            <p className="mt-1 font-body text-[13px] text-forest/70">Request access with your email</p>
            <Link
              href={downloadApp("android")}
              className="mt-6 w-full rounded-xl bg-amber py-3 font-body text-sm font-bold text-forest"
            >
              Request beta access →
            </Link>
          </Reveal>

          {/* Web */}
          <Reveal delay={140} className="flex flex-col items-center rounded-[20px] border-[1.5px] border-forest/15 bg-card p-8 text-center">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
              <Globe className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <h3 className="font-display text-[20px] italic text-forest">Web App</h3>
            <p className="mt-1 font-body text-[13px] text-forest/70">Any browser · Free</p>
            <a
              href={webAppUrl}
              className="mt-6 w-full rounded-xl bg-amber py-3 font-body text-sm font-bold text-forest"
            >
              Open Web App →
            </a>
          </Reveal>
        </div>
      </section>

      {/* Share section */}
      <section className="border-t border-forest/10 bg-forest px-6 py-20 text-center text-cream">
        <Reveal className="mx-auto max-w-md">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-cream/25 text-cream">
            <Smartphone size={24} strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-[24px] italic text-cream">
            Share with someone who needs it
          </h2>
          <p className="mt-3 font-body text-[14.5px] leading-relaxed text-cream/65">
            Know someone who&apos;s lost a pet? Share this page so they can see the current app and web access options.
          </p>
          <div className="mx-auto mt-7 flex max-w-sm items-center gap-2 rounded-xl border-[1.5px] border-cream/20 px-4 py-3">
            <span className="flex-1 truncate text-left font-body text-[13.5px] text-cream/70">
              thefurfinder.com/download
            </span>
            <CopyButton text="https://thefurfinder.com/download" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
