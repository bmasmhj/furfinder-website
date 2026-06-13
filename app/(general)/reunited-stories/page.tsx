import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSection } from "@/components/marketing/MarketingPrimitives";
import { db } from "@/lib/db";

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

export default async function ReunitedStoriesPage() {
  const [allStories, featuredResult] = await Promise.all([
    getReunitedStories(),
    getFeaturedStories(),
  ]);

  const stories = allStories.data || [];
  const featuredStories = featuredResult.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-orange-50/50 px-6 py-20 text-center dark:to-orange-950/10 md:px-8">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Success Stories
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] text-foreground md:text-6xl">
            Pets Reunited, Families Complete
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            Read inspiring stories of lost pets who found their way home with
            the help of our community and technology.
          </p>
        </section>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <MarketingSection
            title="Featured Stories"
            description="These remarkable reunions show the power of community and technology working together."
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredStories.map((story: any) => (
                <Link
                  href={`/reunited-stories/${story.id}`}
                  key={story.id}
                  className="overflow-hidden rounded-2xl border-2 border-primary bg-card transition-all hover:shadow-lg"
                >
                  {story.image_url && (
                    <div className="h-48 overflow-hidden bg-muted">
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {story.pet_type}
                      </span>
                      {story.is_featured && (
                        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">
                      {story.pet_name}&apos;s Journey
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {story.story_content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reunited:{" "}
                      {story.reunion_date
                        ? new Date(story.reunion_date).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long" }
                          )
                        : "Recently"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </MarketingSection>
        )}

        {/* All Stories */}
        <MarketingSection
          title="All Stories"
          description="Browse all the heartwarming reunions from our community."
        >
          {stories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story: any) => (
                <Link
                  href={`/reunited-stories/${story.id}`}
                  key={story.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {story.image_url && (
                    <div className="h-48 overflow-hidden bg-muted">
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {story.pet_type}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {story.pet_name}&apos;s Journey
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {story.story_content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reunited:{" "}
                      {story.reunion_date
                        ? new Date(story.reunion_date).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long" }
                          )
                        : "Recently"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No stories available yet. Be the first to share a reunited story!
              </p>
            </div>
          )}
        </MarketingSection>
      </main>
    </div>
  );
}
