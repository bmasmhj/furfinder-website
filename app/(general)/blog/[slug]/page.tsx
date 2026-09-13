import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PawPrint } from "lucide-react";
import { db } from "@/lib/db";
import Reveal from "@/components/marketing/Reveal";

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

async function getBlogPost(slug: string): Promise<BlogRow | null> {
  try {
    return await db.queryOne<BlogRow>(
      "SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE slug = $1 AND is_published = true",
      [slug]
    );
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getMoreBlogs(): Promise<BlogRow[]> {
  try {
    return await db.queryMany<BlogRow>(
      "SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE is_published = true ORDER BY created_at DESC LIMIT 4"
    );
  } catch (error) {
    console.error("Error fetching related blogs:", error);
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

  if (!post) {
    notFound();
  }

  const moreBlogs = await getMoreBlogs();
  const relatedBlogs = moreBlogs.filter((b) => b.id !== post.id).slice(0, 3);
  const paragraphs = post.content.split("\n").filter((p) => p.trim());

  return (
    <div className="bg-cream text-forest">
      <article className="px-6 pt-10 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 font-body text-sm font-semibold text-forest/70 transition-colors hover:text-forest"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to articles
          </Link>

          <Reveal delay={40} className="mt-6">
            <span className="inline-flex rounded-full border-[1.5px] border-leaf/40 bg-leaf/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-leaf-text">
              {post.category}
            </span>
            <h1 className="mt-4 font-display text-[36px] italic leading-[1.1] text-forest md:text-[48px]">
              {post.title}
            </h1>
            <p className="mt-4 max-w-[62ch] font-body text-[17px] leading-relaxed text-forest/75">
              {post.excerpt}
            </p>
            <p className="mt-5 border-t border-forest/10 pt-5 font-body text-[13.5px] text-forest/75">
              {post.author || "The Fur Finder Team"} · {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {readTime(post.content)}
            </p>
          </Reveal>
        </div>

        {post.image_url ? (
          <Reveal delay={80} className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-[24px] border-[1.5px] border-forest/15 bg-muted md:aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          </Reveal>
        ) : null}

        <div className="mx-auto mt-12 max-w-3xl pb-16 md:pb-20">
          <div className="space-y-6 font-body text-[16px] leading-[1.85] text-forest/85">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>

      {relatedBlogs.length > 0 ? (
        <section className="border-t border-forest/10 bg-muted/60 px-6 py-14 md:py-16">
          <div className="mx-auto max-w-5xl">
            <Reveal as="h2" className="font-display text-[24px] italic text-forest max-md:text-[20px]">
              More articles
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedBlogs.map((blog, i) => (
                <Reveal key={blog.id} delay={i * 60}>
                  <Link href={`/blog/${blog.slug}`} className="group flex flex-col">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-[1.5px] border-forest/15 bg-muted">
                      {blog.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={blog.image_url}
                          alt={blog.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PawPrint size={32} className="text-forest/20" strokeWidth={1.75} />
                        </div>
                      )}
                    </div>
                    <p className="mt-3 font-body text-[11px] font-bold uppercase tracking-widest text-leaf-text">
                      {blog.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-display text-[18px] italic leading-tight text-forest">
                      {blog.title}
                    </h3>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
