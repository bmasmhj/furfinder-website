"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

export interface FilterOptions {
  breeds: string[];
  ages: string[];
  sizes: string[];
  genders: string[];
  colors: string[];
}

const FILTERS: { key: keyof FilterOptions; label: string }[] = [
  { key: "breeds", label: "Breed" },
  { key: "ages", label: "Age" },
  { key: "sizes", label: "Size" },
  { key: "genders", label: "Gender" },
  { key: "colors", label: "Color" },
];

const PARAM_BY_OPTION_KEY: Record<keyof FilterOptions, string> = {
  breeds: "breed",
  ages: "age",
  sizes: "size",
  genders: "gender",
  colors: "color",
};

export function FilterBar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(paramKey: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  const hasActiveFilters = FILTERS.some((f) => searchParams.get(PARAM_BY_OPTION_KEY[f.key]));

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {FILTERS.map(({ key, label }) => {
        const paramKey = PARAM_BY_OPTION_KEY[key];
        return (
          <label key={key} className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
            {label}
            <select
              value={searchParams.get(paramKey) || ""}
              onChange={(e) => updateFilter(paramKey, e.target.value)}
              className="min-w-[9rem] rounded-lg border border-input bg-background px-3 py-2 text-sm capitalize text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All</option>
              {options[key].map((opt) => (
                <option key={opt} value={opt} className="capitalize">
                  {opt}
                </option>
              ))}
            </select>
          </label>
        );
      })}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <X size={14} />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
