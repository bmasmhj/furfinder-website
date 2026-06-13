import Image from 'next/image'
import Mobile from '@/assets/images/mobile.png'
import { Globe } from 'lucide-react'
import Apple from '../icons/Apple'
import PlayStore from '../icons/PlayStore'
import Link from 'next/link'
import { downloadApp } from '@/lib/downloadHandler'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-orange-50/50 to-teal-50/30 px-6 py-[72px] pb-[90px] dark:from-background dark:via-orange-950/10 dark:to-teal-950/10">
      {/* Decorative radial gradient */}
      <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,74,0.07)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-x-16 px-6">
        <div className="flex max-w-2xl flex-col justify-center gap-7">
          {/* Pill badge */}
          <div className="inline-flex max-w-fit items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            &#x1F1E6;&#x1F1FA; Australia&apos;s First AI-Powered Pet Recovery App
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.12] tracking-[-1.5px] text-foreground max-md:text-[30px]">
            Helping bring{' '}
            <span className="text-primary">lost pets</span> home,{' '}
            <em className="not-italic">faster.</em>
          </h1>

          <p className="max-w-[540px] text-[17px] leading-[1.75] text-muted-foreground max-md:text-[15px]">
            Report a lost or found pet, review AI-suggested matches, and connect
            with your community in one place.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
            <span>Current beta access</span>
            <span className="text-primary">iOS, Android &amp; Web options</span>
            <span>Australia-wide</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={downloadApp("ios")}
              className="inline-flex w-full items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(255,107,74,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#e5553a] hover:shadow-[0_8px_24px_rgba(255,107,74,0.35)] md:w-auto"
            >
              <Apple className='h-5 w-5'/>
              Join iOS TestFlight
            </Link>
            <Link
              href={downloadApp("android")}
              className="inline-flex w-full items-center gap-2 rounded-xl border-[1.5px] border-border bg-card px-7 py-3.5 text-[15px] font-semibold text-foreground transition-all hover:border-primary hover:text-primary md:w-auto"
            >
              <PlayStore className='h-5 w-5'/>
              Request Android beta
            </Link>
            <a
              href="https://app.thefurfinder.com"
              className="inline-flex w-full items-center gap-2 rounded-xl border-[1.5px] border-border bg-card px-7 py-3.5 text-[15px] font-semibold text-foreground transition-all hover:border-primary hover:text-primary md:w-auto"
            >
              <Globe size={18} />
              Try on Web
            </a>
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex">
          <div className="relative">
            <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-primary/10 blur-3xl" />
            <Image
              src={Mobile}
              alt="The Fur Finder mobile app"
              width={300}
              height={580}
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
