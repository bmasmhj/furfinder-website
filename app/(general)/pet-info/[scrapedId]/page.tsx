import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, PawPrint } from "lucide-react";
import { db } from "@/lib/db";
import ExternalMatchRedirect from "./ExternalMatchRedirect";
import ContinueLink from "./ContinueLink";

const REDIRECT_DELAY_MS = 3000;

interface ScrappedPetReport {
  id: string;
  status: string;
  pet_type: string;
  pet_name: string;
  breed: string;
  color: string;
  location_name: string;
  last_seen_date: string;
  description: string;
  photo_uri: string;
  details_url: string;
}

function normalizeUrl(input: string): string | null {
  const value = (input || "").trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

async function getScrappedPetReport(scrapedId: string): Promise<ScrappedPetReport | null> {
  const sql = `
    SELECT
      id,
      status,
      pet_type,
      pet_name,
      breed,
      color,
      location_name,
      last_seen_date,
      description,
      photo_uri,
      details_url
    FROM scrapped_pet_report
    WHERE deleted_at IS NULL
      AND is_active = true
      AND (
        id::text = $1
        OR scraped_animal_id = $1
      )
    ORDER BY scraped_at DESC
    LIMIT 1
  `;

  try {
    return await db.queryOne<ScrappedPetReport>(sql, [scrapedId]);
  } catch (error) {
    console.error("[external-match] Failed to fetch scrapped_pet_report", {
      scrapedId,
      error,
    });
    return null;
  }
}

function buildDisplayName(pet: ScrappedPetReport): string {
  if (pet.pet_name?.trim()) return pet.pet_name.trim();
  if (pet.pet_type?.trim()) return `${pet.pet_type} report`;
  return "pet report";
}

type RouteSearchParams = Record<string, string | string[] | undefined>;

function getTargetFromSearchParams(searchParams: RouteSearchParams): string | null {
  const rawTarget = searchParams.target;
  if (!rawTarget) return null;
  const candidate = Array.isArray(rawTarget) ? rawTarget[0] : rawTarget;
  return normalizeUrl(candidate);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ scrapedId: string }>;
  searchParams: Promise<RouteSearchParams>;
}): Promise<Metadata> {
  const { scrapedId } = await params;
  const resolvedSearchParams = await searchParams;
  const pet = await getScrappedPetReport(scrapedId);

  if (!pet) {
    const targetUrl = getTargetFromSearchParams(resolvedSearchParams);
    return {
      title: "External Match | The Fur Finder",
      description: targetUrl
        ? "Redirecting to the external pet listing."
        : "This external pet match is temporarily unavailable.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const petName = buildDisplayName(pet);
  const status = pet.status?.toUpperCase() || "REPORT";
  const title = `${status}: ${petName} | The Fur Finder External Match`;
  const description = `View matched details for ${petName}${pet.location_name ? ` near ${pet.location_name}` : ""} and continue to the original listing.`;
  const path = `/external-match/${scrapedId}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: pet.photo_uri
        ? [
            {
              url: pet.photo_uri,
              alt: petName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: pet.photo_uri ? "summary_large_image" : "summary",
      title,
      description,
      images: pet.photo_uri ? [pet.photo_uri] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ExternalMatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ scrapedId: string }>;
  searchParams: Promise<RouteSearchParams>;
}) {
  const { scrapedId } = await params;
  const resolvedSearchParams = await searchParams;
  const pet = await getScrappedPetReport(scrapedId);
  const fallbackTargetUrl = getTargetFromSearchParams(resolvedSearchParams);

  if (!pet) {
    if (fallbackTargetUrl) {
      return (
        <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-14">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">Redirecting to source...</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We could not load match details right now, but we can still continue to the original listing.
            </p>
            <div className="mt-5">
              <ExternalMatchRedirect redirectUrl={fallbackTargetUrl} delayMs={REDIRECT_DELAY_MS} />
            </div>
            <ContinueLink
              url={fallbackTargetUrl}
              label="Continue now"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            />
          </div>
        </main>
      );
    }

    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-14">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">External match unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We could not load this external match at the moment. Please try again shortly.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Back to homepage
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  const redirectUrl = normalizeUrl(pet.details_url);

  if (!redirectUrl) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-14">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Link unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We found this external match, but the source link is not available right now.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Back to homepage
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  const displayName = buildDisplayName(pet);

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-14">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-teal-500/10 p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <PawPrint size={14} />
            External Match
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {pet.status?.toUpperCase() || "REPORT"}: {displayName}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We matched this listing from an external source. You will be redirected to
            the original website shortly.
          </p>
        </div>

        <div className="space-y-5 p-8">
          <ExternalMatchRedirect redirectUrl={redirectUrl} delayMs={REDIRECT_DELAY_MS} />

          <div className="grid gap-4 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-semibold text-foreground">Type:</span>{" "}
              {pet.pet_type || "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Breed:</span>{" "}
              {pet.breed || "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Color:</span>{" "}
              {pet.color || "Unknown"}
            </p>
            <p className="inline-flex items-center gap-1">
              <MapPin size={14} className="text-primary" />
              {pet.location_name || "Unknown location"}
            </p>
          </div>

          {pet.description && (
            <p className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              {pet.description}
            </p>
          )}

          <ContinueLink
            url={redirectUrl}
            label="Continue to source website"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          />
        </div>
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";
