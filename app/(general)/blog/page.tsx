import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { db } from "@/lib/db";
import Reveal from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "Blog & Stories - The Fur Finder",
  description:
    "Practical advice, stories from the search, and product updates from Australia's AI-powered pet recovery platform.",
};

interface BlogRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  author: string | null;
  category: string;
  created_at: string;
}

function readTime(content: string) {
  const words = content?.trim().split(/\s+/).filter(Boolean).length || 0;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function formatDate(date: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString("en-US", opts);
}

async function getCategories(): Promise<string[]> {
  const rows = await db.queryMany<{ category: string }>(
    "SELECT DISTINCT category FROM blogs WHERE is_published = true AND category IS NOT NULL ORDER BY category"
  );
  return rows.map((r) => r.category);
}

async function getBlogPosts(category?: string): Promise<BlogRow[]> {
  try {
    const conditions = ["is_published = true"];
    const params: string[] = [];
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    const blogs = await db.queryMany<BlogRow>(
      `SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC LIMIT 20`,
      params
    );
    return blogs || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const [categories, posts] = await Promise.all([getCategories(), getBlogPosts(category)]);

  const featuredPost = !category && posts.length > 0 ? posts[0] : null;
  const listPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 pb-10 pt-16 md:pt-20">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-5xl">
          <Reveal as="h1" className="max-w-[18ch] font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] text-forest max-md:text-[32px]">
            Stories, updates <span className="text-coral-text not-italic">& pet advice.</span>
          </Reveal>
          <Reveal delay={60} className="mt-4 max-w-[54ch] font-body text-[16px] leading-relaxed text-forest/75">
            Expert tips on pet safety, heartwarming reunion stories, and the latest from The Fur Finder team.
          </Reveal>

          {categories.length > 0 ? (
            <Reveal delay={120} className="mt-8 flex flex-wrap gap-2.5">
              <Link
                href="/blog"
                className={`rounded-full border-[1.5px] px-4 py-1.5 font-body text-[13px] font-semibold transition-colors ${
                  !category ? "border-amber bg-amber text-forest" : "border-forest/15 bg-card text-forest/75 hover:border-forest/35"
                }`}
              >
                All posts
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/blog?category=${encodeURIComponent(c)}`}
                  className={`rounded-full border-[1.5px] px-4 py-1.5 font-body text-[13px] font-semibold transition-colors ${
                    category === c ? "border-amber bg-amber text-forest" : "border-forest/15 bg-card text-forest/75 hover:border-forest/35"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </Reveal>
          ) : null}
        </div>
      </section>

      {featuredPost && (
        <section className="px-6 pb-4 pt-6">
          <Reveal className="mx-auto max-w-5xl">
            <Link href={`/blog/${featuredPost.slug}`} className="group relative block overflow-hidden rounded-[24px] border-[1.5px] border-forest/15 bg-forest">
              <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] md:aspect-[21/9]">
                {featuredPost.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredPost.image_url}
                    alt={featuredPost.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PawPrint size={72} className="text-cream/15" strokeWidth={1.5} />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-10">
                  <span className="inline-flex rounded-full border-[1.5px] border-amber/50 bg-amber/15 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-amber">
                    {featuredPost.category}
                  </span>
                  <h2 className="mt-3 line-clamp-2 max-w-[26ch] font-display text-[22px] italic leading-tight text-cream sm:text-[28px] md:text-[40px]">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 max-w-[60ch] font-body text-[13.5px] leading-relaxed text-cream/70 sm:text-[14.5px] md:text-[15px]">
                    {featuredPost.excerpt}
                  </p>
                  <p className="mt-4 font-body text-[12.5px] text-cream/65 sm:text-[13px]">
                    {featuredPost.author || "The Fur Finder Team"} · {formatDate(featuredPost.created_at, { month: "long", day: "numeric", year: "numeric" })} · {readTime(featuredPost.content)}
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-5xl">
          {listPosts.length > 0 ? (
            <div className="border-t border-forest/10">
              {listPosts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 6) * 50}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-5 border-b border-forest/10 py-8 sm:flex-row sm:items-center"
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border-[1.5px] border-forest/15 bg-muted sm:w-56">
                      {post.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PawPrint size={32} className="text-forest/20" strokeWidth={1.75} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-[11px] font-bold uppercase tracking-widest text-leaf-text">
                        {post.category}
                      </p>
                      <h3 className="mt-1.5 font-display text-[22px] italic leading-tight text-forest">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 max-w-[62ch] font-body text-[14.5px] leading-relaxed text-forest/75">
                        {post.excerpt}
                      </p>
                      <p className="mt-3 font-body text-[12.5px] text-forest/75">
                        {post.author || "The Fur Finder Team"} · {formatDate(post.created_at, { month: "short", day: "numeric" })} · {readTime(post.content)}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            !featuredPost && (
              <div className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-dashed border-forest/15 py-20 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest/40">
                  <PawPrint size={20} strokeWidth={1.75} />
                </span>
                <p className="font-display text-[19px] italic text-forest">No stories yet</p>
                <p className="max-w-sm font-body text-sm text-forest/70">New stories are coming soon. Stay tuned!</p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
