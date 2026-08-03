"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PetCard, type PetCardAnimal } from "./PetCard";
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

type SuggestionMode = "description" | "criteria";

export function AiSuggestionPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<SuggestionMode>("description");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<AdoptionCriteria>(DEFAULT_CRITERIA);
  const [timeAvailability, setTimeAvailability] = useState<TimeAvailability>(DEFAULT_TIME_AVAILABILITY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null);

  if (!open) return null;

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
      setExpandedBreed(null);
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

  return (
    <section id="ai-suggestion-panel" className="scroll-mt-24 border-y border-forest/10 bg-muted/60 px-6 py-12 md:py-14">
      <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-forest" size={22} />
          <h2 className="font-display text-[24px] italic text-forest max-md:text-[20px]">Not sure what pet is right for you?</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI suggestion panel"
          className="text-forest/60 transition-colors hover:text-forest"
        >
          <X size={20} />
        </button>
      </div>
      <p className="mb-4 font-body text-sm text-forest/75">
        Tell us what you&apos;re looking for and we&apos;ll suggest breeds — plus matching pets available for
        adoption right now.
      </p>

      <div className="mb-1 inline-flex rounded-lg border-[1.5px] border-forest/15 bg-background p-1">
        {(
          [
            { value: "description", label: "Write a description" },
            { value: "criteria", label: "Answer a few questions" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMode(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 font-body text-sm font-semibold transition-colors",
              mode === tab.value
                ? "bg-amber text-forest"
                : "text-forest/70 hover:text-forest"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="mb-4 font-body text-xs text-forest/70">
        {mode === "description"
          ? "Write a sentence or two in your own words — no right or wrong answer."
          : "Faster, and gives more precise results — takes about a minute."}
      </p>

      {mode === "description" ? (
        <form onSubmit={handleDescriptionSubmit} className="flex flex-col gap-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. I live in a small apartment, I'm a first-time owner, and I want a calm, low-energy dog that's good with kids..."
            rows={4}
            maxLength={2000}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{description.length}/2000</p>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Finding matches…" : "Get suggestions"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCriteriaSubmit} className="flex flex-col gap-4">
          <CriteriaForm
            criteria={criteria}
            onChange={setCriteria}
            timeAvailability={timeAvailability}
            onTimeAvailabilityChange={setTimeAvailability}
          />
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Finding matches…" : "Get suggestions"}
            </Button>
          </div>
        </form>
      )}

      {error ? <p className="mt-3 font-body text-sm font-medium text-coral-text">{error}</p> : null}

      {result ? (
        <div className="mt-8">
          {result.breeds.length > 0 ? (
            <>
              <p className="font-body text-sm font-semibold text-forest">Breeds that match what you're after</p>
              <p className="mb-3 font-body text-xs text-forest/70">
                The percentage is how closely each breed fits — tap one to see why.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.breeds.map((b) => {
                  const isExpanded = expandedBreed === b.breed;
                  return (
                    <button
                      type="button"
                      key={b.breed}
                      onClick={() => setExpandedBreed(isExpanded ? null : b.breed)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border-[1.5px] px-3 py-1.5 font-body text-sm font-semibold capitalize transition-colors",
                        isExpanded
                          ? "border-amber bg-amber text-forest"
                          : "border-forest/15 bg-card text-forest hover:border-forest/35"
                      )}
                    >
                      {formatBreedName(b.breed)}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-xs",
                          isExpanded ? "bg-forest/10" : "bg-muted"
                        )}
                      >
                        {formatScore(b.overall_score)}% match
                      </span>
                    </button>
                  );
                })}
              </div>

              {expandedBreed ? (
                <BreedDetailCard breed={result.breeds.find((b) => b.breed === expandedBreed)!} />
              ) : null}
            </>
          ) : (
            <p className="font-body text-sm text-forest/70">
              We couldn&apos;t find a strong breed match &mdash; try adjusting your answers or description.
            </p>
          )}

          <div className="mt-8">
            <p className="mb-3 font-body text-sm font-semibold text-forest">
              {result.animals.length > 0
                ? "These pets available for adoption match those breeds"
                : "None of our available pets match those breeds right now — check back soon, or browse everyone below"}
            </p>
            {result.animals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.animals.map((a) => (
                  <PetCard key={a.id} animal={a} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      </div>
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
    <div className="mt-4 rounded-2xl border-[1.5px] border-forest/15 bg-card p-5">
      <h3 className="font-display text-[19px] italic capitalize text-forest">{formatBreedName(breed.breed)}</h3>
      {breed.description ? (
        <p className="mt-2 font-body text-sm leading-relaxed text-forest/75">{breed.description}</p>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        {breed.size ? <DetailStat label="Size" value={breed.size} /> : null}
        {breed.temperament ? <DetailStat label="Temperament" value={breed.temperament} /> : null}
        {breed.lifespan ? <DetailStat label="Lifespan" value={breed.lifespan} /> : null}
        {breed.noise_level ? <DetailStat label="Noise level" value={breed.noise_level} /> : null}
      </div>

      {breed.health_notes ? (
        <p className="mt-3 font-body text-xs text-forest/75">
          <span className="font-semibold text-forest">Health notes: </span>
          {breed.health_notes}
        </p>
      ) : null}

      {tradeoffs.length > 0 ? (
        <p className="mt-2 font-body text-xs text-forest/75">
          <span className="font-semibold text-forest">Keep in mind: </span>
          {tradeoffs.join(", ")}
        </p>
      ) : null}

      {typeof breed.explanation === "string" ? (
        <p className="mt-2 font-body text-xs italic text-forest/75">{breed.explanation}</p>
      ) : null}

      {breed.explanation && typeof breed.explanation === "object" ? (
        <div className="mt-3 space-y-2 font-body text-xs text-forest/75">
          {breed.explanation.strengths && breed.explanation.strengths.length > 0 ? (
            <ul className="list-inside list-disc space-y-1">
              {breed.explanation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : null}
          {breed.explanation.considerations && breed.explanation.considerations.length > 0 ? (
            <p>
              <span className="font-semibold text-forest">Considerations: </span>
              {breed.explanation.considerations.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-2">
      <p className="font-body font-semibold uppercase tracking-wide text-forest/75">{label}</p>
      <p className="mt-0.5 font-body font-medium capitalize text-forest">{value}</p>
    </div>
  );
}
