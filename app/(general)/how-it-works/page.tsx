import type { Metadata } from "next";
import Link from "next/link";
import { featureCards, steps as defaultSteps } from "@/components/marketing/site-content";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "How It Works - The Fur Finder",
  description:
    "Learn how The Fur Finder supports lost and found pet reports and suggests possible matches for users to verify.",
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
    <div className="bg-background">
      {/* Header */}
      <section className="bg-muted/50 px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            The Process
          </span>
          <h1 className="mt-4 mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
            Simple steps to <span className="text-primary">reunite.</span>
          </h1>
          <p className="text-xl leading-relaxed text-muted-foreground">
            Create a report, review suggested matches, and coordinate carefully
            with other users, vets, shelters, or councils.
          </p>
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-left text-sm leading-7 text-amber-900 dark:text-amber-200">
            AI and proximity results are suggestions, not proof or guarantees. The Fur Finder does not automatically scan social media. Users must provide or paste content they are authorised to use and verify every potential match.
          </div>
        </div>
      </section>

      {/* Main Steps */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-3">
          {steps.length > 0 ? (
            steps.map((step: any, index: number) => (
              <div
                key={"id" in step ? step.id : step.title}
                className="relative rounded-3xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white shadow-lg shadow-primary/20">
                  {"step_number" in step ? step.step_number || index + 1 : index + 1}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute -right-8 top-[60px] z-10 hidden text-4xl text-primary/20 lg:block">
                    →
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-muted-foreground">
              Process details coming soon.
            </div>
          )}
        </div>
      </section>

      {/* Features Section (Dark) */}
      <section className="relative mx-4 mb-24 overflow-hidden rounded-[40px] bg-[#1A1A2E] px-6 py-24 text-white md:mx-8 md:rounded-[80px]">
        <div className="pointer-events-none absolute -mr-48 -mt-48 right-0 top-0 h-96 w-96 rounded-full bg-primary opacity-10 blur-[120px]" />
        <div className="pointer-events-none absolute -mb-48 -ml-48 bottom-0 left-0 h-96 w-96 rounded-full bg-teal-500 opacity-10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
              Smart Features
            </span>
            <h2 className="mt-4 mb-6 text-3xl font-bold md:text-5xl">
              Tools for every step
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/60">
              These features organise available information and surface possible
              leads. They do not replace user verification or professional advice.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${feature.iconClassName || "bg-white/10"}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col items-center gap-12 rounded-[32px] border border-teal-500/20 bg-gradient-to-br from-teal-50 to-orange-50 p-12 dark:from-teal-950/20 dark:to-orange-950/10 md:flex-row">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[24px] bg-teal-500 text-5xl text-white">
            🏥
          </div>
          <div>
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Run a clinic, shelter, or rescue team?
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Join The Fur Finder partner network so animals in your care are
              easier to discover in lost-and-found searches. We support
              veterinary clinics, shelters, rescue organisations, and councils.
            </p>
            <div className="mb-6 flex flex-wrap gap-3">
              {["Free Registration", "AI Match Integration", "Public Directory"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-teal-500/30 bg-white px-3.5 py-1 text-xs font-bold text-teal-600 dark:bg-teal-950/20 dark:text-teal-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href="/partner-registration"
              className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e5553a]"
            >
              Start partner intake
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
