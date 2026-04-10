import type { Metadata } from "next";
import { featureCards } from "@/components/marketing/site-content";

export const metadata: Metadata = {
  title: "How It Works - The Fur Finder",
  description:
    "Learn how The Fur Finder helps reunite lost pets with their families in just three simple steps, powered by AI technology.",
};

import { db } from "@/lib/db";

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
  const steps = await getHowItWorksSteps();

  return (
    <div className="bg-surface">
      {/* Header */}
      <section className="px-6 py-24 text-center bg-surface-secondary">
        <div className="max-w-3xl mx-auto">
          <span className="section-label">The Process</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1a1a2e] mt-4 mb-6">
            Simple steps to <span className="text-[#ff6b4a]">reunite.</span>
          </h1>
          <p className="text-xl text-[#6b7280] leading-relaxed">
            Our technology does the heavy lifting so you can focus on bringing
            your pet home safely.
          </p>
        </div>
      </section>

      {/* Main Steps */}
      <section className="section max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3  gap-12">
          {steps.length > 0 ? (
            steps.map((step: any, index: number) => (
              <div
                key={step.id}
                className="relative p-8 rounded-3xl border card-bg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-[#ff6b4a] text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-lg shadow-[#ff6b4a]/20">
                  {step.step_number || index + 1}
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-4">
                  {step.title}
                </h3>
                <p className="text-[#6b7280] leading-relaxed">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[60px] -right-8 z-10 text-4xl text-[#ff6b4a]/20">
                    →
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-[#6b7280]">
              Process details coming soon.
            </div>
          )}
        </div>
      </section>

      {/* Integrated Features Section */}
      <section className="bg-[#1a1a2e] text-white py-24 px-6 rounded-[40px] md:rounded-[80px] mx-4 md:mx-8 mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b4a] opacity-10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2cbcb6] opacity-10 blur-[120px] rounded-full -ml-48 -mb-48"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="section-label !bg-white/10 !text-white">
              Smart Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
              Tools for every step
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Each feature is designed to support the reunification workflow and
              maximize the chances of a happy ending.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${feature.iconClassName || "bg-white/10"}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#ff6b4a] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vets and Shelters */}
      <section className="section max-w-7xl mx-auto px-6 pb-24">
        <div className="partner-section !bg-[#f0fdfc] border !border-[#2cbcb6]/20 p-12 rounded-[32px] md:flex items-center gap-12">
          <div className="partner-icon-wrap !bg-[#2cbcb6] !text-white text-5xl !rounded-[24px] mb-8 md:mb-0">
            🏥
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-4">
              Are you a Vet or Shelter?
            </h2>
            <p className="text-[#6b7280] text-lg mb-8 leading-relaxed">
              Register as an official partner to have the animals in your care
              automatically included in AI matching results. Help connect owners
              to their pets faster than ever.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="partner-tag !bg-white !border-[#2cbcb6]/30 !text-[#2cbcb6] font-bold">
                Free Registration
              </span>
              <span className="partner-tag !bg-white !border-[#2cbcb6]/30 !text-[#2cbcb6] font-bold">
                AI Match Integration
              </span>
              <span className="partner-tag !bg-white !border-[#2cbcb6]/30 !text-[#2cbcb6] font-bold">
                Public Directory
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
