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
    <div className="flex flex-wrap items-center gap-2.5 border-b border-forest/10 pb-6">
      <span className="mr-1 font-body text-[13px] font-semibold text-forest/75">Filter:</span>
      {FILTERS.map(({ key, label }) => {
        const paramKey = PARAM_BY_OPTION_KEY[key];
        const current = searchParams.get(paramKey) || "";
        return (
          <div key={key} className="relative">
            <select
              aria-label={label}
              value={current}
              onChange={(e) => updateFilter(paramKey, e.target.value)}
              className={`appearance-none rounded-full border-[1.5px] py-1.5 pl-3.5 pr-8 font-body text-[13px] font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                current ? "border-amber bg-amber/15 text-forest" : "border-forest/15 bg-card text-forest/75 hover:border-forest/35"
              }`}
            >
              <option value="">{label}: All</option>
              {options[key].map((opt) => (
                <option key={opt} value={opt} className="capitalize">
                  {opt}
                </option>
              ))}
            </select>
            <svg aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-forest/50" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      })}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[13px] font-semibold text-forest/70 transition-colors hover:text-coral-text"
        >
          <X size={14} />
          Clear
        </button>
      ) : null}
    </div>
  );
}
