import type { Metadata } from 'next'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import { MarketingSection } from '@/components/marketing/MarketingPrimitives'

export const metadata: Metadata = {
  title: 'Stories & Updates - The Fur Finder',
  description: 'Stories, product updates, and practical advice from The Fur Finder.',
}

const posts = [
  {
    category: 'Success Story',
    date: 'February 2026',
    title: 'How one local sighting turned into a reunion in under 48 hours',
    excerpt:
      'A missing dog report, a shelter intake, and one AI-assisted match came together quickly because everything lived in the same workflow.',
  },
  {
    category: 'Product',
    date: 'January 2026',
    title: 'Why map search and AI matching work better together',
    excerpt:
      'The best reunification tools are not just smart, they are situational. Radius, timing, and visual clues matter together.',
  },
  {
    category: 'Pet Safety',
    date: 'January 2026',
    title: 'What to do in the first hour after your pet goes missing',
    excerpt:
      'A calm checklist for owners who need to act fast without bouncing between scattered apps, groups, and phone calls.',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a2e]">
      <main>
        <section className="bg-[linear-gradient(180deg,#fff_0%,#fff5f3_100%)] px-6 py-20 text-center md:px-8">
          <span className="inline-flex rounded-full bg-[#fff1ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6b4a]">
            Stories & Updates
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">Stories from the search, the rescue, and the reunion.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#6b7280]">
            This page replaces the generic blog placeholder with content that feels closer to the product and community the templates describe.
          </p>
        </section>

        <MarketingSection title="Latest articles" description="A compact editorial layout that matches the homepage visual system.">
          <div className="space-y-5">
            {posts.map((post) => (
              <article key={post.title} className="rounded-3xl border border-[#e5e7eb] bg-white p-8">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-[#fff1ed] px-3 py-1 font-medium text-[#ff6b4a]">{post.category}</span>
                  <span className="text-[#9ca3af]">{post.date}</span>
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-[#1a1a2e]">{post.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-[#6b7280]">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </MarketingSection>
      </main>
    </div>
  )
}
