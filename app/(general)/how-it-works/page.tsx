import type { Metadata } from "next";
import {
  PawPrint,
  Camera,
  MapPin,
  Map as MapIcon,
  Search,
  ScanFace,
  Stethoscope,
  BellRing,
  MessageCircle,
  PartyPopper,
} from "lucide-react";
import { featureCards, steps as defaultSteps } from "@/components/marketing/site-content";
import { db } from "@/lib/db";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";
import ProcessFlow from "@/components/marketing/ProcessFlow";

export const metadata: Metadata = {
  title: "How It Works - The Fur Finder",
  description:
    "Learn how The Fur Finder supports lost and found pet reports and suggests possible matches for users to verify.",
};

const FEATURE_ICON_MAP: Record<string, typeof PawPrint> = {
  "📸": Camera,
  "📍": MapPin,
  "🗺️": MapIcon,
  "🔎": Search,
  "📱": ScanFace,
  "🏥": Stethoscope,
  "🔔": BellRing,
  "💬": MessageCircle,
  "🎉": PartyPopper,
};

async function getHowItWorksSteps() {
  try {
    const steps = await db.queryMany(
      'SELECT * FROM how_it_works_steps WHERE is_active = true ORDER BY step_number ASC'
    );
    return steps || [];
  } catch (error) {
    console.error("Error fetching steps:", error);
    return [];
  }
}

export default async function HowitWorks() {
  const databaseSteps = await getHowItWorksSteps();
  const steps = databaseSteps.length > 0 ? databaseSteps : defaultSteps;

  return (
    <div className="bg-cream text-forest">
      {/* Header */}
      <section className="relative overflow-hidden px-6 pb-14 pt-16 md:pb-16 md:pt-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[300px] w-full opacity-[0.5]" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
          <path d="M-40 160 C 300 110, 600 210, 900 150 S 1500 170, 1600 120" stroke="hsl(var(--forest) / 0.06)" strokeWidth="1.5" fill="none" />
        </svg>

        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal as="h1" className="font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] text-forest max-md:text-[32px]">
            Simple steps to <span className="text-coral-text not-italic">reunite.</span>
          </Reveal>
          <Reveal delay={80} className="mx-auto mt-5 max-w-[54ch] font-body text-[17px] leading-relaxed text-forest/75">
            Create a report, review suggested matches, and coordinate carefully with other users, vets, shelters, or councils.
          </Reveal>
          <Reveal delay={140} className="mx-auto mt-8 max-w-[54ch] rounded-2xl border-[1.5px] border-forest/15 bg-card px-6 py-5 text-left">
            <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/55">
              Please note
            </p>
            <p className="mt-1.5 font-body text-[14.5px] leading-relaxed text-forest/80">
              AI and proximity results are suggestions, not proof or guarantees. The Fur Finder does not automatically scan social media. Users must provide or paste content they are authorised to use and verify every potential match.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Steps */}
      <section className="px-6 pb-24 md:pb-28">
        <div className="mx-auto max-w-5xl">
          <ProcessFlow
            steps={steps.map((step: any) => ({
              key: "id" in step ? step.id : step.title,
              title: step.title,
              description: step.description,
            }))}
          />
        </div>
      </section>

      {/* Toolset (dark) */}
      <section className="border-t border-forest/10 bg-forest px-6 py-24 text-cream md:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal as="h2" className="max-w-[18ch] font-display text-[32px] italic leading-[1.1] tracking-[-0.01em] max-md:text-[26px]">
            Tools for every step
          </Reveal>
          <Reveal delay={60} className="mt-3 max-w-[54ch] font-body text-[15px] leading-relaxed text-cream/65">
            These features organise available information and surface possible leads. They do not replace user verification or professional advice.
          </Reveal>

          <div className="mt-14 grid border-t border-cream/15 md:grid-cols-2">
            {featureCards.map((feature, i) => {
              const Icon = FEATURE_ICON_MAP[feature.icon] || PawPrint;
              return (
                <Reveal
                  key={feature.title}
                  delay={(i % 6) * 50}
                  className="flex gap-4 border-b border-cream/15 py-8 pr-6 md:odd:border-r md:odd:pr-10 md:even:pl-10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-cream/25 text-cream">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-display text-[18px] italic leading-tight text-cream">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 font-body text-[14px] leading-relaxed text-cream/65">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="px-6 py-24 md:py-28">
        <Reveal className="mx-auto flex max-w-5xl flex-col items-start gap-8 rounded-[24px] border-[1.5px] border-forest/15 bg-card p-10 md:flex-row md:items-center md:p-14">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
            <Stethoscope className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="font-display text-[28px] italic leading-tight text-forest max-md:text-[24px]">
              Run a clinic, shelter, or rescue team?
            </h2>
            <p className="mt-4 max-w-[58ch] font-body text-[15.5px] leading-relaxed text-forest/75">
              Join The Fur Finder partner network so animals in your care are easier to discover in lost-and-found searches. We support veterinary clinics, shelters, rescue organisations, and councils.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Free Registration", "AI Match Integration", "Public Directory"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-[1.5px] border-leaf/40 bg-leaf/10 px-3.5 py-1 font-body text-[12px] font-bold text-leaf-text"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Magnetic className="mt-7">
              <a
                href="https://partners.thefurfinder.com/partner/signup"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-body text-[15px] font-bold text-forest"
              >
                Start partner intake
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
