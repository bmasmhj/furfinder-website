import type { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/components/marketing/Hero";
import WhoisitFor from "@/components/marketing/WhoIsItFor";
import { db } from "@/lib/db";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";

export const metadata: Metadata = {
  title: "The Fur Finder — Australia's AI-Powered Lost & Found Pets App",
  description:
    "Report lost or found pets, get instant AI photo matching, and connect with your community to bring pets home. Available on iOS and Android.",
};

const appStoreUrl = "https://apps.apple.com/app/id6759967208";
const playStoreUrl =
  "https://play.google.com/store/apps/details?id=com.petreunite.app";

async function getFaqs() {
  try {
    const faqs = await db.queryMany(
      'SELECT * FROM faqs WHERE is_active = true ORDER BY display_order ASC LIMIT 4'
    );
    return faqs || [];
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

async function getFeaturedStories() {
  try {
    const stories = await db.queryMany(
      'SELECT *, after_image_url AS image_url FROM reunited_stories WHERE is_published = true AND featured_on_homepage = true ORDER BY created_at DESC LIMIT 3'
    );
    return stories || [];
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export default async function HomePage() {
  const [faqs, stories] = await Promise.all([getFaqs(), getFeaturedStories()]);

  return (
    <div className="bg-background text-foreground">
      <HeroSection />

      {/* Mission Band */}
      <div className="bg-gradient-to-r from-primary via-[#FF8A6E] to-teal-500 px-6 py-5 text-center">
        <p className="mx-auto max-w-[700px] text-[15px] font-medium leading-relaxed text-white opacity-[0.97]">
          <strong>Every minute counts.</strong> We built The Fur Finder because
          too many lost pets never make it home — not for lack of love, but for
          lack of the right tools. We&apos;re changing that.
        </p>
      </div>

      <WhoisitFor />

      {/* Reunited Stories Preview */}
      {stories.length > 0 && (
        <section className="bg-background px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-600 dark:text-teal-400">
                  Success Stories
                </span>
                <h2 className="text-[30px] font-bold tracking-[-0.5px] text-foreground">
                  Recently Reunited
                </h2>
              </div>
              <Link
                href="/reunited-stories"
                className="hidden font-semibold text-primary hover:underline md:block"
              >
                View All Stories →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {stories.map((story: any) => (
                <div
                  key={story.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
                >
                  {story.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {story.pet_name}&apos;s Journey
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {story.story_content}
                    </p>
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      {story.pet_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/reunited-stories"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-7 py-3.5 text-[15px] font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
              >
                View All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Preview */}
      <section className="border-y border-border bg-muted/50 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            Common Questions
          </span>
          <h2 className="text-[30px] font-bold tracking-[-0.5px] text-foreground">
            Got questions? We have answers.
          </h2>
          <p className="mx-auto mb-12 mt-2.5 max-w-[580px] text-[15px] leading-[1.7] text-muted-foreground">
            Here are some of the most frequently asked questions about The Fur Finder.
          </p>

          <div className="mb-12 space-y-3 text-left">
            {faqs.length > 0 ? (
              faqs.map((faq: any) => (
                <details
                  key={faq.id}
                  className="group rounded-xl border border-border bg-card transition-shadow open:shadow-md open:border-primary/20"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-semibold text-foreground">
                    {faq.question}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary transition-transform group-open:rotate-45 group-open:bg-primary group-open:text-white">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-border px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Loading questions...</p>
            )}
          </div>

          <Link
            href="/faq"
            className="inline-flex items-center rounded-xl border border-border bg-card px-7 py-3.5 text-[15px] font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
          >
            View All FAQs
          </Link>
        </div>
      </section>

      {/* Download CTA */}
      <section className="bg-gradient-to-br from-[#1A1A2E] to-[#2d2d4a] px-6 py-[90px] text-center text-white" id="download">
        <h2 className="mb-3 text-[34px] font-extrabold tracking-[-1px] max-md:text-[26px]">
          Download The Fur Finder — Free
        </h2>
        <p className="mx-auto mb-9 max-w-[500px] text-base leading-[1.7] text-white/70">
          Every pet deserves the best chance of getting home. Join thousands of
          Australians already using The Fur Finder to report, search, and
          reunite.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <a
            href={appStoreUrl}
            className="inline-flex items-center gap-3 rounded-[14px] border-[1.5px] border-white/15 bg-white/[0.08] px-7 py-3 text-white backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.14]"
            target="_blank"
            rel="noreferrer"
          >
            <Apple className="h-[26px] w-[26px]" />
            <div className="text-left">
              <span className="block text-[10px] font-normal opacity-65">Download on the</span>
              <span className="block text-base font-bold leading-tight">App Store</span>
            </div>
          </a>
          <a
            href={playStoreUrl}
            className="inline-flex items-center gap-3 rounded-[14px] border-[1.5px] border-white/15 bg-white/[0.08] px-7 py-3 text-white backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.14]"
            target="_blank"
            rel="noreferrer"
          >
            <PlayStore className="h-[26px] w-[26px]" />
            <div className="text-left">
              <span className="block text-[10px] font-normal opacity-65">Get it on</span>
              <span className="block text-base font-bold leading-tight">Google Play</span>
            </div>
          </a>
        </div>
        <p className="mt-6 text-[13px] text-white/40">
          Free to download · iOS &amp; Android · No account needed to browse
        </p>
      </section>
    </div>
  );
}
