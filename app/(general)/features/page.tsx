import type { Metadata } from "next";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { PawPrint } from "lucide-react";
import { db } from "@/lib/db";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";
import { appFeatureSections } from "@/components/marketing/site-content";

export const metadata: Metadata = {
  title: "Features - The Fur Finder",
  description:
    "Explore the feature set behind The Fur Finder lost and found pet platform.",
};

function stripNumbering(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

function iconFor(name: string | null | undefined) {
  if (!name) return PawPrint;
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const icon = (LucideIcons as unknown as Record<string, typeof PawPrint>)[pascalName];
  return icon || PawPrint;
}

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
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-20 md:pt-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[320px] w-full opacity-[0.5]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M-40 60 C 300 15, 600 105, 900 45 S 1500 65, 1600 25" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
          <path d="M-40 180 C 300 130, 600 230, 900 170 S 1500 190, 1600 140" stroke="hsl(var(--forest) / 0.06)" strokeWidth="1.5" fill="none" />
        </svg>

        <div className="relative mx-auto max-w-4xl">
          <Reveal as="h1" className="max-w-[20ch] font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] text-forest max-md:text-[32px]">
            A complete toolkit for lost and found pet recovery.
          </Reveal>
          <Reveal delay={80} className="mt-5 max-w-[56ch] font-body text-[17px] leading-relaxed text-forest/75">
            Every feature is designed with one goal in mind: reuniting lost pets with their families faster.
          </Reveal>
          <Reveal delay={140} className="mt-4">
            <a href="#full-spec" className="font-body text-[14px] font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text">
              Prefer the full spec sheet? Jump to the details ↓
            </a>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-28">
        <div className="mx-auto max-w-5xl">
          {features.length > 0 ? (
            <div className="grid border-t border-forest/10 md:grid-cols-2">
              {features.map((feature: any, i: number) => {
                const Icon = iconFor(feature.icon);
                return (
                  <Reveal
                    key={feature.id}
                    delay={(i % 6) * 60}
                    className={`flex gap-4 border-b border-forest/10 py-8 pr-6 md:odd:border-r md:odd:pr-10 md:even:pl-10`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="font-display text-[19px] italic leading-tight text-forest">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 font-body text-[14.5px] leading-relaxed text-forest/75">
                        {feature.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <p className="text-center font-body text-forest/75">
              No features available at the moment.
            </p>
          )}
        </div>
      </section>

      <section id="full-spec" className="scroll-mt-24 border-t border-forest/10 bg-muted/60 px-6 py-24 md:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal as="h2" className="max-w-[22ch] font-display text-[32px] italic leading-[1.1] tracking-[-0.01em] text-forest max-md:text-[26px]">
            The full feature list
          </Reveal>
          <Reveal delay={60} className="mt-3 max-w-[52ch] font-body text-[15px] leading-relaxed text-forest/75">
            Every detail behind the highlights above, organised by area.
          </Reveal>

          <div className="mt-14 flex flex-col gap-16">
            {appFeatureSections.map((section) => (
              <div key={section.title}>
                <Reveal as="h3" className="font-display text-[24px] italic leading-tight text-forest">
                  {stripNumbering(section.title)}
                </Reveal>

                {section.intro && (
                  <Reveal delay={40} className="mt-3 max-w-[62ch] font-body text-[15px] leading-relaxed text-forest/75">
                    {section.intro}
                  </Reveal>
                )}

                {section.highlight && (
                  <Reveal delay={80} className="mt-5 max-w-[62ch] rounded-2xl border-[1.5px] border-forest/15 bg-card px-6 py-5">
                    <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/55">
                      {section.highlight.title}
                    </p>
                    <p className="mt-1.5 font-body text-[15px] leading-relaxed text-forest/80">
                      {section.highlight.body}
                    </p>
                  </Reveal>
                )}

                {section.items && (
                  <div className="mt-8 grid border-t border-forest/10 md:grid-cols-2">
                    {section.items.map((item, i) => (
                      <Reveal
                        key={item.title}
                        delay={(i % 6) * 50}
                        className="border-b border-forest/10 py-6 pr-6 md:odd:border-r md:odd:pr-10 md:even:pl-10"
                      >
                        <h4 className="font-display text-[17px] italic leading-tight text-forest">
                          {item.title}
                        </h4>
                        <p className="mt-1.5 font-body text-[14px] leading-relaxed text-forest/75">
                          {item.body}
                        </p>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-forest/10 bg-forest px-6 py-16 text-center text-cream md:py-20">
        <Reveal as="h2" className="font-display text-[28px] italic tracking-[-0.01em] max-md:text-[24px]">
          See it in action
        </Reveal>
        <Reveal delay={60} className="mx-auto mt-2 max-w-[46ch] font-body text-[15px] leading-relaxed text-cream/65">
          Every feature above works together the moment a report goes live.
        </Reveal>
        <Reveal delay={120} className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <a
              href="https://app.thefurfinder.com"
              className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-3.5 font-body text-[15px] font-bold text-forest"
            >
              Report a Lost Pet
            </a>
          </Magnetic>
          <Magnetic>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-cream/25 px-7 py-3.5 font-body text-[15px] font-bold text-cream transition-colors hover:border-cream/50"
            >
              See How It Works
            </Link>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
