"use client";

import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreedRecommendationCardProps {
  breed: string;
  matchScore: number;
  matchLabel: "Excellent Match" | "Great Match" | "Good Match";
  benefits?: string[];
  featured?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function getMatchColor(score: number): string {
  if (score >= 85) return "text-leaf/90";
  if (score >= 70) return "text-amber";
  return "text-coral-text";
}

function getMatchBgColor(score: number): string {
  if (score >= 85) return "bg-leaf/10";
  if (score >= 70) return "bg-amber/10";
  return "bg-coral/10";
}

function formatBreedName(breed: string) {
  return breed.replace(/_/g, " ");
}

export function BreedRecommendationCard({
  breed,
  matchScore,
  matchLabel,
  benefits = [],
  featured = false,
  isExpanded = false,
  onToggleExpand,
}: BreedRecommendationCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animate score on mount
  const handleMouseEnter = () => {
    if (!hasAnimated) {
      let current = 0;
      const target = matchScore;
      const increment = target / 20;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(Math.round(target));
          clearInterval(interval);
          setHasAnimated(true);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, 15);
    }
  };

  if (featured) {
    return (
      <div className="relative rounded-2xl border-[1.5px] border-amber/40 bg-gradient-to-br from-amber/5 via-background to-background p-6 shadow-[0_8px_16px_-2px_hsl(var(--amber)/0.15)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber/20 px-3 py-1">
              <Star size={14} className="fill-amber text-amber" />
              <span className="font-body text-xs font-semibold text-amber">Best Match</span>
            </div>
            <h3 className="font-display text-2xl italic capitalize text-forest">{formatBreedName(breed)}</h3>
            <p className="mt-1 font-body text-sm text-forest/70">{matchLabel}</p>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl italic text-forest">{Math.round(matchScore)}%</div>
            <p className="text-xs uppercase tracking-wide text-forest/60">match</p>
          </div>
        </div>

        {benefits.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {benefits.slice(0, 3).map((benefit) => (
              <span key={benefit} className="rounded-lg bg-forest/10 px-3 py-1.5 font-body text-xs font-semibold capitalize text-forest">
                {benefit}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-4 w-full rounded-lg bg-amber px-4 py-2.5 font-body text-sm font-semibold text-forest transition-all hover:shadow-[0_8px_12px_-2px_hsl(var(--amber)/0.4)]"
        >
          Learn More
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleExpand}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group relative w-full rounded-xl border-[1.5px] p-4 text-left transition-all duration-200",
        isExpanded
          ? "border-amber bg-amber/5 shadow-[0_12px_24px_-6px_hsl(var(--amber)/0.15)]"
          : "border-forest/15 bg-card hover:border-amber/50 hover:shadow-[0_8px_16px_-2px_hsl(var(--amber)/0.1)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-display text-lg italic capitalize text-forest">{formatBreedName(breed)}</h4>
          <p className="mt-0.5 font-body text-xs font-medium text-forest/60">{matchLabel}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("font-display text-xl italic transition-colors duration-300", getMatchColor(matchScore))}>
            {hasAnimated ? animatedScore : Math.round(matchScore)}%
          </div>
          <p className="text-xs uppercase tracking-wide text-forest/50">match</p>
        </div>
      </div>

      {benefits.length > 0 && (
        <div className={cn("mt-3 flex flex-wrap gap-1.5 transition-all duration-200", isExpanded ? "opacity-100" : "opacity-70")}>
          {benefits.map((benefit) => (
            <span key={benefit} className="rounded-md bg-muted px-2 py-1 font-body text-xs font-medium capitalize text-forest/70">
              {benefit}
            </span>
          ))}
        </div>
      )}

      {onToggleExpand && (
        <div className="absolute right-4 top-4 rounded-lg bg-background p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <ChevronDown size={16} className={cn("text-forest/50 transition-transform", isExpanded && "rotate-180")} />
        </div>
      )}
    </button>
  );
}
