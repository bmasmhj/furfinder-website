"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AiSuggestionPanel } from "./AiSuggestionPanel";

export function AdoptionHero() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-orange-50/50 to-teal-50/30 px-6 py-16 dark:from-background dark:via-orange-950/10 dark:to-teal-950/10">
        <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,74,0.07)_0%,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex max-w-fit items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            &#x1F43E; Adopt, don&apos;t shop
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-[-1.5px] text-foreground md:text-6xl">
            Find your new best friend
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-[1.75] text-muted-foreground max-md:text-[15px]">
            Browse adoptable pets from shelters and rescues across Australia — or let us help you narrow it
            down.
          </p>
          <button
            type="button"
            onClick={() => setAiOpen((open) => !open)}
            aria-expanded={aiOpen}
            aria-controls="ai-suggestion-panel"
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(255,107,74,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#e5553a] hover:shadow-[0_8px_24px_rgba(255,107,74,0.35)]"
          >
            <Sparkles size={18} />
            {aiOpen ? "Hide AI suggestion" : "Confused? Try our AI suggestion"}
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <AiSuggestionPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    </>
  );
}
