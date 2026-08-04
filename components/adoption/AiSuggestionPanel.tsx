"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PetCard, type PetCardAnimal } from "./PetCard";
import { AIProcessingState } from "./AIProcessingState";
import { BreedRecommendationCard } from "./BreedRecommendationCard";
import {
  CriteriaForm,
  DEFAULT_CRITERIA,
  DEFAULT_TIME_AVAILABILITY,
  TIME_AVAILABILITY_TO_HOURS_AWAY,
  type AdoptionCriteria,
  type TimeAvailability,
} from "./CriteriaForm";

interface BreedExplanation {
  strengths?: string[];
  considerations?: string[];
}

interface BreedRecommendation {
  breed: string;
  species?: string;
  overall_score: number;
  size?: string | null;
  temperament?: string | null;
  lifespan?: string | null;
  description?: string | null;
  noise_level?: string | null;
  health_notes?: string | null;
  tradeoffs?: string[] | string | null;
  explanation?: BreedExplanation | string | null;
}

interface SuggestionResult {
  breeds: BreedRecommendation[];
  animals: PetCardAnimal[];
}

function formatScore(score: number) {
  const pct = score <= 1 ? score * 100 : score;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function formatBreedName(breed: string) {
  return breed.replace(/_/g, " ");
}

function getMatchLabel(score: number): "Excellent Match" | "Great Match" | "Good Match" {
  const pct = formatScore(score);
  if (pct >= 85) return "Excellent Match";
  if (pct >= 70) return "Great Match";
  return "Good Match";
}

function getMatchBenefits(breed: BreedRecommendation): string[] {
  const benefits: string[] = [];
  if (breed.size) benefits.push(`${breed.size} size`);
  if (breed.temperament?.includes("Calm")) benefits.push("Calm temperament");
  if (breed.temperament?.includes("Friendly")) benefits.push("Friendly");
  if (breed.temperament?.includes("Playful")) benefits.push("Playful");
  if (breed.noise_level?.includes("Low")) benefits.push("Quiet");
  if (breed.noise_level?.includes("Moderate")) benefits.push("Moderate barking");
  return benefits.slice(0, 4);
}

type SuggestionMode = "description" | "criteria";

export function AiSuggestionPanel({ open, onClose, isHeroMode }: { open: boolean; onClose: () => void; isHeroMode?: boolean }) {
  const [mode, setMode] = useState<SuggestionMode>("description");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<AdoptionCriteria>(DEFAULT_CRITERIA);
  const [timeAvailability, setTimeAvailability] = useState<TimeAvailability>(DEFAULT_TIME_AVAILABILITY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null);

  if (!open && !isHeroMode) return null;

  async function runSuggestion(payload: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/breed-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Something went wrong, please try again.");
      const data = (await res.json()) as SuggestionResult;
      setResult(data);
      setExpandedBreed(result?.breeds[0]?.breed ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDescriptionSubmit(e: FormEvent) {
    e.preventDefault();
    if (description.trim().length < 15) {
      setError("Tell us a bit more about what you're looking for (at least 15 characters).");
      return;
    }
    await runSuggestion({ mode: "description", description });
  }

  async function handleCriteriaSubmit(e: FormEvent) {
    e.preventDefault();
    await runSuggestion({
      mode: "criteria",
      criteria: { ...criteria, hours_away_daily: TIME_AVAILABILITY_TO_HOURS_AWAY[timeAvailability] },
    });
  }

  const containerClass = isHeroMode
    ? "mx-auto max-w-4xl px-6 py-16 md:py-20"
    : "scroll-mt-24 border-y border-forest/10 bg-muted/60 px-6 py-12 md:py-14";

  const sectionClass = isHeroMode ? "mx-auto max-w-4xl" : "mx-auto max-w-4xl";

  return (
    <section id="ai-suggestion-panel" className={containerClass}>
      <div className={sectionClass}>
        {result ? (
          // RESULTS STATE
          <div className="space-y-12">
            {/* Success heading */}
            <div className="text-center">
              <h2 className="font-display text-[32px] italic leading-tight text-forest max-md:text-[24px]">
                ✨ We found your perfect companion
              </h2>
              <p className="mt-3 max-w-2xl mx-auto font-body text-[15px] text-forest/75 leading-relaxed">
                Based on your lifestyle and preferences, we found several breeds that fit you extremely well.
              </p>
            </div>

            {/* Featured Match */}
            {result.breeds.length > 0 && (
              <div className="animate-in fade-in duration-500" style={{ animationDelay: "200ms" }}>
                <BreedRecommendationCard
                  breed={result.breeds[0].breed}
                  matchScore={formatScore(result.breeds[0].overall_score)}
                  matchLabel={getMatchLabel(result.breeds[0].overall_score)}
                  benefits={getMatchBenefits(result.breeds[0])}
                  featured
                  isExpanded={expandedBreed === result.breeds[0].breed}
                  onToggleExpand={() => setExpandedBreed(expandedBreed === result.breeds[0].breed ? null : result.breeds[0].breed)}
                />
              </div>
            )}

            {/* Featured Breed Details */}
            {expandedBreed && (
              <div className="animate-in fade-in duration-500">
                <BreedDetailCard breed={result.breeds.find((b) => b.breed === expandedBreed)!} />
              </div>
            )}

            {/* Other Recommendations */}
            {result.breeds.length > 1 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg italic text-forest">Other great matches</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {result.breeds.slice(1).map((breed, idx) => (
                    <div key={breed.breed} className="animate-in fade-in duration-500" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                      <BreedRecommendationCard
                        breed={breed.breed}
                        matchScore={formatScore(breed.overall_score)}
                        matchLabel={getMatchLabel(breed.overall_score)}
                        benefits={getMatchBenefits(breed)}
                        isExpanded={expandedBreed === breed.breed}
                        onToggleExpand={() => setExpandedBreed(expandedBreed === breed.breed ? null : breed.breed)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Pets */}
            <div className="space-y-4 pt-4 border-t border-forest/10">
              <h3 className="font-display text-lg italic text-forest">
                {result.animals.length > 0 ? "Pets waiting for you" : "Similar companions available"}
              </h3>
              {result.animals.length === 0 && (
                <div className="rounded-xl border border-forest/15 bg-forest/5 p-4">
                  <p className="font-body text-sm text-forest/75">
                    <span className="font-semibold text-forest">Good news!</span> We found similar pets that match your lifestyle, even if these exact breeds aren't available right now.
                  </p>
                </div>
              )}
              {result.animals.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {result.animals.map((a) => (
                    <PetCard key={a.id} animal={a} />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Browse All Link */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-forest/10">
              <p className="font-body text-sm text-forest/70">Want to explore more options?</p>
              <a
                href="#pet-grid"
                className="font-body text-[14.5px] font-semibold text-forest underline decoration-amber decoration-2 underline-offset-4 hover:text-coral-text"
              >
                Browse all available pets ↓
              </a>
            </div>

            {/* Reset button */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setExpandedBreed(null);
                  setDescription("");
                  setCriteria(DEFAULT_CRITERIA);
                  setTimeAvailability(DEFAULT_TIME_AVAILABILITY);
                }}
                className="font-body text-sm font-medium text-forest/70 underline hover:text-forest transition-colors"
              >
                Try another search
              </button>
            </div>
          </div>
        ) : loading ? (
          // LOADING STATE
          <div className="space-y-8 py-8">
            <div className="text-center">
              <h2 className="font-display text-2xl italic text-forest">Finding your perfect match</h2>
              <p className="mt-2 font-body text-sm text-forest/70">This just takes a moment...</p>
            </div>
            <div className="max-w-md mx-auto">
              <AIProcessingState />
            </div>
          </div>
        ) : (
          // FORM STATE
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="text-amber" size={24} />
                <h2 className="font-display text-2xl italic text-forest">Tell us about yourself</h2>
              </div>
              <p className="font-body text-[15px] text-forest/75">
                We'll analyze your lifestyle and find breed companions that are perfect for you.
              </p>
            </div>

            <div className="inline-flex rounded-lg border-[1.5px] border-forest/15 bg-background p-1">
              {([
                { value: "description", label: "Describe your lifestyle" },
                { value: "criteria", label: "Answer questions" },
              ] as const).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setMode(tab.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 font-body text-sm font-semibold transition-colors",
                    mode === tab.value ? "bg-amber text-forest" : "text-forest/70 hover:text-forest"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="font-body text-xs text-forest/70">
              {mode === "description"
                ? "Share what you're looking for in your own words — there's no wrong answer."
                : "Organize your lifestyle across different areas of your life."}
            </p>

            {mode === "description" ? (
              <form onSubmit={handleDescriptionSubmit} className="space-y-4">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. I live in a small apartment, I'm a first-time owner, and I want a calm, low-energy dog that's good with kids..."
                  rows={5}
                  maxLength={2000}
                  className="rounded-xl border-[1.5px] border-forest/15"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-forest/70">{description.length}/2000</p>
                  <Button type="submit" disabled={loading} className="bg-amber hover:shadow-[0_12px_24px_-6px_hsl(var(--amber)/0.3)]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
                    {loading ? "Finding matches…" : "Get suggestions"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCriteriaSubmit} className="space-y-6">
                <CriteriaForm
                  criteria={criteria}
                  onChange={setCriteria}
                  timeAvailability={timeAvailability}
                  onTimeAvailabilityChange={setTimeAvailability}
                />
                <div className="flex items-center justify-end gap-3">
                  <Button type="submit" disabled={loading} className="bg-amber hover:shadow-[0_12px_24px_-6px_hsl(var(--amber)/0.3)]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
                    {loading ? "Finding matches…" : "Get suggestions"}
                  </Button>
                </div>
              </form>
            )}

            {error && <p className="rounded-lg bg-coral/10 px-4 py-3 font-body text-sm text-coral-text font-medium">{error}</p>}
          </div>
        )}
      </div>

      {isHeroMode && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI suggestion panel"
          className="absolute top-6 right-6 text-forest/60 transition-colors hover:text-forest"
        >
          <X size={20} />
        </button>
      )}
    </section>
  );
}

function BreedDetailCard({ breed }: { breed: BreedRecommendation }) {
  const tradeoffs = Array.isArray(breed.tradeoffs)
    ? breed.tradeoffs
    : breed.tradeoffs
      ? [breed.tradeoffs]
      : [];

  return (
    <div className="rounded-2xl border-[1.5px] border-amber/30 bg-gradient-to-br from-amber/5 to-background p-6 space-y-5">
      <div>
        <h3 className="font-display text-xl italic capitalize text-forest">{formatBreedName(breed.breed)}</h3>
        <p className="mt-1 font-body text-sm text-forest/70 font-medium">Why this breed matches you</p>
      </div>

      {breed.explanation && typeof breed.explanation === "object" && breed.explanation.strengths ? (
        <div className="space-y-3">
          <p className="font-body text-sm font-semibold text-forest">What makes them perfect:</p>
          <ul className="space-y-2">
            {breed.explanation.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 font-body text-sm text-forest/75">
                <span className="text-amber mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : breed.description ? (
        <p className="font-body text-sm leading-relaxed text-forest/75">{breed.description}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
        {breed.size ? <DetailStat label="Size" value={breed.size} /> : null}
        {breed.temperament ? <DetailStat label="Temperament" value={breed.temperament} /> : null}
        {breed.lifespan ? <DetailStat label="Lifespan" value={breed.lifespan} /> : null}
        {breed.noise_level ? <DetailStat label="Noise level" value={breed.noise_level} /> : null}
      </div>

      {tradeoffs.length > 0 && (
        <div className="rounded-lg bg-forest/5 px-4 py-3 border border-forest/10">
          <p className="font-body text-sm text-forest/75">
            <span className="font-semibold text-forest">Keep in mind: </span>
            {Array.isArray(tradeoffs) ? tradeoffs.join(", ") : tradeoffs}
          </p>
        </div>
      )}

      {breed.health_notes && (
        <div className="rounded-lg bg-coral/5 px-4 py-3 border border-coral/20">
          <p className="font-body text-sm text-forest/75">
            <span className="font-semibold text-forest">Health considerations: </span>
            {breed.health_notes}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-forest/5 border border-forest/15 px-2.5 py-2 text-center">
      <p className="font-body font-semibold uppercase tracking-wide text-forest/65 text-xs">{label}</p>
      <p className="mt-0.5 font-body font-medium capitalize text-forest text-sm">{value}</p>
    </div>
  );
}
