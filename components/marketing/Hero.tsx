import Link from 'next/link'
import { Globe } from 'lucide-react'
import Apple from '../icons/Apple'
import PlayStore from '../icons/PlayStore'
import { downloadApp } from '@/lib/downloadHandler'
import { heroTrustItems } from './site-content'
import IllustratedMap from './IllustratedMap'
import Reveal from './Reveal'
import Magnetic from './Magnetic'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream px-6 pb-20 pt-14 md:pb-28 md:pt-20">
      {/* Contour field, low-opacity, reads as topographic paper rather than gradient decoration */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] w-full opacity-[0.55]"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
      >
        <path d="M-40 60 C 300 10, 600 110, 900 50 S 1500 70, 1600 20" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        <path d="M-40 160 C 300 110, 600 210, 900 150 S 1500 170, 1600 120" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        <path d="M-40 260 C 300 210, 600 310, 900 250 S 1500 270, 1600 220" stroke="hsl(var(--forest) / 0.06)" strokeWidth="1.5" fill="none" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[1.1fr_0.95fr] md:gap-10 lg:gap-16">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-2 font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-forest/75">
            <span aria-hidden>🇦🇺</span>
            Australia&apos;s first AI-powered pet recovery app
          </div>

          <Reveal as="h1" className="max-w-[15ch] font-display text-[52px] italic leading-[1.05] tracking-[-0.02em] text-forest max-md:text-[36px]">
            Every missing pet has <span className="text-coral-text not-italic">a way home.</span>
          </Reveal>

          <Reveal delay={80} className="max-w-[46ch] font-body text-[18px] leading-[1.7] text-forest/70 max-md:text-[16px]">
            The Fur Finder pairs AI photo matching with your local community and a live map of every report, so lost and found pets across Australia find each other faster.
          </Reveal>

          <Reveal delay={140} className="flex flex-wrap items-center gap-3.5">
            <Magnetic>
              <a
                href="https://app.thefurfinder.com"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-4 font-body text-[15.5px] font-bold text-forest shadow-[0_14px_28px_-14px_hsl(var(--amber)/0.75)] transition-shadow hover:shadow-[0_18px_34px_-14px_hsl(var(--amber)/0.85)]"
              >
                Report a Lost Pet
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://app.thefurfinder.com"
                className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-forest/25 px-7 py-4 font-body text-[15.5px] font-bold text-forest transition-colors hover:border-forest hover:bg-forest/[0.04]"
              >
                Browse Found Pets
              </a>
            </Magnetic>
          </Reveal>

          <Reveal delay={200} className="flex flex-wrap gap-x-6 gap-y-2 pt-1 font-body text-[13.5px] font-medium text-forest/75">
            {heroTrustItems.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                {item}
              </span>
            ))}
          </Reveal>

          <Reveal delay={260} className="flex flex-wrap items-center gap-3 border-t border-forest/10 pt-6">
            <span className="mr-1 font-body text-[13px] font-semibold text-forest/75">Get the app</span>
            <Link
              href={downloadApp('ios')}
              className="flex items-center gap-2 rounded-xl border border-forest/15 bg-cream px-3.5 py-2 text-forest transition-colors hover:border-forest/35"
            >
              <Apple className="h-[18px] w-[18px]" />
              <span className="font-body text-[13px] font-semibold">App Store</span>
            </Link>
            <Link
              href={downloadApp('android')}
              className="flex items-center gap-2 rounded-xl border border-forest/15 bg-cream px-3.5 py-2 text-forest transition-colors hover:border-forest/35"
            >
              <PlayStore className="h-[18px] w-[18px]" />
              <span className="font-body text-[13px] font-semibold">Android beta</span>
            </Link>
            <a
              href="https://app.thefurfinder.com"
              className="flex items-center gap-2 rounded-xl border border-forest/15 bg-cream px-3.5 py-2 text-forest transition-colors hover:border-forest/35"
            >
              <Globe size={16} />
              <span className="font-body text-[13px] font-semibold">Web</span>
            </a>
          </Reveal>
        </div>

        <Reveal delay={160} className="relative">
          <IllustratedMap variant="hero" className="aspect-[4/5] w-full max-w-[440px] md:ml-auto md:aspect-[7/8]" />
        </Reveal>
      </div>
    </section>
  )
}
