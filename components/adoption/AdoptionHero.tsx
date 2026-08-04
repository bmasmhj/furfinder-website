"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AiSuggestionPanel } from "./AiSuggestionPanel";
import Reveal from "@/components/marketing/Reveal";
import Magnetic from "@/components/marketing/Magnetic";

export function AdoptionHero() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <section className={`relative overflow-hidden bg-cream transition-all duration-700 ${aiOpen ? "pb-0 pt-0" : "px-6 pb-16 pt-14 md:pb-20 md:pt-20"}`}>
        {!aiOpen && (
          <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[320px] w-full opacity-[0.5]" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M-40 60 C 300 15, 600 105, 900 45 S 1500 65, 1600 25" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
          </svg>
        )}

        <div className={`relative transition-all duration-700 ${aiOpen ? "opacity-0" : "opacity-100"}`}>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center py-14 md:py-20">
            <Reveal className="flex items-center gap-2 font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-forest/75">
              Thousands of pets, waiting
            </Reveal>

            <Reveal delay={60} as="h1" className="max-w-[16ch] font-display text-[44px] italic leading-[1.08] tracking-[-0.02em] text-forest max-md:text-[32px]">
              Find your <span className="text-coral-text not-italic">new best friend.</span>
            </Reveal>

            <Reveal delay={120} className="max-w-[46ch] font-body text-[17px] leading-[1.7] text-forest/75 max-md:text-[16px]">
              Browse adoptable pets from shelters and rescues across Australia — or let us help you narrow it down.
            </Reveal>

            <Reveal delay={180} className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-4 font-body text-[15.5px] font-bold text-forest shadow-[0_14px_28px_-14px_hsl(var(--amber)/0.75)] transition-shadow hover:shadow-[0_18px_34px_-14px_hsl(var(--amber)/0.85)]"
                >
                  <Sparkles size={18} />
                  Find with AI
                </button>
              </Magnetic>
              <a
                href="#pet-grid"
                className="font-body text-[14.5px] font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text"
              >
                Or browse everyone below ↓
              </a>
            </Reveal>
          </div>
        </div>

        {aiOpen && (
          <div className="opacity-100 transition-opacity duration-700">
            <AiSuggestionPanel open={aiOpen} onClose={() => setAiOpen(false)} isHeroMode />
          </div>
        )}
      </section>
    </>
  );
}
