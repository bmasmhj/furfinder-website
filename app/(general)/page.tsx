import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import HeroSection from "@/components/marketing/Hero";
import WhoisitFor from "@/components/marketing/WhoIsItFor";
import AIMatchFlow from "@/components/marketing/AIMatchFlow";
import CommunityEcosystem from "@/components/marketing/CommunityEcosystem";
import MobileStickyCTA from "@/components/marketing/MobileStickyCTA";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";
import { db } from "@/lib/db";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";
import { downloadApp } from "@/lib/downloadHandler";

export const metadata: Metadata = {
  title: "The Fur Finder — Australia's AI-Powered Lost & Found Pets App",
  description:
    "Report lost or found pets, review AI-suggested matches, and connect with your community. See current beta and web availability.",
};

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
      'SELECT *, after_image_url AS image_url FROM reunited_stories WHERE is_published = true AND deleted_at IS NULL AND featured_on_homepage = true ORDER BY created_at DESC LIMIT 3'
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
    <div className="bg-cream text-forest">
      <HeroSection />

      {/* Mission Band */}
      <div className="border-y border-forest/10 bg-forest px-6 py-8 text-center">
        <Reveal className="mx-auto max-w-[62ch] font-display text-[19px] italic leading-relaxed text-cream md:text-[21px]">
          <span className="text-amber not-italic font-bold">Every minute counts.</span>{" "}
          We built The Fur Finder because too many lost pets never make it home — not for lack of love, but for lack of the right tools. We&apos;re changing that.
        </Reveal>
      </div>

      <WhoisitFor />
      <AIMatchFlow />
      <CommunityEcosystem />

      {/* Reunited Stories Preview */}
      {stories.length > 0 && (
        <section className="bg-cream px-6 py-24 md:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[34px] italic leading-tight tracking-[-0.01em] text-forest max-md:text-[26px]">
                Recently reunited
              </h2>
              <Link
                href="/reunited-stories"
                className="hidden font-body font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text md:block"
              >
                View all stories →
              </Link>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-3">
              {stories.map((story: any, i: number) => (
                <Reveal
                  key={story.id}
                  delay={i * 80}
                  className={`group overflow-hidden rounded-[16px] border border-forest/10 bg-card ${i === 0 ? "md:col-span-2" : ""}`}
                >
                  {story.image_url && (
                    <div className={`overflow-hidden ${i === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-leaf-text">
                      {story.pet_type}
                    </span>
                    <h3 className="mt-1.5 font-display text-[22px] italic text-forest">
                      {story.pet_name}&apos;s journey home
                    </h3>
                    <p className="mt-2 font-body text-[14.5px] leading-relaxed text-forest/75 line-clamp-3">
                      {story.story_content}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/reunited-stories"
                className="inline-flex w-full items-center justify-center rounded-xl border border-forest/20 bg-card px-7 py-3.5 font-body text-[15px] font-semibold text-forest"
              >
                View All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Preview */}
      <section className="border-y border-forest/10 bg-muted/60 px-6 py-24 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal as="h2" className="font-display text-[34px] italic tracking-[-0.01em] text-forest max-md:text-[26px]">
            Got questions? We have answers.
          </Reveal>
          <Reveal delay={60} className="mx-auto mb-12 mt-3 max-w-[52ch] font-body text-[15.5px] leading-relaxed text-forest/75">
            Here are some of the most frequently asked questions about The Fur Finder.
          </Reveal>

          <Reveal delay={100} className="mb-12 space-y-3 text-left">
            {faqs.length > 0 ? (
              faqs.map((faq: any) => (
                <details
                  key={faq.id}
                  className="group rounded-2xl border border-forest/10 bg-card transition-shadow open:shadow-[0_16px_32px_-24px_hsl(var(--forest)/0.4)] open:border-forest/25"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-body font-semibold text-forest">
                    {faq.question}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest transition-transform group-open:rotate-45 group-open:bg-amber">
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                  </summary>
                  <div className="border-t border-forest/10 px-5 pb-5 pt-4 font-body text-sm leading-relaxed text-forest/75">
                    {faq.answer}
                  </div>
                </details>
              ))
            ) : (
              <p className="text-center text-forest/75">Loading questions...</p>
            )}
          </Reveal>

          <Link
            href="/faq"
            className="inline-flex items-center rounded-xl border border-forest/20 bg-card px-7 py-3.5 font-body text-[15px] font-semibold text-forest transition-colors hover:border-forest/40"
          >
            View All FAQs
          </Link>
        </div>
      </section>

      {/* Download CTA */}
      <section className="bg-forest px-6 py-24 text-center text-cream md:py-28" id="download">
        <Reveal as="h2" className="mb-3 font-display text-[38px] italic tracking-[-0.01em] max-md:text-[28px]">
          Get The Fur Finder
        </Reveal>
        <Reveal delay={60} className="mx-auto mb-9 max-w-[46ch] font-body text-[16px] leading-relaxed text-cream/65">
          View the currently available beta and web access options.
        </Reveal>
        <Reveal delay={120} className="flex flex-wrap justify-center gap-3.5">
          <Magnetic>
            <Link
              href={downloadApp("ios")}
              className="inline-flex items-center gap-3 rounded-xl border-[1.5px] border-cream/20 px-7 py-3 text-cream transition-colors hover:border-amber"
            >
              <Apple className="h-[26px] w-[26px]" />
              <div className="text-left">
                <span className="block font-body text-[10px] font-normal text-cream/70">Download on</span>
                <span className="block font-body text-base font-bold leading-tight">App Store</span>
              </div>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href={downloadApp("android")}
              className="inline-flex items-center gap-3 rounded-xl border-[1.5px] border-cream/20 px-7 py-3 text-cream transition-colors hover:border-amber"
            >
              <PlayStore className="h-[26px] w-[26px]" />
              <div className="text-left">
                <span className="block font-body text-[10px] font-normal text-cream/70">Request access to</span>
                <span className="block font-body text-base font-bold leading-tight">Android Beta</span>
              </div>
            </Link>
          </Magnetic>
        </Reveal>
        <p className="mt-6 font-body text-[13px] text-cream/65">
          Beta capacity and platform availability may change.
        </p>
      </section>

      <MobileStickyCTA />
    </div>
  );
}
