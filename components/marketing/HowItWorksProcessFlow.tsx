"use client";

import { useEffect, useState } from "react";
import { FileEdit, ScanSearch, HeartHandshake, PawPrint } from "lucide-react";
import Reveal from "./Reveal";

type Step = {
  key: string;
  title: string;
  description: string;
};

const STEP_ICONS = [FileEdit, ScanSearch, HeartHandshake];

export default function HowItWorksProcessFlow({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (steps.length < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % steps.length), 2600);
    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <div className="relative">
      <div
        className="absolute left-6 top-8 bottom-8 w-px bg-forest/12 md:left-0 md:right-0 md:top-8 md:h-px md:w-auto md:bottom-auto"
        style={{ display: steps.length < 2 ? "none" : undefined }}
      />

      <div
        className={`grid grid-cols-1 gap-x-8 gap-y-10 ${
          steps.length === 1 ? "md:grid-cols-1" : steps.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i] || PawPrint;
          const isActive = i === active;
          return (
            <Reveal
              key={step.key}
              delay={i * 90}
              className="relative flex gap-4 pl-16 md:flex-col md:gap-0 md:pl-0 md:text-center"
            >
              <span
                className={`absolute left-0 top-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[1.5px] transition-all duration-500 ease-expo md:static md:mx-auto md:mb-4 ${
                  isActive
                    ? "border-amber bg-amber text-forest scale-110 shadow-[0_0_0_6px_hsl(var(--amber)/0.16)]"
                    : "border-forest/20 bg-cream text-forest/70"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-forest/45">
                  Step {i + 1}
                </p>
                <h3 className={`mt-1 font-display text-[20px] italic leading-tight transition-colors ${isActive ? "text-coral-text" : "text-forest"}`}>
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-[14.5px] leading-relaxed text-forest/75">{step.description}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
