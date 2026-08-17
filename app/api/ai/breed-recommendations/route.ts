import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const MAX_BREEDS = 6;
const MAX_ANIMALS = 24;

interface BreedRecommendation {
  breed: string;
  species?: string;
  overall_score: number;
  [key: string]: unknown;
}

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

const REQUIRED_CRITERIA_KEYS = [
  "living_space",
  "yard_access",
  "exercise_time",
  "exercise_type",
  "grooming_commitment",
  "experience_level",
  "has_children",
  "noise_tolerance",
] as const;

export async function POST(request: NextRequest) {
  let body: { mode?: unknown; description?: unknown; species?: unknown; criteria?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = body.mode === "criteria" ? "criteria" : "description";
  const species = typeof body.species === "string" && body.species ? body.species : "dog";

  let upstreamPayload: Record<string, unknown>;

  if (mode === "criteria") {
    const criteria =
      body.criteria && typeof body.criteria === "object" ? (body.criteria as Record<string, unknown>) : null;
    const missing = criteria ? REQUIRED_CRITERIA_KEYS.filter((key) => criteria[key] === undefined) : REQUIRED_CRITERIA_KEYS;
    if (!criteria || missing.length > 0) {
      return NextResponse.json(
        { error: `criteria is missing required field(s): ${missing.join(", ")}` },
        { status: 400 }
      );
    }
    upstreamPayload = { mode: "criteria", criteria: { ...criteria, species: criteria.species || species } };
  } else {
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (description.length < 15 || description.length > 2000) {
      return NextResponse.json(
        { error: "description must be between 15 and 2000 characters" },
        { status: 400 }
      );
    }
    upstreamPayload = { mode: "description", description, species };
  }

  let breeds: BreedRecommendation[] = [];
  try {
    // website -> backendV2 (`ai/breed-recommendations`, public) -> scrapper-engine AI service
    const aiRes = await fetch(`${API_BASE_URL}/ai/breed-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(upstreamPayload),
      signal: AbortSignal.timeout(15000),
    });
    if (!aiRes.ok) {
      throw new Error(`AI service responded with ${aiRes.status}`);
    }
    const aiData = await aiRes.json();
    breeds = Array.isArray(aiData?.results) ? aiData.results.slice(0, MAX_BREEDS) : [];
  } catch (error) {
    console.error("[AI breed-recommendations] upstream error", error);
    return NextResponse.json({ error: "AI suggestion service is unavailable right now" }, { status: 502 });
  }

  const breedNames = [...new Set(breeds.map((b) => String(b.breed || "").toLowerCase()).filter(Boolean))];

  let animals: AnimalRow[] = [];
  if (breedNames.length > 0) {
    animals = await db.queryMany<AnimalRow>(
      `SELECT oa.id, oa.pet_name, oa.pet_type, oa.breed, oa.age, oa.gender, oa.size, oa.color, oa.photo_uris, o.name AS org_name
       FROM organisation_animals oa
       JOIN organisations o ON o.id = oa.org_id
       WHERE oa.status = 'available'
         AND oa.deleted_at IS NULL
         AND o.status = 'approved'
         AND o.deleted_at IS NULL
         AND LOWER(oa.breed) = ANY($1::text[])
       ORDER BY oa.created_at DESC
       LIMIT $2`,
      [breedNames, MAX_ANIMALS]
    );
  }

  return NextResponse.json({
    breeds,
    animals: animals.map((a) => ({
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
    })),
  });
}
