import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSection } from "@/components/marketing/MarketingPrimitives";

export const metadata: Metadata = {
  title: "Blog & Stories - The Fur Finder",
  description:
    "Practical advice, stories from the search, and product updates from Australia's AI-powered pet recovery platform.",
};

import { db } from "@/lib/db";

async function getBlogPosts() {
  try {
    const blogs = await db.queryMany(
      'SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE is_published = true ORDER BY created_at DESC LIMIT 20'
    );
    return blogs || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}



export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-surface">
      <main>
        {/* Blog Header */}
        <section className="bg-surface px-6 py-20 border-b">
          <div className="max-w-7xl mx-auto">
            <span className="section-label">Our Blog</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1a2e] mt-4 mb-6">
              Stories, updates &{" "}
              <span className="text-[#ff6b4a]">pet advice.</span>
            </h1>
            <p className="max-w-2xl text-lg text-[#6b7280] leading-relaxed">
              Expert tips on pet safety, heartwarming reunion stories, and the
              latest from The Fur Finder team.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-16">
          {featuredPost && (
            <div className="mb-20">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group relative block overflow-hidden rounded-3xl card-bg border shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-[450px] relative overflow-hidden bg-[#f3f4f6]">
                    {featuredPost.image_url ? (
                      <img
                        src={featuredPost.image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">
                        🐾
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className="bg-[#ff6b4a] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        Featured Post
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-[#9ca3af] mb-4">
                      <span className="font-semibold text-[#ff6b4a] uppercase tracking-wider">
                        {featuredPost.category}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(featuredPost.created_at).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-6 group-hover:text-[#ff6b4a] transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[#6b7280] text-lg leading-relaxed mb-8 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3">
                      {featuredPost.author_image && (
                        <img
                          src={featuredPost.author_image}
                          alt={featuredPost.author_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <span className="block text-sm font-bold text-[#1a1a2e]">
                          {featuredPost.author_name || "The Fur Finder Team"}
                        </span>
                        <span className="block text-xs text-[#9ca3af]">
                          {featuredPost.read_time || "5 min read"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {remainingPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col card-bg border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-56 relative overflow-hidden bg-[#f3f4f6]">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">
                        🐾
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-[#9ca3af] mb-4">
                      <span className="font-bold text-[#ff6b4a] uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-4 group-hover:text-[#ff6b4a] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-[#f3f4f6]">
                      <span className="text-xs font-semibold text-[#1a1a2e]">
                        {post.author_name || "Admin"}
                      </span>
                      <span className="text-xs text-[#9ca3af]">
                        {post.read_time || "4 min read"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !featuredPost && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#d1d5db]">
                <p className="text-[#6b7280] text-lg">
                  New stories are coming soon. Stay tuned!
                </p>
              </div>
            )
          )}

          <div className="mt-16 text-center">
            <button className="btn-secondary px-8">Load More Posts</button>
          </div>
        </div>
      </main>
    </div>
  );
}
