"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, PawPrint, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIProcessingState, BREED_DETECTION_STEPS } from "./AIProcessingState";

interface BreedInfo {
  name: string;
  species?: string;
  size?: string | null;
  lifespan_text?: string | null;
  temperament?: string | null;
  care_level?: string | null;
  good_with_children?: boolean | null;
  exercise_needs?: string | null;
  grooming_needs?: string | null;
  noise_level?: string | null;
  noise_notes?: string | null;
  health_notes?: string | null;
  description?: string | null;
  matched?: boolean;
}

interface Detection {
  pet_type: string;
  breed: string;
  size?: string;
  color?: string | string[];
  confidence?: number | null;
  supported?: boolean;
  is_animal?: boolean;
  not_animal_reason?: string;
}

interface DetectResult {
  detection: Detection;
  breeds: BreedInfo[];
  flagged?: boolean;
}

function formatBreedName(breed: string) {
  return breed.replace(/_/g, " ");
}

function formatColor(color?: string | string[]) {
  if (!color) return "";
  return Array.isArray(color) ? color.join(", ") : color;
}

export function DetectBreedPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((f: File | null) => {
    setError(null);
    setResult(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError("Photo is too large (max 25MB).");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  async function handleSubmit() {
    if (!file) {
      setError("Please add a photo first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch("/api/ai/detect-breed", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Couldn't identify this pet, please try a clearer photo.");
      }
      setResult(data as DetectResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }

  const detection = result?.detection;
  const isNonAnimal = detection?.is_animal === false;
  const isUnsupported = detection && detection.supported === false && !isNonAnimal;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
      <div className="rounded-3xl border-[1.5px] border-forest/10 bg-background p-6 shadow-[0_20px_60px_-30px_hsl(var(--forest)/0.35)] md:p-10">
        <div className="mb-6 flex items-center gap-2">
          <PawPrint className="text-amber" size={24} />
          <h2 className="font-display text-2xl italic text-forest">What breed is my pet?</h2>
        </div>
        <p className="mb-8 font-body text-[15px] text-forest/75">
          Upload a clear photo of your pet and our AI will identify the breed and share what to expect
          from it.
        </p>

        {loading ? (
          <div className="space-y-8 py-4">
            <div className="text-center">
              <h3 className="font-display text-xl italic text-forest">Analyzing your photo</h3>
              <p className="mt-2 font-body text-sm text-forest/70">This just takes a moment...</p>
            </div>
            <div className="max-w-md mx-auto">
              <AIProcessingState steps={BREED_DETECTION_STEPS} />
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {previewUrl && (
              <div className="mx-auto h-48 w-48 overflow-hidden rounded-2xl border-[1.5px] border-forest/15">
                <img src={previewUrl} alt="Uploaded pet" className="h-full w-full object-cover" />
              </div>
            )}

            {isNonAnimal ? (
              <div className="rounded-xl border border-coral/25 bg-coral/5 p-5 text-center">
                <p className="font-body text-sm font-semibold text-forest">
                  We couldn't spot a pet in this photo.
                </p>
                <p className="mt-1 font-body text-sm text-forest/70">
                  {detection?.not_animal_reason
                    ? `Reason: ${detection.not_animal_reason.replace(/_/g, " ")}`
                    : "Try a clearer, well-lit photo with the pet as the main subject."}
                </p>
              </div>
            ) : isUnsupported ? (
              <div className="rounded-xl border border-forest/15 bg-forest/5 p-5 text-center">
                <p className="font-body text-sm font-semibold text-forest">Detection was inconclusive.</p>
                <p className="mt-1 font-body text-sm text-forest/70">
                  Try a photo with better lighting or a closer view of your pet.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="font-body text-sm font-medium text-forest/70">
                    {detection?.pet_type ? `We think this is a ${detection.pet_type}` : "Detection complete"}
                  </p>
                  <h3 className="mt-1 font-display text-2xl italic capitalize text-forest">
                    {formatBreedName(detection?.breed || "Unknown breed")}
                  </h3>
                  {typeof detection?.confidence === "number" && (
                    <p className="mt-1 font-body text-xs text-forest/60">
                      {Math.round(Math.max(0, Math.min(1, detection.confidence)) * 100)}% confidence
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {detection?.size && (
                      <span className="rounded-full bg-forest/5 px-3 py-1 font-body text-xs font-medium capitalize text-forest/75">
                        Size: {detection.size}
                      </span>
                    )}
                    {formatColor(detection?.color) && (
                      <span className="rounded-full bg-forest/5 px-3 py-1 font-body text-xs font-medium capitalize text-forest/75">
                        Color: {formatColor(detection?.color)}
                      </span>
                    )}
                  </div>
                </div>

                {result.breeds.length > 0 ? (
                  <div className="space-y-4">
                    {result.breeds.length > 1 && (
                      <p className="font-body text-sm font-semibold text-forest">
                        {result.breeds.length} breeds detected
                      </p>
                    )}
                    {result.breeds.map((breed, idx) => (
                      <BreedInfoCard key={`${breed.name}-${idx}`} breed={breed} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center font-body text-sm text-forest/60">
                    We couldn't find detailed breed info for this result yet.
                  </p>
                )}
              </>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={reset}
                className="font-body text-sm font-medium text-forest/70 underline hover:text-forest transition-colors"
              >
                Try another photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                pickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
                dragActive ? "border-amber bg-amber/5" : "border-forest/20 hover:border-forest/35"
              )}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Selected pet"
                    className="mx-auto h-40 w-40 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => pickFile(null)}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-forest text-cream shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/15 text-amber">
                    <Upload size={22} />
                  </div>
                  <p className="font-body text-sm font-medium text-forest">
                    Drag and drop a photo, or{" "}
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="font-semibold text-coral-text underline"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="font-body text-xs text-forest/60">JPG or PNG, up to 25MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-coral/10 px-4 py-3 font-body text-sm text-coral-text font-medium">
                {error}
              </p>
            )}

            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!file || loading}
                className="bg-amber hover:shadow-[0_12px_24px_-6px_hsl(var(--amber)/0.3)]"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera size={16} className="mr-2" />
                )}
                {loading ? "Identifying…" : "Identify breed"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BreedInfoCard({ breed }: { breed: BreedInfo }) {
  const stats: Array<[string, string | null | undefined]> = [
    ["Size", breed.size],
    ["Lifespan", breed.lifespan_text],
    ["Care level", breed.care_level],
    ["Exercise needs", breed.exercise_needs],
    ["Grooming needs", breed.grooming_needs],
    ["Noise level", breed.noise_level],
  ];
  const visibleStats = stats.filter(([, value]) => Boolean(value));

  return (
    <div className="rounded-2xl border-[1.5px] border-amber/30 bg-gradient-to-br from-amber/5 to-background p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-lg italic capitalize text-forest">{formatBreedName(breed.name)}</h4>
        {breed.matched === false && (
          <span className="shrink-0 rounded-full bg-forest/10 px-2.5 py-1 font-body text-[11px] font-medium text-forest/60">
            No detailed info yet
          </span>
        )}
      </div>

      {breed.description && (
        <p className="font-body text-sm leading-relaxed text-forest/75">{breed.description}</p>
      )}

      {breed.temperament && (
        <p className="font-body text-sm text-forest/75">
          <span className="font-semibold text-forest">Temperament: </span>
          {breed.temperament}
        </p>
      )}

      {visibleStats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleStats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg bg-forest/5 border border-forest/15 px-2.5 py-2 text-center"
            >
              <p className="font-body font-semibold uppercase tracking-wide text-forest/65 text-xs">
                {label}
              </p>
              <p className="mt-0.5 font-body font-medium capitalize text-forest text-sm">{value}</p>
            </div>
          ))}
        </div>
      )}

      {typeof breed.good_with_children === "boolean" && (
        <p className="font-body text-sm text-forest/75">
          <span className="font-semibold text-forest">Good with children: </span>
          {breed.good_with_children ? "Yes" : "Not typically"}
        </p>
      )}

      {breed.noise_notes && (
        <p className="font-body text-sm text-forest/75">
          <span className="font-semibold text-forest">Noise notes: </span>
          {breed.noise_notes}
        </p>
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
