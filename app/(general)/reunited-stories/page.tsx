import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSection } from "@/components/marketing/MarketingPrimitives";

export const metadata: Metadata = {
  title: "Reunited Stories - The Fur Finder",
  description:
    "Inspiring stories of pets reunited with their families through The Fur Finder.",
};

import { db } from "@/lib/db";

async function getReunitedStories() {
  try {
    const stories = await db.queryMany(
      'SELECT *, after_image_url AS image_url FROM reunited_stories WHERE is_published = true ORDER BY created_at DESC LIMIT 12'
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
      'SELECT *, after_image_url AS image_url FROM reunited_stories WHERE is_published = true AND featured_on_homepage = true ORDER BY created_at DESC LIMIT 3'
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
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a2e]">
      <main>
        {/* Hero Section */}
        <section className="bg-[linear-gradient(180deg,#fff_0%,#fff5f3_100%)] px-6 py-20 text-center md:px-8">
          <span className="inline-flex rounded-full bg-[#fff1ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6b4a]">
            Success Stories
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
            Pets Reunited, Families Complete
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#6b7280]">
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
                <div
                  key={story.id}
                  className="rounded-2xl border-2 border-[#ff6b4a] bg-white overflow-hidden"
                >
                  {story.image_url && (
                    <div className="h-48 overflow-hidden bg-[#e5e7eb]">
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#fff1ed] text-xs font-medium text-[#ff6b4a]">
                        {story.pet_type}
                      </span>
                      {story.is_featured && (
                        <span className="inline-block px-3 py-1 rounded-full bg-[#fff3cd] text-xs font-medium text-[#ff9800]">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {story.pet_name}&apos;s Journey
                    </h3>
                    <p className="text-[#6b7280] text-sm mb-4 line-clamp-3">
                      {story.story_content}
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      Reunited:{" "}
                      {story.reunited_date
                        ? new Date(story.reunited_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                            },
                          )
                        : "Recently"}
                    </p>
                  </div>
                </div>
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
                <div
                  key={story.id}
                  className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  {story.image_url && (
                    <div className="h-48 overflow-hidden bg-[#e5e7eb]">
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#fff1ed] text-xs font-medium text-[#ff6b4a]">
                        {story.pet_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      {story.pet_name}&apos;s Journey
                    </h3>
                    <p className="text-[#6b7280] text-sm mb-4 line-clamp-3">
                      {story.story_content}
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      Reunited:{" "}
                      {story.reunited_date
                        ? new Date(story.reunited_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                            },
                          )
                        : "Recently"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#e5e7eb] bg-white p-8 text-center">
              <p className="text-[#6b7280]">
                No stories available yet. Be the first to share a reunited
                story!
              </p>
            </div>
          )}
        </MarketingSection>
      </main>
    </div>
  );
}
