import type { Metadata } from "next";
import { Globe, Smartphone, Shield, Search } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";
import { downloadApp } from "@/lib/downloadHandler";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get The Fur Finder - Current Platform Availability",
  description:
    "See current TestFlight, Android beta, and web availability for The Fur Finder.",
};

const webAppUrl = "https://app.thefurfinder.com";

const highlights = [
  { icon: Search, label: "Suggested Matches", desc: "Review and verify possible matches" },
  { icon: Shield, label: "Safety First", desc: "Reporting and community guidance" },
  { icon: Globe, label: "Web Access", desc: "Open the current browser experience" },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#2d2d4a] to-[#1A1A2E] px-6 py-24 text-center text-white">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary opacity-15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500 opacity-10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            Current availability
          </span>

          <h1 className="mb-5 text-4xl font-extrabold tracking-[-0.03em] md:text-6xl">
            Get The Fur Finder
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-white/70">
            Access the current beta or open the web experience. Public App Store
            and Google Play listings are not currently advertised on this page.
          </p>

          {/* Download buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* App Store */}
            <Link
              href={downloadApp("ios")}
              className="inline-flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-white/15 bg-white/[0.08] px-7 py-4 text-white backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.14] sm:w-auto"
            >
              <Apple />
              <div className="text-left">
                <span className="block text-[10px] font-normal opacity-65">Join through</span>
                <span className="block text-lg font-bold leading-tight">
                  iOS TestFlight
                </span>
              </div>
            </Link>

            {/* Google Play */}
            <Link
              href={downloadApp("android")}
              className="inline-flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-white/15 bg-white/[0.08] px-7 py-4 text-white backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.14] sm:w-auto"
            >
             <PlayStore />
              <div className="text-left">
                <span className="block text-[10px] font-normal opacity-65">Request access to</span>
                <span className="block text-lg font-bold leading-tight">
                  Android Beta
                </span>
              </div>
            </Link>

            {/* Web App */}
            <a
              href={webAppUrl}
              className="inline-flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-white/15 bg-white/[0.08] px-7 py-4 text-white backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.14] sm:w-auto"
            >
              <Globe className="h-7 w-7" />
              <div className="text-left">
                <span className="block text-[10px] font-normal opacity-65">
                  Open in browser
                </span>
                <span className="block text-lg font-bold leading-tight">
                  Web App
                </span>
              </div>
            </a>
          </div>

          <p className="mt-6 text-[13px] text-white/40">
            Beta capacity and platform availability may change.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-border bg-background px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <item.icon size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform details */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="mb-3 text-center text-2xl font-bold tracking-[-0.02em] text-foreground md:text-3xl">
          Choose an available option
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-sm text-muted-foreground">
          These links describe the channels currently offered. We do not display
          unavailable store buttons or purchase options.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* iOS */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg">
              <Apple className="w-8 h-8" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">iOS beta</h3>
            <p className="mb-5 text-xs text-muted-foreground">TestFlight access, subject to availability</p>
            <Link
              href={downloadApp("ios")}
              className="block w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
            >
              View TestFlight instructions →
            </Link>
          </div>

          {/* Android */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
              <PlayStore className="w-8 h-8" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">Android beta</h3>
            <p className="mb-5 text-xs text-muted-foreground">Request access with your email</p>
            <Link
              href={downloadApp("android")}
              className="block w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
            >
              Request beta access →
            </Link>
          </div>

          {/* Web */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#FF8A6E] text-white shadow-lg">
              <Globe size={32} />
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">Web App</h3>
            <p className="mb-5 text-xs text-muted-foreground">Any browser · Free</p>
            <a
              href={webAppUrl}
              className="block w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
            >
              Open Web App →
            </a>
          </div>
        </div>
      </section>

      {/* Share section */}
      <section className="border-t border-border bg-muted/50 px-6 py-16 text-center">
        <div className="mx-auto max-w-md">
          <Smartphone size={32} className="mx-auto mb-4 text-primary" />
          <h2 className="mb-3 text-xl font-bold text-foreground">
            Share with someone who needs it
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Know someone who&apos;s lost a pet? Share this page so they can see
            the current app and web access options.
          </p>
          <div className="mx-auto flex max-w-sm items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <span className="flex-1 truncate text-left text-sm text-muted-foreground">
              thefurfinder.com/download
            </span>
            <CopyButton text="https://thefurfinder.com/download" />
          </div>
        </div>
      </section>
    </div>
  );
}
