"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface ProcessingStep {
  id: string;
  label: string;
  duration: number;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: "understanding", label: "Understanding your lifestyle", duration: 1200 },
  { id: "comparing", label: "Comparing hundreds of breeds", duration: 1500 },
  { id: "matching", label: "Matching personality traits", duration: 1300 },
  { id: "finding", label: "Finding adoptable pets", duration: 1400 },
];

export function AIProcessingState() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    let currentIndex = 0;
    const timers: NodeJS.Timeout[] = [];

    const completeStep = () => {
      const step = PROCESSING_STEPS[currentIndex];
      if (step) {
        setCompletedSteps((prev) => new Set([...prev, step.id]));
        currentIndex++;
        if (currentIndex < PROCESSING_STEPS.length) {
          const nextTimer = setTimeout(completeStep, step.duration);
          timers.push(nextTimer);
        }
      }
    };

    const firstTimer = setTimeout(completeStep, 300);
    timers.push(firstTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="space-y-4">
      {PROCESSING_STEPS.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isActive = completedSteps.size === index;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                isCompleted
                  ? "bg-leaf/90 text-cream"
                  : isActive
                    ? "bg-amber animate-pulse text-forest"
                    : "bg-muted text-forest/30"
              }`}
            >
              {isCompleted ? (
                <Check size={16} className="animate-in zoom-in-50 duration-300" />
              ) : isActive ? (
                <div className="h-2 w-2 rounded-full bg-forest/50 animate-pulse" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full" />
              )}
            </div>
            <span
              className={`font-body text-sm transition-colors duration-300 ${
                isCompleted ? "text-forest font-medium" : isActive ? "text-forest font-medium" : "text-forest/50"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}

      <div className="mt-8 flex justify-center">
        <div className="relative">
          <div className="h-8 w-8 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-amber" />
          </div>
        </div>
      </div>
    </div>
  );
}
