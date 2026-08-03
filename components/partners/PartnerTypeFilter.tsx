"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "", label: "All partners" },
  { value: "shelter", label: "Shelters" },
  { value: "rescue", label: "Rescues" },
  { value: "vet", label: "Vets" },
];

export function PartnerTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") || "";

  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            if (t.value) params.set("type", t.value);
            else params.delete("type");
            router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
          }}
          className={cn(
            "rounded-full border-[1.5px] px-4 py-1.5 font-body text-sm font-semibold transition-colors",
            current === t.value
              ? "border-amber bg-amber text-forest"
              : "border-forest/15 bg-card text-forest hover:border-forest/35"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
