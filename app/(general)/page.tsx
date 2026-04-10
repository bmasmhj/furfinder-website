import type { Metadata } from "next";
import Link from "next/link";
import styles from "./landing-page.module.css";
import HeroSection from "@/components/marketing/Hero";
import WhoisitFor from "@/components/marketing/WhoIsItFor";

export const metadata: Metadata = {
  title: "The Fur Finder — Australia's AI-Powered Lost & Found Pets App",
  description:
    "Report lost or found pets, get instant AI photo matching, and connect with your community to bring pets home. Available on iOS and Android.",
};

const appStoreUrl = "https://apps.apple.com/app/id6759967208";
const playStoreUrl =
  "https://play.google.com/store/apps/details?id=com.petreunite.app";

import { db } from "@/lib/db";

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
    <div className={styles.page}>
      <HeroSection />

      <div className="mission-band ">
        <p className="!text-white">
          <strong>Every minute counts.</strong> We built The Fur Finder because
          too many lost pets never make it home — not for lack of love, but for
          lack of the right tools. We're changing that.
        </p>
      </div>

      <WhoisitFor />

      {/* Reunited Stories Preview */}
      {stories.length > 0 && (
        <section className="section bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="section-label teal">Success Stories</span>
                <h2 className="section-title">Recently Reunited</h2>
              </div>
              <Link
                href="/reunited-stories"
                className="text-[#ff6b4a] font-semibold hover:underline hidden md:block"
              >
                View All Stories →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {stories.map((story: any) => (
                <div
                  key={story.id}
                  className="story-card-preview card-bg border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {story.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={story.image_url}
                        alt={story.pet_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">
                      {story.pet_name}&apos;s Journey
                    </h3>
                    <p className="text-[#6b7280] text-sm line-clamp-3 mb-4">
                      {story.story_content}
                    </p>
                    <span className="text-xs font-medium text-[#ff6b4a] uppercase tracking-wider">
                      {story.pet_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/reunited-stories" className="btn-secondary w-full">
                View All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Preview */}
      <section className="section faq-preview-section bg-surface-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="section-label">Common Questions</span>
          <h2 className="section-title">Got questions? We have answers.</h2>
          <p className="section-desc mb-12">
            Here are some of the most frequently asked questions about The Fur
            Finder.
          </p>

          <div className="faq-list mb-12 text-left">
            {faqs.length > 0 ? (
              faqs.map((faq: any) => (
                <details
                  key={faq.id}
                  className="card-bg border rounded-xl mb-3"
                >
                  <summary className="p-5 font-semibold cursor-pointer list-none flex justify-between items-center">
                    {faq.question}
                    <span className="text-[#ff6b4a]">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-[#6b7280] text-sm border-t border-[#f3f4f6] pt-4 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))
            ) : (
              <p className="text-center text-[#6b7280]">Loading questions...</p>
            )}
          </div>

          <Link href="/faq" className="btn-secondary inline-flex">
            View All FAQs
          </Link>
        </div>
      </section>

      <section className={styles.ctaSection} id="download">
        <h2>Download The Fur Finder — Free</h2>
        <p>
          Every pet deserves the best chance of getting home. Join thousands of
          Australians already using The Fur Finder to report, search, and
          reunite.
        </p>
        <div className={styles.storeBadges}>
          <a
            href={appStoreUrl}
            className={styles.storeBadge}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className={styles.storeMeta}>
              <span className={styles.storeSmall}>Download on the</span>
              <span className={styles.storeName}>App Store</span>
            </div>
          </a>
          <a
            href={playStoreUrl}
            className={styles.storeBadge}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className={styles.storeMeta}>
              <span className={styles.storeSmall}>Get it on</span>
              <span className={styles.storeName}>Google Play</span>
            </div>
          </a>
        </div>
        <p className={styles.ctaTagline}>
          Free to download · iOS &amp; Android · No account needed to browse
        </p>
      </section>
    </div>
  );
}
