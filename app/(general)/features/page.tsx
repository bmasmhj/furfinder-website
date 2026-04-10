import type { Metadata } from "next";
import { MarketingSection } from "@/components/marketing/MarketingPrimitives";

export const metadata: Metadata = {
  title: "Features - The Fur Finder",
  description:
    "Explore the feature set behind The Fur Finder lost and found pet platform.",
};

import { db } from "@/lib/db";

async function getFeatures() {
  try {
    const features = await db.queryMany(
      'SELECT *, icon_name AS icon FROM features WHERE is_active = true ORDER BY display_order ASC'
    );
    return features || [];
  } catch (error) {
    console.error("Error fetching features:", error);
    return [];
  }
}



export default async function FeaturesPage() {
  const features = await getFeatures();

  return (
    <div className="min-h-screen">
      <section className="section mx-auto max-w-7xl">
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
          A complete toolkit for lost and found pet recovery.
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#6b7280]">
          Every feature is designed with one goal in mind: reuniting lost pets
          with their families faster.
        </p>
      </section>

      <MarketingSection>
        {features.length > 0 ? (
          <div className="features-grid">
            {features.map((feature: any) => (
              <article key={feature.id} className="feature-card">
                {feature.icon && (
                  <div className="feature-icon">{feature.icon}</div>
                )}
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#6b7280]">
            No features available at the moment.
          </p>
        )}
      </MarketingSection>
    </div>
  );
}
