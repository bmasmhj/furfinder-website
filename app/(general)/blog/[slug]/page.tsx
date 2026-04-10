import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";

async function getBlogPost(slug: string) {
  try {
    const blog = await db.queryOne(
      'SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE slug = $1 AND is_published = true',
      [slug]
    );
    return blog;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getTrendingBlogs() {
  try {
    const blogs = await db.queryMany(
      'SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE is_published = true ORDER BY created_at DESC LIMIT 3'
    );
    return blogs || [];
  } catch (error) {
    console.error("Error fetching trending blogs:", error);
    return [];
  }
}



export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
      description: "The blog post you are looking for does not exist.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const trendingBlogs = await getTrendingBlogs();

  if (!post) {
    notFound();
  }

  const relatedBlogs = trendingBlogs
    .filter((b: any) => b.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a2e]">
      <main>
        {/* Hero Section */}
        <article className="mx-auto max-w-4xl px-6 py-12 md:py-20">
          <div className="mb-8">
            <Link href="/blog" className="text-[#ff6b4a] hover:underline">
              ← Back to articles
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="rounded-full bg-[#fff1ed] px-3 py-1 text-sm font-medium text-[#ff6b4a]">
                {post.category}
              </span>
              <span className="text-sm text-[#9ca3af]">By {post.author}</span>
              <span className="text-sm text-[#9ca3af]">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] mb-6">
              {post.title}
            </h1>

            <p className="text-lg text-[#6b7280] leading-8">{post.excerpt}</p>
          </div>

          {post.image_url && (
            <div className="mb-12 rounded-2xl overflow-hidden bg-[#e5e7eb] h-96">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-sm md:prose-base max-w-none mb-16 text-[#4b5563] leading-8">
            {post.content.split("\n").map(
              (paragraph: string, i: number) =>
                paragraph.trim() && (
                  <p key={i} className="mb-6">
                    {paragraph}
                  </p>
                ),
            )}
          </div>
        </article>

        {/* Related & Trending */}
        <div className="border-t border-[#e5e7eb] bg-white">
          <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
            <h2 className="mb-8 text-2xl md:text-3xl font-bold tracking-[-0.02em]">
              More articles
            </h2>

            {relatedBlogs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedBlogs.map((blog: any) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`}>
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 transition-shadow hover:shadow-md h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-[#ff6b4a] uppercase">
                          {blog.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold tracking-[-0.02em] mb-3 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-[#6b7280] line-clamp-2">
                        {blog.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#6b7280]">No more articles available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
