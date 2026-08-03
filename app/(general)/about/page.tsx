import type { Metadata } from 'next'
import { Heart, Lightbulb, Users, Quote } from 'lucide-react'
import { founderStory, founderStorySignoff } from '@/components/marketing/site-content'
import Reveal from '@/components/marketing/Reveal'

export const metadata: Metadata = {
  title: 'Our Story - The Fur Finder',
  description: 'Learn why The Fur Finder was built and the mission behind the product.',
}

const values = [
  {
    icon: Heart,
    title: 'Compassion',
    body: 'We understand the panic and grief of a missing pet, so every product decision is made to reduce friction in that moment.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    body: 'We use practical AI where it genuinely helps, especially in narrowing down possible matches faster than manual searching.',
  },
  {
    icon: Users,
    title: 'Community',
    body: 'Lost pet recovery works best when owners, neighbours, shelters, and vets are connected through one clear system.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-3xl">
          <Reveal as="h1" className="font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] text-forest max-md:text-[32px]">
            Built from one very personal search for home.
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-5 max-w-2xl font-body text-[16px] leading-relaxed text-forest/75">
            The Fur Finder exists because losing a pet is chaotic, emotional, and often scattered across too many tools. We wanted one place that could help families act fast.
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-forest/55">
            Founder
          </Reveal>
          <Reveal delay={40} as="h2" className="mt-2 font-display text-[28px] italic leading-tight text-forest max-md:text-[24px]">
            Why this platform had to exist
          </Reveal>

          <Reveal delay={100} className="relative mt-8 rounded-[24px] border-[1.5px] border-forest/15 bg-card px-8 py-10 md:px-12">
            <Quote className="h-9 w-9 text-forest/10" strokeWidth={1.5} />
            <div className="mt-4 space-y-5 font-body text-[15px] leading-8 text-forest/85">
              {founderStory.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-7 border-t border-forest/10 pt-5 font-body text-sm font-semibold text-forest">
              — {founderStorySignoff}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 bg-forest px-6 py-20 text-cream md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal as="h2" className="font-display text-[30px] italic tracking-[-0.01em] max-md:text-[24px]">
            What guides the product
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-3 max-w-[46ch] font-body text-[15px] leading-relaxed text-cream/65">
            The Fur Finder blends technology with trust, care, and local action.
          </Reveal>

          <div className="mt-14 grid gap-x-10 border-t border-cream/15 sm:grid-cols-3">
            {values.map((value, i) => (
              <Reveal
                key={value.title}
                delay={i * 60}
                className="flex flex-col items-center border-b border-cream/15 px-4 py-8 text-center sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-[1.5px] border-cream/25 text-cream">
                  <value.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-[19px] italic text-cream">{value.title}</h3>
                <p className="mt-2 font-body text-[14px] leading-relaxed text-cream/65">{value.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
