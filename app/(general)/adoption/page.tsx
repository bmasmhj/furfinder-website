import type { Metadata } from "next";
import { Suspense } from "react";
import { PawPrint } from "lucide-react";
import { db } from "@/lib/db";
import { AdoptionHero } from "@/components/adoption/AdoptionHero";
import { FilterBar, type FilterOptions } from "@/components/adoption/FilterBar";
import { PetCard, type PetCardAnimal } from "@/components/adoption/PetCard";

export const metadata: Metadata = {
  title: "Adopt a Pet - The Fur Finder",
  description:
    "Browse adoptable dogs, cats and other pets from shelters and rescues across Australia, or let our AI help you find the right match.",
};

interface AnimalRow {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string;
  age: string | null;
  gender: string | null;
  size: string;
  color: string;
  photo_uris: unknown;
  org_name: string;
}

interface FilterOptionRow {
  breed: string | null;
  age: string | null;
  size: string | null;
  gender: string | null;
  color: string | null;
}

function parsePhotoUris(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

function uniqueSorted(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v && v.trim())))].sort((a, b) =>
    a.localeCompare(b)
  );
}

async function getFilterOptions(): Promise<FilterOptions> {
  const rows = await db.queryMany<FilterOptionRow>(
    `SELECT DISTINCT oa.breed, oa.age, oa.size, oa.gender, oa.color
     FROM organisation_animals oa
     JOIN organisations o ON o.id = oa.org_id
     WHERE oa.status = 'available' AND oa.deleted_at IS NULL AND o.status = 'approved' AND o.deleted_at IS NULL`
  );

  return {
    breeds: uniqueSorted(rows.map((r) => r.breed)),
    ages: uniqueSorted(rows.map((r) => r.age)),
    sizes: uniqueSorted(rows.map((r) => r.size)),
    genders: uniqueSorted(rows.map((r) => r.gender)),
    colors: uniqueSorted(rows.map((r) => r.color)),
  };
}

async function getAnimals(filters: {
  breed?: string;
  age?: string;
  size?: string;
  gender?: string;
  color?: string;
}): Promise<AnimalRow[]> {
  const conditions = [
    "oa.status = 'available'",
    "oa.deleted_at IS NULL",
    "o.status = 'approved'",
    "o.deleted_at IS NULL",
  ];
  const params: string[] = [];

  for (const [column, value] of Object.entries(filters)) {
    if (!value) continue;
    params.push(value);
    conditions.push(`oa.${column} = $${params.length}`);
  }

  return db.queryMany<AnimalRow>(
    `SELECT oa.id, oa.pet_name, oa.pet_type, oa.breed, oa.age, oa.gender, oa.size, oa.color, oa.photo_uris, o.name AS org_name
     FROM organisation_animals oa
     JOIN organisations o ON o.id = oa.org_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY oa.created_at DESC`,
    params
  );
}

export default async function AdoptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filters = {
    breed: typeof params.breed === "string" ? params.breed : undefined,
    age: typeof params.age === "string" ? params.age : undefined,
    size: typeof params.size === "string" ? params.size : undefined,
    gender: typeof params.gender === "string" ? params.gender : undefined,
    color: typeof params.color === "string" ? params.color : undefined,
  };

  const [filterOptions, animalRows] = await Promise.all([getFilterOptions(), getAnimals(filters)]);

  const animals: PetCardAnimal[] = animalRows.map((a) => ({
    id: a.id,
    pet_name: a.pet_name,
    pet_type: a.pet_type,
    breed: a.breed,
    age: a.age,
    gender: a.gender,
    size: a.size,
    color: a.color,
    photo_uris: parsePhotoUris(a.photo_uris),
    org_name: a.org_name,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdoptionHero />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <Suspense fallback={null}>
          <FilterBar options={filterOptions} />
        </Suspense>

        <div className="mt-8">
          {animals.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {animals.map((animal) => (
                <PetCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <PawPrint size={40} className="text-muted-foreground/30" />
              <p className="text-base font-semibold text-foreground">No pets match those filters</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try widening your search, or use the AI suggestion above to find a good match.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
