"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdoptionCriteria {
  living_space: "apartment" | "house_small" | "house_large";
  yard_access: "no_yard" | "shared_yard" | "private_yard";
  exercise_time: number;
  exercise_type: "light_walks" | "moderate_activity" | "active_training";
  grooming_commitment: "low" | "medium" | "high";
  experience_level: "beginner" | "intermediate" | "advanced";
  has_children: boolean;
  children_age?: "toddler" | "school_age" | "teenager";
  noise_tolerance: "low" | "medium" | "high";
  size_preference: "no_preference" | "small" | "medium" | "large" | "giant";
  hours_away_daily?: "0_3" | "4_6" | "7_9" | "10_plus";
  species: string;
}

export type TimeAvailability = "limited" | "moderate" | "flexible";

// Maps the "how often is your dog left alone" question to the AI service's `hours_away_daily` field.
export const TIME_AVAILABILITY_TO_HOURS_AWAY: Record<TimeAvailability, AdoptionCriteria["hours_away_daily"]> = {
  limited: "10_plus",
  moderate: "4_6",
  flexible: "0_3",
};

export const DEFAULT_CRITERIA: AdoptionCriteria = {
  living_space: "apartment",
  yard_access: "no_yard",
  exercise_time: 60,
  exercise_type: "moderate_activity",
  grooming_commitment: "medium",
  experience_level: "beginner",
  has_children: false,
  noise_tolerance: "medium",
  size_preference: "no_preference",
  hours_away_daily: TIME_AVAILABILITY_TO_HOURS_AWAY.moderate,
  species: "dog",
};

export const DEFAULT_TIME_AVAILABILITY: TimeAvailability = "moderate";
const DEFAULT_EXERCISE_TIME = 60;

function PillGroup<T extends string>({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  selected ? "border-primary" : "border-muted-foreground/40"
                )}
              >
                {selected ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderField({
  label,
  description,
  min,
  max,
  value,
  onChange,
  onReset,
  unitLabel,
}: {
  label: string;
  description?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
  unitLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="whitespace-nowrap rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold text-foreground">
            {value} {unitLabel}
          </span>
          <button
            type="button"
            onClick={onReset}
            aria-label={`Reset ${label.toLowerCase()}`}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted"
          style={{ accentColor: "hsl(var(--primary))" }}
        />
        <span>{max}</span>
      </div>
    </div>
  );
}

export function CriteriaForm({
  criteria,
  onChange,
  timeAvailability,
  onTimeAvailabilityChange,
}: {
  criteria: AdoptionCriteria;
  onChange: (criteria: AdoptionCriteria) => void;
  timeAvailability: TimeAvailability;
  onTimeAvailabilityChange: (value: TimeAvailability) => void;
}) {
  function set<K extends keyof AdoptionCriteria>(key: K, value: AdoptionCriteria[K]) {
    onChange({ ...criteria, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
        <PillGroup
          label="Where do you live?"
          value={criteria.living_space}
          onChange={(v) => set("living_space", v)}
          options={[
            { value: "apartment", label: "Apartment" },
            { value: "house_small", label: "House with a small space" },
            { value: "house_large", label: "House with lots of space" },
          ]}
        />

        <PillGroup
          label="Do you have a yard?"
          value={criteria.yard_access}
          onChange={(v) => set("yard_access", v)}
          options={[
            { value: "no_yard", label: "No yard" },
            { value: "shared_yard", label: "Shared yard" },
            { value: "private_yard", label: "Private yard" },
          ]}
        />

        <SliderField
          label="How much time can you spend exercising a dog each day?"
          description="Include walks, play time, and training, in minutes"
          min={0}
          max={180}
          value={criteria.exercise_time}
          onChange={(v) => set("exercise_time", v)}
          onReset={() => set("exercise_time", DEFAULT_EXERCISE_TIME)}
          unitLabel="min/day"
        />

        <PillGroup
          label="What kind of exercise do you enjoy?"
          value={criteria.exercise_type}
          onChange={(v) => set("exercise_type", v)}
          options={[
            { value: "light_walks", label: "Light walks" },
            { value: "moderate_activity", label: "Moderate activity" },
            { value: "active_training", label: "Active training" },
          ]}
        />

        <PillGroup
          label="How much grooming can you keep up with?"
          description="Low = about once a month, Medium = weekly, High = daily"
          value={criteria.grooming_commitment}
          onChange={(v) => set("grooming_commitment", v)}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
        <PillGroup
          label="What size dog do you prefer?"
          description="This will strongly narrow down the recommendations"
          value={criteria.size_preference}
          onChange={(v) => set("size_preference", v)}
          options={[
            { value: "no_preference", label: "No preference" },
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
            { value: "giant", label: "Giant" },
          ]}
        />

        <PillGroup
          label="How experienced are you with dogs?"
          description="Be honest — this helps us find the right match"
          value={criteria.experience_level}
          onChange={(v) => set("experience_level", v)}
          options={[
            { value: "beginner", label: "First-time owner" },
            { value: "intermediate", label: "Some experience" },
            { value: "advanced", label: "Very experienced" },
          ]}
        />

        <PillGroup
          label="How much time is your dog likely to spend alone?"
          value={timeAvailability}
          onChange={onTimeAvailabilityChange}
          options={[
            { value: "limited", label: "Often left alone" },
            { value: "moderate", label: "Sometimes alone" },
            { value: "flexible", label: "Rarely alone" },
          ]}
        />

        <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={criteria.has_children}
              onChange={(e) =>
                onChange({
                  ...criteria,
                  has_children: e.target.checked,
                  children_age: e.target.checked ? criteria.children_age : undefined,
                })
              }
              className="h-4 w-4 rounded border-input"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            I have children at home
          </label>
          <p className="mt-1 text-xs text-muted-foreground">Helps us recommend breeds that are good with kids</p>

          {criteria.has_children ? (
            <div className="mt-3">
              <PillGroup
                label="How old are they?"
                value={criteria.children_age || "school_age"}
                onChange={(v) => set("children_age", v)}
                options={[
                  { value: "toddler", label: "Toddler" },
                  { value: "school_age", label: "School age" },
                  { value: "teenager", label: "Teenager" },
                ]}
              />
            </div>
          ) : null}
        </div>

        <PillGroup
          label="How much barking can you tolerate?"
          description="Some breeds are naturally more vocal than others"
          value={criteria.noise_tolerance}
          onChange={(v) => set("noise_tolerance", v)}
          options={[
            { value: "low", label: "Not much" },
            { value: "medium", label: "A moderate amount" },
            { value: "high", label: "Doesn't bother me" },
          ]}
        />
      </div>
    </div>
  );
}
