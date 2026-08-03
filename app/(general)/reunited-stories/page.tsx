import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { db } from "@/lib/db";
import Reveal from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "Reunited Stories - The Fur Finder",
  description:
    "Inspiring stories of pets reunited with their families through The Fur Finder.",
};

async function getReunitedStories() {
  try {
    const stories = await db.queryMany(
      'SELECT *, after_image_url AS image_url FROM reunited_stories WHERE is_published = true AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 12'
    );
    return { data: stories, pagination: {} };
  } catch (error) {
    console.error("Error fetching reunited stories:", error);
    return { data: [], pagination: {} };
  }
}

async function getFeaturedStories() {
  try {
    const stories = await db.queryMany(
      'SELECT *, after_image_url AS image_url FROM reunited_stories WHERE is_published = true AND deleted_at IS NULL AND featured_on_homepage = true ORDER BY created_at DESC LIMIT 3'
    );
    return { data: stories };
  } catch (error) {
    console.error("Error fetching featured stories:", error);
    return { data: [] };
  }
}

function StoryCard({ story, featured, delay }: { story: any; featured?: boolean; delay: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/reunited-stories/${story.id}`}
        className={`group flex h-full flex-col overflow-hidden rounded-[20px] border-[1.5px] bg-card transition-colors ${
          featured ? "border-amber/50 hover:border-amber" : "border-forest/15 hover:border-forest/35"
        }`}
      >
        {story.image_url && (
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.image_url}
              alt={story.pet_name}
              className="h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex rounded-full border-[1.5px] border-leaf/40 bg-leaf/10 px-2.5 py-0.5 font-body text-[11px] font-bold capitalize text-leaf-text">
              {story.pet_type}
            </span>
            {featured && (
              <span className="inline-flex rounded-full border-[1.5px] border-amber/50 bg-amber/15 px-2.5 py-0.5 font-body text-[11px] font-bold text-forest">
                Featured
              </span>
            )}
          </div>
          <h3 className="font-display text-[19px] italic leading-tight text-forest">
            {story.pet_name}&apos;s Journey
          </h3>
          <p className="mt-2 line-clamp-3 font-body text-[13.5px] leading-relaxed text-forest/75">
            {story.story_content}
          </p>
          <p className="mt-4 font-body text-[12px] text-forest/55">
            Reunited:{" "}
            {story.reunion_date
              ? new Date(story.reunion_date).toLocaleDateString("en-US", { year: "numeric", month: "long" })
              : "Recently"}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function ReunitedStoriesPage() {
  const [allStories, featuredResult] = await Promise.all([
    getReunitedStories(),
    getFeaturedStories(),
  ]);

  const stories = allStories.data || [];
  const featuredStories = featuredResult.data || [];

  return (
    <div className="bg-cream text-forest">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <Reveal as="h1" className="font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] text-forest max-md:text-[32px]">
            Pets reunited, <span className="text-coral-text not-italic">families complete.</span>
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-5 max-w-xl font-body text-[16px] leading-relaxed text-forest/75">
            Read inspiring stories of lost pets who found their way home with the help of our community and technology.
          </Reveal>
        </div>
      </section>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="border-t border-forest/10 px-6 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal as="h2" className="font-display text-[26px] italic text-forest max-md:text-[22px]">
              Featured stories
            </Reveal>
            <Reveal delay={40} className="mt-2 max-w-[54ch] font-body text-[14.5px] text-forest/70">
              These remarkable reunions show the power of community and technology working together.
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredStories.map((story: any, i: number) => (
                <StoryCard key={story.id} story={story} featured delay={i * 60} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Stories */}
      <section className="border-t border-forest/10 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal as="h2" className="font-display text-[26px] italic text-forest max-md:text-[22px]">
            All stories
          </Reveal>
          <Reveal delay={40} className="mt-2 max-w-[54ch] font-body text-[14.5px] text-forest/70">
            Browse all the heartwarming reunions from our community.
          </Reveal>

          <div className="mt-10">
            {stories.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story: any, i: number) => (
                  <StoryCard key={story.id} story={story} delay={(i % 6) * 60} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-dashed border-forest/15 py-20 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest/40">
                  <Heart size={20} strokeWidth={1.75} />
                </span>
                <p className="font-body text-[14.5px] text-forest/70">
                  No stories available yet. Be the first to share a reunited story!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
