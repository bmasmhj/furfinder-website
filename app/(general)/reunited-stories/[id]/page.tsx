import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Flag, MapPin } from "lucide-react";
import { supportEmail } from "@/components/marketing/site-content";
import { db } from "@/lib/db";
import { isSafeHttpsUrl } from "@/lib/external-url";

type Story = {
  id: string;
  slug: string;
  pet_name: string;
  pet_type: string;
  owner_name: string;
  story_title: string;
  story_content: string;
  before_image_url: string | null;
  after_image_url: string | null;
  reunion_date: string | Date;
  lost_duration_days: number | null;
  location_lost: string | null;
  location_found: string | null;
  how_they_reunited: string | null;
};

async function getPublishedStory(id: string): Promise<Story | null> {
  try {
    return await db.queryOne<Story>(
      `SELECT id, slug, pet_name, pet_type, owner_name, story_title, story_content,
        before_image_url, after_image_url, reunion_date, lost_duration_days,
        location_lost, location_found, how_they_reunited
       FROM reunited_stories
       WHERE (id::text = $1 OR slug = $1)
         AND is_published = true
         AND deleted_at IS NULL
       LIMIT 1`,
      [id]
    );
  } catch (error) {
    console.error("Error fetching reunited story:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await getPublishedStory(id);

  if (!story) {
    return {
      title: "Story Unavailable - The Fur Finder",
      description: "This reunited story is no longer available.",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${story.story_title} - The Fur Finder`,
    description: `Read ${story.pet_name}'s community-submitted reunion story.`,
  };
}

function StoryUnavailable({ id }: { id: string }) {
  const reportHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    `Reunited story report: ${id}`
  )}`;

  return (
    <main className="min-h-screen bg-background px-6 py-24 text-center text-foreground">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 md:p-12">
        <h1 className="text-3xl font-extrabold tracking-tight">This story is unavailable</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          It may have been deleted, unpublished, moderated, or the link may be incorrect. We do not display unavailable user content.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/reunited-stories"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            Browse published stories
          </Link>
          <a
            href={reportHref}
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            Report a content concern
          </a>
          <Link
            href="/support"
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function ReunitedStoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getPublishedStory(id);

  if (!story) {
    return <StoryUnavailable id={id} />;
  }

  const images = [
    { url: story.before_image_url, label: "Before reunion" },
    { url: story.after_image_url, label: "After reunion" },
  ].filter((image): image is { url: string; label: string } =>
    Boolean(image.url && isSafeHttpsUrl(image.url))
  );
  const reportHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    `Report reunited story: ${story.id}`
  )}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-b from-orange-50 to-background px-6 py-12 dark:from-orange-950/20">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/reunited-stories"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to stories
          </Link>
          <span className="mt-8 block text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            Community-submitted reunion story
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">
            {story.story_title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(story.reunion_date).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {story.lost_duration_days != null ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {story.lost_duration_days} days missing
              </span>
            ) : null}
            {story.location_lost ? (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {story.location_lost}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        {images.length > 0 ? (
          <div className={`mb-10 grid gap-4 ${images.length > 1 ? "md:grid-cols-2" : ""}`}>
            {images.map((image) => (
              <figure key={image.label} className="overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={image.url}
                  alt={`${story.pet_name}: ${image.label}`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <article>
            <div className="space-y-5 text-[15px] leading-8 text-foreground/80">
              {story.story_content.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {story.how_they_reunited ? (
              <section className="mt-10 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6">
                <h2 className="text-lg font-bold">How they reunited</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{story.how_they_reunited}</p>
              </section>
            ) : null}
          </article>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold">Story details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-muted-foreground">Pet</dt><dd className="font-medium">{story.pet_name}</dd></div>
                <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium">{story.pet_type}</dd></div>
                <div><dt className="text-muted-foreground">Submitted by</dt><dd className="font-medium">{story.owner_name}</dd></div>
                {story.location_found ? (
                  <div><dt className="text-muted-foreground">Found near</dt><dd className="font-medium">{story.location_found}</dd></div>
                ) : null}
              </dl>
            </section>
            <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm leading-7 text-amber-950 dark:text-amber-100">
              Community stories describe individual experiences. They are not guarantees that a feature or matching suggestion will produce the same outcome.
            </section>
            <a
              href={reportHref}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              <Flag className="h-4 w-4" />
              Report this content
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
