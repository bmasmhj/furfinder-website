import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import pool from "./db";
import { authMiddleware, optionalAuth, requireRole, registerUser, loginUser, getMe, awardPremiumDays } from "./auth";
import { moderateContent } from "./moderation";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface PetReport {
  id: string;
  status: string;
  petType: string;
  petName: string;
  breed: string;
  size: string;
  color: string;
  markings: string;
  photoUri: string;
  photoUris?: string[];
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  lastSeenDate: string;
  reward: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  isOwner: boolean;
}

interface PetProfile {
  id: string;
  petType: string;
  petName: string;
  breed: string;
  size: string;
  color: string;
  markings: string;
  photoUris: string[];
  biometricPhotoUris?: string[];
  microchipNumber: string;
  medicalNotes: string;
  suburb: string;
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
  updatedAt: string;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RADIUS_KM = 5;
const MAX_VISION_CANDIDATES = 15;

function getReportPhotos(report: PetReport): string[] {
  const photos: string[] = [];
  if (report.photoUris && report.photoUris.length > 0) {
    photos.push(...report.photoUris);
  } else if (report.photoUri) {
    photos.push(report.photoUri);
  }
  return photos.filter(p => p && (p.startsWith('data:') || p.startsWith('http')));
}

function getProfilePhotos(profile: PetProfile): string[] {
  return (profile.photoUris || []).filter(p => p && (p.startsWith('data:') || p.startsWith('http')));
}

function getProfileBiometricPhotos(profile: PetProfile): string[] {
  return (profile.biometricPhotoUris || []).filter(p => p && (p.startsWith('data:') || p.startsWith('http')));
}

function buildImageContent(photoUri: string, detail: "high" | "low" = "high"): OpenAI.Chat.Completions.ChatCompletionContentPartImage {
  return {
    type: "image_url",
    image_url: { url: photoUri, detail },
  };
}

function mapReportRow(row: any, isOwner: boolean, likedByMe: boolean): any {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    petType: row.pet_type,
    petName: row.pet_name,
    breed: row.breed,
    size: row.size,
    color: row.color,
    markings: row.markings,
    photoUri: row.photo_uri,
    photoUris: typeof row.photo_uris === 'string' ? JSON.parse(row.photo_uris) : (row.photo_uris || []),
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    locationName: row.location_name,
    lastSeenDate: row.last_seen_date,
    reward: row.reward,
    rewardPool: row.reward_pool || 0,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    isOwner,
    comments: [],
    timeline: [],
    reunionMessage: row.reunion_message || undefined,
    reunionDate: row.reunion_date ? (row.reunion_date instanceof Date ? row.reunion_date.toISOString() : row.reunion_date) : undefined,
    likes: row.likes || 0,
    likedByMe,
    isBoosted: row.is_boosted || false,
    boostedAt: row.boosted_at ? (row.boosted_at instanceof Date ? row.boosted_at.toISOString() : row.boosted_at) : undefined,
    boostExpiresAt: row.boost_expires_at ? (row.boost_expires_at instanceof Date ? row.boost_expires_at.toISOString() : row.boost_expires_at) : undefined,
  };
}

function mapProfileRow(row: any): any {
  return {
    id: row.id,
    petType: row.pet_type,
    petName: row.pet_name,
    breed: row.breed,
    size: row.size,
    color: row.color,
    markings: row.markings,
    photoUris: typeof row.photo_uris === 'string' ? JSON.parse(row.photo_uris) : (row.photo_uris || []),
    biometricPhotoUris: typeof row.biometric_photo_uris === 'string' ? JSON.parse(row.biometric_photo_uris) : (row.biometric_photo_uris || []),
    microchipNumber: row.microchip_number,
    medicalNotes: row.medical_notes,
    suburb: row.suburb,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

async function getOrgAnimalCandidates(petType: string, excludeOrgId?: string) {
  const query = excludeOrgId
    ? `SELECT oa.*, o.name AS org_name, o.type AS org_type, o.latitude AS org_latitude, o.longitude AS org_longitude FROM organisation_animals oa
       JOIN organisations o ON o.id = oa.org_id
       WHERE o.status = 'approved' AND oa.status = 'available' AND oa.pet_type = $1 AND o.id != $2`
    : `SELECT oa.*, o.name AS org_name, o.type AS org_type, o.latitude AS org_latitude, o.longitude AS org_longitude FROM organisation_animals oa
       JOIN organisations o ON o.id = oa.org_id
       WHERE o.status = 'approved' AND oa.status = 'available' AND oa.pet_type = $1`;
  const params = excludeOrgId ? [petType, excludeOrgId] : [petType];
  const result = await pool.query(query, params);
  return result.rows;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const path = require("path");
  const express = require("express");
  app.use("/store-assets", express.static(path.join(__dirname, "..", "assets", "store")));
  app.use("/app-assets", express.static(path.join(__dirname, "..", "assets")));

  app.get("/download-assets", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><head><title>Download Assets</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body{font-family:sans-serif;padding:20px;text-align:center}img{max-width:100%;margin:10px 0;border:2px solid #ccc;border-radius:8px}h2{color:#FF6B4A}p{color:#666;font-size:14px}</style>
    </head><body>
    <h2>App Icon</h2>
    <p>Long-press and save this image:</p>
    <img src="/app-assets/icon-option5.png" alt="App Icon"/>
    <h2>Feature Graphic - RECOMMENDED</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-final2.png" alt="Feature Graphic Final"/>
    <h2>Feature Graphic - FINAL (The Fur Finder)</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-split5.png" alt="Feature Graphic Final"/>
    <h2>Feature Graphic - Without Brand Name</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-split4.png" alt="Feature Graphic Split Clean"/>
    <h2>Feature Graphic - Split Reunion (no text)</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-split.png" alt="Feature Graphic Split"/>
    <h2>Feature Graphic - Detective Dog</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-v5.png" alt="Feature Graphic"/>
    <h2>Feature Graphic - Your Dogs</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-dogs.png" alt="Feature Graphic Dogs"/>
    </body></html>`);
  });

  app.post("/api/match", async (req: Request, res: Response) => {
    try {
      const { report, reports, profiles, radiusKm } = req.body as {
        report: PetReport;
        reports: PetReport[];
        profiles: PetProfile[];
        radiusKm?: number;
      };
      const searchRadius = radiusKm && radiusKm > 0 ? radiusKm : RADIUS_KM;

      if (!report) {
        return res.status(400).json({ error: "Report is required" });
      }

      const oppositeStatus = report.status === 'lost' ? 'found' : 'lost';

      const matchingReports = (reports || []).filter(r => {
        if (r.id === report.id) return false;
        if (r.status !== oppositeStatus) return false;
        if (r.petType !== report.petType) return false;
        if (r.latitude && r.longitude && report.latitude && report.longitude) {
          const dist = getDistance(report.latitude, report.longitude, r.latitude, r.longitude);
          if (dist > searchRadius) return false;
        }
        return true;
      });

      const matchingProfiles = (profiles || []).filter(p => p.petType === report.petType);

      interface Candidate {
        type: string;
        id: string;
        summary: string;
        photos: string[];
        distance?: number;
      }

      const candidates: Candidate[] = [];

      for (const r of matchingReports) {
        const dist = getDistance(report.latitude, report.longitude, r.latitude, r.longitude);
        candidates.push({
          type: 'report',
          id: r.id,
          summary: `[Report] ${r.status.toUpperCase()} ${r.petType} named "${r.petName}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.locationName}, distance: ${dist.toFixed(1)}km, date: ${r.lastSeenDate}, description: "${r.description}"`,
          photos: getReportPhotos(r),
          distance: dist,
        });
      }

      for (const p of matchingProfiles) {
        const profilePhotos = getProfilePhotos(p);
        const biometricPhotos = getProfileBiometricPhotos(p);
        const allPhotos = [...profilePhotos, ...biometricPhotos];
        candidates.push({
          type: 'profile',
          id: p.id,
          summary: `[Registered Pet] ${p.petType} named "${p.petName}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, microchip: ${p.microchipNumber || 'none'}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s) (close-up nose/eyes/face)` : ''}`,
          photos: allPhotos,
        });
      }

      const orgAnimals = await getOrgAnimalCandidates(report.petType);
      for (const oa of orgAnimals) {
        const photos = Array.isArray(oa.photo_uris) ? oa.photo_uris : (typeof oa.photo_uris === 'string' ? JSON.parse(oa.photo_uris) : []);
        const orgLabel = oa.org_type === 'vet' ? 'Vet Clinic' : oa.org_type === 'rescue' ? 'Rescue Group' : 'Shelter';
        let dist: number | undefined;
        if (oa.org_latitude && oa.org_longitude && report.latitude && report.longitude) {
          dist = getDistance(report.latitude, report.longitude, oa.org_latitude, oa.org_longitude);
        }
        candidates.push({
          type: 'org_animal',
          id: oa.id,
          summary: `[${orgLabel}: ${oa.org_name}] ${oa.pet_type} named "${oa.pet_name}", breed: ${oa.breed}, size: ${oa.size}, color: ${oa.color}, markings: "${oa.markings}", intake: ${oa.intake_type}, microchip: ${oa.microchip_number || 'none'}, desexed: ${oa.desexed ? 'yes' : 'no'}, description: "${oa.description}"`,
          photos: photos.slice(0, 3),
          distance: dist,
        });
      }

      if (candidates.length === 0) {
        return res.json({ matches: [] });
      }

      candidates.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
      const visionCandidates = candidates.slice(0, MAX_VISION_CANDIDATES);

      const targetPhotos = getReportPhotos(report);
      const hasPhotos = targetPhotos.length > 0 || visionCandidates.some(c => c.photos.length > 0);

      const targetSummary = `${report.status.toUpperCase()} ${report.petType} named "${report.petName}", breed: ${report.breed}, size: ${report.size}, color: ${report.color}, markings: "${report.markings}", location: ${report.locationName}, date: ${report.lastSeenDate}, description: "${report.description}"`;

      const candidateList = visionCandidates.map((c, i) =>
        `${i + 1}. (${c.type}:${c.id}) ${c.summary} | Has ${c.photos.length} photo(s)`
      ).join('\n');

      const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

      if (hasPhotos) {
        userContent.push({
          type: "text",
          text: `TARGET PET (the pet we are trying to match):\n${targetSummary}\n\nTarget pet photo(s):`,
        });

        for (const photo of targetPhotos.slice(0, 3)) {
          userContent.push(buildImageContent(photo));
        }

        for (let i = 0; i < visionCandidates.length; i++) {
          const c = visionCandidates[i];
          if (c.photos.length > 0) {
            userContent.push({
              type: "text",
              text: `\nCANDIDATE ${i + 1} (${c.type}:${c.id}) — ${c.summary}\nCandidate ${i + 1} photo(s):`,
            });
            for (const photo of c.photos.slice(0, 3)) {
              userContent.push(buildImageContent(photo));
            }
          } else {
            userContent.push({
              type: "text",
              text: `\nCANDIDATE ${i + 1} (${c.type}:${c.id}) — ${c.summary}\n(No photo available)`,
            });
          }
        }
      } else {
        userContent.push({
          type: "text",
          text: `Target pet:\n${targetSummary}\n\nCandidates:\n${candidateList}`,
        });
      }

      const systemPrompt = hasPhotos
        ? `You are an expert veterinary-grade AI pet identification system. You perform rigorous visual and textual analysis to match lost and found pets with the highest possible accuracy.

VISUAL ANALYSIS PROTOCOL (primary — most important when photos are available):
1. BIOMETRIC FEATURES (highest confidence signal):
   - Nose print texture: unique ridge patterns, nostril shape, pigmentation — as unique as human fingerprints
   - Eye patterns: iris color, pupil shape, eye spacing, heterochromia
   - Facial geometry: muzzle length, forehead width, jaw shape, ear set angle
2. COAT ANALYSIS:
   - Color distribution map: exact locations of color patches, transitions, and gradients
   - Pattern type: solid, bicolor, tricolor, tabby, brindle, merle, tuxedo, pointed
   - Unique markings: spots, patches, stripes — note exact position (left ear, right paw, chest, etc.)
3. BODY STRUCTURE:
   - Build type and proportions relative to breed standard
   - Tail length/shape/carriage, leg proportions
   - Ear shape: erect, floppy, semi-erect, cropped
4. DISTINGUISHING FEATURES:
   - Scars, healed injuries, missing fur patches
   - Collar, harness, or tag visible
   - Eye conditions (cherry eye, cloudiness)
   - Ear notches or tattoos

TEXT ANALYSIS (secondary):
- Breed: exact match is strongest; cross-breed similarity considered
- Color and markings description alignment with visual evidence
- Size category match (small/medium/large)
- Geographic proximity: distance in km — closer is stronger (within ${searchRadius}km radius)
- Timeline plausibility: when was the pet lost vs. found
- Description details: temperament, behaviour, any unique habits mentioned

SCORING GUIDE:
- 90-100: Virtually certain — biometric features confirm identity, text details fully align
- 80-89: Very strong — photos show very likely the same animal, multiple unique features match
- 65-79: Good — visually similar with most text details aligning, some distinguishing features match
- 50-64: Moderate — breed and color match, some visual resemblance but limited distinguishing evidence
- 35-49: Weak but possible — general similarities warrant human review
- Below 35: Unlikely match, do not include

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": the candidate's id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing SPECIFIC visual features compared (e.g., "White chest patch shape matches", "Nose pigmentation pattern consistent") and text alignment

Note: "org_animal" candidates are animals currently in the care of verified partner organisations (vet clinics, shelters, rescue groups). They should be matched with the same rigour as other candidates.

Only include candidates with confidence >= 30. Return at most 10 matches.
Return ONLY valid JSON, no markdown formatting.`
        : `You are an expert AI pet matching system. Given a target pet report and candidates, perform thorough analysis to determine match likelihood.

Analyse these factors with rigorous attention to detail:
- Breed: exact match is strongest signal; note if mixed breed descriptions could overlap
- Color: compare primary and secondary colors, patterns (e.g., "tan with black saddle" vs "black and tan")
- Markings: specific marking locations (face blaze, chest patch, paw markings)
- Size: must be same category (small/medium/large)
- Geographic proximity: closer is better (within ${searchRadius}km radius)
- Timeline: date proximity between lost and found events
- Description: behavioural traits, age estimates, distinctive features

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": the candidate's id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing specific matching factors

Note: "org_animal" candidates are animals currently in the care of verified partner organisations (vet clinics, shelters, rescue groups).

Only include candidates with confidence >= 30. Return at most 10 matches.
Return ONLY valid JSON, no markdown formatting.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const content = completion.choices[0]?.message?.content || '{"matches":[]}';
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { matches: [] };
      }

      const matches = (parsed.matches || parsed.results || [])
        .filter((m: any) => m.confidence >= 30)
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 10);

      return res.json({ matches });
    } catch (error) {
      console.error("Match error:", error);
      return res.status(500).json({ error: "Failed to find matches" });
    }
  });

  app.post("/api/scan-post", async (req: Request, res: Response) => {
    try {
      const { postText, url, reports, profiles } = req.body as {
        postText?: string;
        url?: string;
        reports: PetReport[];
        profiles: PetProfile[];
      };

      if (!postText && !url) {
        return res.status(400).json({ error: "Post text or URL is required" });
      }

      let contentToAnalyze = postText || '';

      if (url && !postText) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; TheFurFinder/1.0)',
            },
          });
          clearTimeout(timeout);
          const html = await response.text();
          contentToAnalyze = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 5000);
        } catch (fetchErr) {
          if (!postText) {
            return res.status(400).json({
              error: "Could not fetch that URL. Try copying and pasting the post text instead."
            });
          }
        }
      }

      if (!contentToAnalyze.trim()) {
        return res.status(400).json({ error: "No content to analyze" });
      }

      const extractionResult = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          {
            role: "system",
            content: `You are an expert AI system that extracts comprehensive pet information from social media posts (Facebook, Instagram, Nextdoor, Gumtree, community boards, etc.) about lost or found pets in Australia.

Extract ALL available details from the post text with maximum accuracy. Infer breed from descriptions when not explicitly stated (e.g., "fluffy white small dog" could suggest Maltese, Bichon, or Pomeranian). For Australian posts, recognise common location formats (suburb names, state abbreviations).

If a detail is not mentioned and cannot be reasonably inferred, use "unknown".

Return a JSON object with:
- "isRelevant": boolean - true if this appears to be about a lost or found pet, false otherwise
- "status": "lost" or "found" (also consider "missing", "escaped", "stray", "wandering" as indicators)
- "petType": one of "dog", "cat", "bird", "rabbit", "other"
- "petName": the pet's name if mentioned
- "breed": breed if mentioned or can be inferred from description
- "size": "small", "medium", or "large" (infer from breed if not stated)
- "color": detailed color/coloring description including pattern (e.g., "tan and white bicolor" not just "brown")
- "markings": ALL distinguishing markings mentioned — spots, patches, scars, collar color, tag details, microchipped status
- "description": a comprehensive cleaned-up summary of the pet including age, temperament, medical conditions, and any behavioural traits
- "locationName": full location/area — suburb, city, state if available
- "contactInfo": any contact info (phone, email, social media handle) from the post
- "reward": reward amount if mentioned (number only, no currency symbol)
- "postSummary": a 2-3 sentence summary capturing all key details for matching purposes

Return ONLY valid JSON, no markdown.`
          },
          {
            role: "user",
            content: contentToAnalyze
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const extractedContent = extractionResult.choices[0]?.message?.content || '{}';
      let extracted;
      try {
        extracted = JSON.parse(extractedContent);
      } catch {
        return res.status(500).json({ error: "Could not parse the post content" });
      }

      if (!extracted.isRelevant) {
        return res.json({
          extracted,
          matches: [],
          message: "This doesn't appear to be about a lost or found pet."
        });
      }

      interface ScanCandidate {
        type: string;
        id: string;
        summary: string;
        photos: string[];
      }

      const allCandidates: ScanCandidate[] = [];

      const filteredReports = (reports || []).filter(r => {
        if (extracted.petType !== 'unknown' && r.petType !== extracted.petType) return false;
        if (extracted.status === 'lost') return r.status === 'found';
        if (extracted.status === 'found') return r.status === 'lost';
        return true;
      });

      for (const r of filteredReports) {
        allCandidates.push({
          type: 'report',
          id: r.id,
          summary: `[App Report] ${r.status.toUpperCase()} ${r.petType} named "${r.petName}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.locationName}, date: ${r.lastSeenDate}, description: "${r.description}"`,
          photos: getReportPhotos(r),
        });
      }

      const filteredProfiles = (profiles || []).filter(p => {
        if (extracted.petType !== 'unknown' && p.petType !== extracted.petType) return false;
        return true;
      });

      for (const p of filteredProfiles) {
        const profilePhotos = getProfilePhotos(p);
        const biometricPhotos = getProfileBiometricPhotos(p);
        allCandidates.push({
          type: 'profile',
          id: p.id,
          summary: `[Registered Pet] ${p.petType} named "${p.petName}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, microchip: ${p.microchipNumber || 'none'}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s)` : ''}`,
          photos: [...profilePhotos, ...biometricPhotos],
        });
      }

      if (extracted.petType && extracted.petType !== 'unknown') {
        const orgAnimals = await getOrgAnimalCandidates(extracted.petType);
        for (const oa of orgAnimals) {
          const photos = Array.isArray(oa.photo_uris) ? oa.photo_uris : (typeof oa.photo_uris === 'string' ? JSON.parse(oa.photo_uris) : []);
          const orgLabel = oa.org_type === 'vet' ? 'Vet Clinic' : oa.org_type === 'rescue' ? 'Rescue Group' : 'Shelter';
          allCandidates.push({
            type: 'org_animal',
            id: oa.id,
            summary: `[${orgLabel}: ${oa.org_name}] ${oa.pet_type} named "${oa.pet_name}", breed: ${oa.breed}, size: ${oa.size}, color: ${oa.color}, markings: "${oa.markings}", intake: ${oa.intake_type}, microchip: ${oa.microchip_number || 'none'}, description: "${oa.description}"`,
            photos: photos.slice(0, 3),
          });
        }
      }

      if (allCandidates.length === 0) {
        return res.json({ extracted, matches: [] });
      }

      const scanCandidates = allCandidates.slice(0, MAX_VISION_CANDIDATES);
      const hasPhotos = scanCandidates.some(c => c.photos.length > 0);

      const postSummary = `${extracted.status?.toUpperCase() || 'UNKNOWN'} ${extracted.petType || 'pet'} named "${extracted.petName || 'unknown'}", breed: ${extracted.breed || 'unknown'}, size: ${extracted.size || 'unknown'}, color: ${extracted.color || 'unknown'}, markings: "${extracted.markings || 'none'}", location: ${extracted.locationName || 'unknown'}, description: "${extracted.description || ''}"`;

      const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

      if (hasPhotos) {
        userContent.push({
          type: "text",
          text: `PET FROM ONLINE POST:\n${postSummary}\n\nAPP DATABASE CANDIDATES WITH PHOTOS:`,
        });

        for (let i = 0; i < scanCandidates.length; i++) {
          const c = scanCandidates[i];
          if (c.photos.length > 0) {
            userContent.push({
              type: "text",
              text: `\nCANDIDATE ${i + 1} (${c.type}:${c.id}) — ${c.summary}\nPhoto(s):`,
            });
            for (const photo of c.photos.slice(0, 3)) {
              userContent.push(buildImageContent(photo));
            }
          } else {
            userContent.push({
              type: "text",
              text: `\nCANDIDATE ${i + 1} (${c.type}:${c.id}) — ${c.summary}\n(No photo)`,
            });
          }
        }
      } else {
        const candidateList = scanCandidates.map((c, i) =>
          `${i + 1}. (${c.type}:${c.id}) ${c.summary}`
        ).join('\n');

        userContent.push({
          type: "text",
          text: `Online post pet info:\n${postSummary}\n\nApp database candidates:\n${candidateList}`,
        });
      }

      const scanSystemPrompt = hasPhotos
        ? `You are an expert veterinary-grade AI pet identification system. Match pets from online social media posts against existing reports and registered profiles in a lost & found database.

VISUAL ANALYSIS PROTOCOL (primary when photos available):
1. BIOMETRIC FEATURES:
   - Nose print: ridge patterns, nostril shape, pigmentation
   - Eyes: iris color, shape, spacing, heterochromia
   - Facial geometry: muzzle, forehead, jaw, ear set angle
2. COAT ANALYSIS:
   - Color distribution: exact patch locations, transitions, gradients
   - Pattern: solid, bicolor, tricolor, tabby, brindle, merle, tuxedo
   - Unique markings: spots, patches, stripes with exact body position
3. DISTINGUISHING FEATURES:
   - Scars, collar/harness, ear notches, tail shape
   - Body build and proportions

TEXT ANALYSIS (secondary):
- Breed match (exact or compatible cross-breeds)
- Color and markings alignment with photos
- Size category, geographic proximity, timeline
- Description and behavioural details

SCORING:
- 90-100: Virtually certain — biometric/visual features confirm identity
- 80-89: Very strong — multiple unique features match
- 65-79: Good — visually similar, text aligns
- 50-64: Moderate — breed/color match, limited distinguishing evidence
- 35-49: Weak but worth reviewing
- Below 25: Do not include

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": candidate id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing specific visual features compared

Note: "org_animal" candidates are animals in the care of verified partner organisations (vet clinics, shelters, rescue groups).

Only include candidates with confidence >= 25. Return at most 10.
Return ONLY valid JSON, no markdown.`
        : `You are an expert AI pet matching system. Match pets from online social media posts against existing reports and registered profiles.

Analyse with rigorous attention:
- Breed: exact match is strongest; consider cross-breed compatibility
- Color: compare primary/secondary colors, pattern descriptions
- Markings: specific locations (face blaze, chest patch, paw markings)
- Size: must be same category
- Geographic proximity: location name matching, suburb/area overlap
- Description: behavioural traits, age, distinctive features

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": candidate id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing specific matching factors

Note: "org_animal" candidates are animals in the care of verified partner organisations (vet clinics, shelters, rescue groups).

Only include candidates with confidence >= 25. Return at most 10.
Return ONLY valid JSON, no markdown.`;

      const matchResult = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: scanSystemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const matchContent = matchResult.choices[0]?.message?.content || '{"matches":[]}';
      let matchParsed;
      try {
        matchParsed = JSON.parse(matchContent);
      } catch {
        matchParsed = { matches: [] };
      }

      const matches = (matchParsed.matches || matchParsed.results || [])
        .filter((m: any) => m.confidence >= 25)
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 10);

      return res.json({ extracted, matches });
    } catch (error) {
      console.error("Scan post error:", error);
      return res.status(500).json({ error: "Failed to analyze the post" });
    }
  });

  app.post("/api/quick-snap-match", async (req: Request, res: Response) => {
    try {
      const { photoUri, petType, reports, profiles } = req.body as {
        photoUri: string;
        petType?: string;
        reports: PetReport[];
        profiles: PetProfile[];
      };

      if (!photoUri) {
        return res.status(400).json({ error: "A photo is required" });
      }

      const validPhoto = photoUri.startsWith('data:') || photoUri.startsWith('http');
      if (!validPhoto) {
        return res.status(400).json({ error: "Invalid photo format" });
      }

      const lostReports = (reports || []).filter(r => {
        if (r.status !== 'lost') return false;
        if (petType && r.petType !== petType) return false;
        return true;
      });

      const allProfiles = (profiles || []).filter(p => {
        if (petType && p.petType !== petType) return false;
        return true;
      });

      interface SnapCandidate {
        type: string;
        id: string;
        summary: string;
        photos: string[];
      }

      const candidates: SnapCandidate[] = [];

      for (const r of lostReports) {
        candidates.push({
          type: 'report',
          id: r.id,
          summary: `[Lost Report] ${r.petType} named "${r.petName}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.locationName}, date: ${r.lastSeenDate}`,
          photos: getReportPhotos(r),
        });
      }

      for (const p of allProfiles) {
        const profilePhotos = getProfilePhotos(p);
        const biometricPhotos = getProfileBiometricPhotos(p);
        candidates.push({
          type: 'profile',
          id: p.id,
          summary: `[Registered Pet] ${p.petType} named "${p.petName}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, owner: ${p.ownerName}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s) (close-up nose/eyes/face)` : ''}`,
          photos: [...profilePhotos, ...biometricPhotos],
        });
      }

      const orgAnimals = await getOrgAnimalCandidates(petType || 'dog');
      for (const oa of orgAnimals) {
        const photos = Array.isArray(oa.photo_uris) ? oa.photo_uris : (typeof oa.photo_uris === 'string' ? JSON.parse(oa.photo_uris) : []);
        const orgLabel = oa.org_type === 'vet' ? 'Vet Clinic' : oa.org_type === 'rescue' ? 'Rescue Group' : 'Shelter';
        candidates.push({
          type: 'org_animal',
          id: oa.id,
          summary: `[${orgLabel}: ${oa.org_name}] ${oa.pet_type} named "${oa.pet_name}", breed: ${oa.breed}, size: ${oa.size}, color: ${oa.color}, markings: "${oa.markings}", intake: ${oa.intake_type}, microchip: ${oa.microchip_number || 'none'}, description: "${oa.description}"`,
          photos: photos.slice(0, 3),
        });
      }

      if (candidates.length === 0) {
        return res.json({ matches: [] });
      }

      const visionCandidates = candidates.slice(0, MAX_VISION_CANDIDATES);

      const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

      userContent.push({
        type: "text",
        text: `QUICK SNAP PHOTO — A photo taken by someone who spotted a pet and wants to identify it:\n`,
      });
      userContent.push(buildImageContent(photoUri));

      for (let i = 0; i < visionCandidates.length; i++) {
        const c = visionCandidates[i];
        if (c.photos.length > 0) {
          userContent.push({
            type: "text",
            text: `\nCANDIDATE ${i + 1} (${c.type}:${c.id}) — ${c.summary}\nCandidate photo(s):`,
          });
          for (const photo of c.photos.slice(0, 3)) {
            userContent.push(buildImageContent(photo));
          }
        } else {
          userContent.push({
            type: "text",
            text: `\nCANDIDATE ${i + 1} (${c.type}:${c.id}) — ${c.summary}\n(No photo available)`,
          });
        }
      }

      const snapSystemPrompt = `You are an expert veterinary-grade AI pet identification system specializing in visual biometric matching. A person has spotted a pet in the wild and taken a quick photo. Your critical task is to determine if this pet matches any lost pet reports or registered pet profiles using the highest standard of visual analysis.

BIOMETRIC IDENTIFICATION PROTOCOL (highest priority — treat like forensic analysis):

1. NOSE PRINT ANALYSIS (most reliable — unique to each animal like fingerprints):
   - Ridge pattern topology: bumps, grooves, texture map
   - Nostril shape: round, oval, asymmetric differences
   - Bridge width and pigmentation: color variations, spots on nose leather
   - Nose leather texture: smooth, rough, cracked patterns

2. EYE IDENTIFICATION:
   - Iris color: exact shade (amber, hazel, brown, blue, green, heterochromia)
   - Eye shape and size relative to head
   - Eye spacing: wide-set vs. close-set
   - Sclera visibility, tear staining patterns

3. FACIAL GEOMETRY (high reliability):
   - Muzzle length-to-width ratio
   - Forehead slope and width
   - Jaw shape: square, rounded, narrow
   - Ear set angle, ear shape (erect, folded, rose, button, pendulous)
   - Ear size relative to head, inner ear hair/coloring

4. COAT FORENSICS:
   - Color distribution map: document exact position of every color zone
   - Pattern classification: solid, bicolor, tricolor, tabby (mackerel/classic/spotted), brindle, merle, roan, ticking
   - Unique marking positions: left vs. right asymmetry, chest shapes (star, blaze, bib), leg socks
   - Coat texture visible: smooth, wiry, fluffy, double-coat evidence

5. BODY & DISTINGUISHING FEATURES:
   - Build: compact, athletic, stocky, leggy
   - Tail: length, curl, plume, bob, carriage
   - Scars, healed injuries, ear notches, tattoos
   - Collar, harness, tags visible

TEXT COMPARISON (secondary):
- Breed consistency with visual assessment
- Color and size match
- Markings alignment with what is visible

SCORING (be precise — lives depend on accuracy):
- 90-100: Virtually certain — multiple biometric features confirm (nose + eyes + unique markings align)
- 80-89: Very strong — clear biometric similarity, unique markings match
- 65-79: Good — multiple visual features match, breed and build consistent
- 50-64: Moderate — same breed/color, some features match but cannot confirm unique identity
- 35-49: Weak but possible — general similarity, worth human review
- Below 30: Do not include

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": candidate id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing SPECIFIC biometric and visual features compared (e.g., "Nose ridge pattern shows matching topology", "Distinctive white blaze on forehead matches in shape and position")

Note: "org_animal" candidates are animals in the care of verified partner organisations (vet clinics, shelters, rescue groups).

Only include confidence >= 30. Return at most 10 matches.
Return ONLY valid JSON, no markdown.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: snapSystemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });

      const content = completion.choices[0]?.message?.content || '{"matches":[]}';
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { matches: [] };
      }

      const matches = (parsed.matches || parsed.results || [])
        .filter((m: any) => m.confidence >= 30)
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 10);

      return res.json({ matches });
    } catch (error) {
      console.error("Quick snap match error:", error);
      return res.status(500).json({ error: "Failed to process snap match" });
    }
  });

  // ===== AUTH ROUTES =====
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.get("/api/auth/me", authMiddleware, getMe);

  // ===== PET REPORTS CRUD =====
  app.get("/api/reports", optionalAuth, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT r.*,
          COALESCE((SELECT COUNT(*) FROM report_likes WHERE report_id = r.id), 0)::int AS likes
        FROM pet_reports r
        ORDER BY
          CASE WHEN r.is_boosted = true AND r.boost_expires_at > NOW() THEN 0 ELSE 1 END,
          r.created_at DESC`
      );

      const reports = result.rows.map((row: any) => {
        const isOwner = req.user ? row.user_id === req.user.id : false;
        return mapReportRow(row, isOwner, false);
      });

      if (req.user) {
        const likedResult = await pool.query(
          'SELECT report_id FROM report_likes WHERE user_id = $1',
          [req.user.id]
        );
        const likedIds = new Set(likedResult.rows.map((r: any) => r.report_id));
        reports.forEach((r: any) => { r.likedByMe = likedIds.has(r.id); });
      }

      return res.json(reports);
    } catch (err) {
      console.error("Get reports error:", err);
      return res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", optionalAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT r.*,
          COALESCE((SELECT COUNT(*) FROM report_likes WHERE report_id = r.id), 0)::int AS likes
        FROM pet_reports r WHERE r.id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }
      const row = result.rows[0];
      const isOwner = req.user ? row.user_id === req.user.id : false;

      let likedByMe = false;
      if (req.user) {
        const likeCheck = await pool.query(
          'SELECT id FROM report_likes WHERE report_id = $1 AND user_id = $2',
          [id, req.user.id]
        );
        likedByMe = likeCheck.rows.length > 0;
      }

      const commentsResult = await pool.query(
        'SELECT * FROM comments WHERE report_id = $1 ORDER BY created_at ASC',
        [id]
      );
      const timelineResult = await pool.query(
        'SELECT * FROM timeline_events WHERE report_id = $1 ORDER BY created_at ASC',
        [id]
      );

      const report = mapReportRow(row, isOwner, likedByMe);
      report.comments = commentsResult.rows.map((c: any) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        createdAt: c.created_at.toISOString(),
      }));
      report.timeline = timelineResult.rows.map((t: any) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        createdAt: t.created_at.toISOString(),
      }));

      return res.json(report);
    } catch (err) {
      console.error("Get report error:", err);
      return res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.post("/api/reports", authMiddleware, async (req: Request, res: Response) => {
    try {
      const b = req.body;
      const result = await pool.query(
        `INSERT INTO pet_reports (user_id, status, pet_type, pet_name, breed, size, color, markings, photo_uri, photo_uris, description, latitude, longitude, location_name, last_seen_date, reward, contact_name, contact_phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING *`,
        [req.user!.id, b.status, b.petType, b.petName, b.breed || '', b.size || 'medium', b.color || '', b.markings || '', b.photoUri || '', JSON.stringify(b.photoUris || []), b.description || '', b.latitude || 0, b.longitude || 0, b.locationName || '', b.lastSeenDate || '', b.reward || '', b.contactName || '', b.contactPhone || '']
      );

      const reportId = result.rows[0].id;
      await pool.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'created', $2)`,
        [reportId, `Report created by ${b.contactName || req.user!.displayName}`]
      );

      return res.status(201).json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Create report error:", err);
      return res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.put("/api/reports/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT user_id FROM pet_reports WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user!.id) return res.status(403).json({ message: "Not authorised" });

      const b = req.body;
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const updatable: Record<string, string> = {
        status: 'status', petName: 'pet_name', breed: 'breed', size: 'size',
        color: 'color', markings: 'markings', photoUri: 'photo_uri',
        description: 'description', latitude: 'latitude', longitude: 'longitude',
        locationName: 'location_name', lastSeenDate: 'last_seen_date',
        reward: 'reward', contactName: 'contact_name', contactPhone: 'contact_phone',
        reunionMessage: 'reunion_message',
      };

      for (const [key, col] of Object.entries(updatable)) {
        if (b[key] !== undefined) {
          fields.push(`${col} = $${idx}`);
          values.push(b[key]);
          idx++;
        }
      }

      if (b.photoUris !== undefined) {
        fields.push(`photo_uris = $${idx}`);
        values.push(JSON.stringify(b.photoUris));
        idx++;
      }

      if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

      values.push(id);
      const result = await pool.query(
        `UPDATE pet_reports SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      return res.json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Update report error:", err);
      return res.status(500).json({ message: "Failed to update report" });
    }
  });

  app.delete("/api/reports/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT user_id FROM pet_reports WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user!.id) return res.status(403).json({ message: "Not authorised" });

      await pool.query('DELETE FROM pet_reports WHERE id = $1', [id]);
      return res.json({ message: "Report deleted" });
    } catch (err) {
      console.error("Delete report error:", err);
      return res.status(500).json({ message: "Failed to delete report" });
    }
  });

  app.post("/api/reports/:id/boost", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT user_id FROM pet_reports WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user!.id) return res.status(403).json({ message: "Not authorised" });

      const result = await pool.query(
        `UPDATE pet_reports SET is_boosted = true, boosted_at = NOW(), boost_expires_at = NOW() + INTERVAL '7 days' WHERE id = $1 RETURNING *`,
        [id]
      );

      await pool.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'status_change', 'Report boosted to priority listing for 7 days')`,
        [id]
      );

      return res.json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Boost report error:", err);
      return res.status(500).json({ message: "Failed to boost report" });
    }
  });

  app.post("/api/reports/:id/reunite", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message: reunionMsg } = req.body;
      const existing = await pool.query('SELECT user_id, pet_name FROM pet_reports WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user!.id) return res.status(403).json({ message: "Not authorised" });

      const msg = reunionMsg || `${existing.rows[0].pet_name} has been reunited with their owner!`;
      const result = await pool.query(
        `UPDATE pet_reports SET status = 'reunited', reunion_message = $1, reunion_date = NOW() WHERE id = $2 RETURNING *`,
        [msg, id]
      );

      await pool.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'status_change', 'Pet reunited with owner!')`,
        [id]
      );

      return res.json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Reunite error:", err);
      return res.status(500).json({ message: "Failed to mark as reunited" });
    }
  });

  app.post("/api/reports/:id/comments", optionalAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { author, text } = req.body;
      if (!text) return res.status(400).json({ message: "Comment text is required" });

      const moderation = moderateContent(text);
      const cleanText = moderation.filteredText;

      const authorName = author || (req.user ? req.user.displayName : 'Anonymous');
      const result = await pool.query(
        'INSERT INTO comments (report_id, user_id, author, text) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, req.user?.id || null, authorName, cleanText]
      );

      await pool.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'comment', $2)`,
        [id, `${authorName} commented: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`]
      );

      const c = result.rows[0];
      return res.status(201).json({ id: c.id, author: c.author, text: c.text, createdAt: c.created_at.toISOString() });
    } catch (err) {
      console.error("Add comment error:", err);
      return res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.post("/api/reports/:id/like", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await pool.query(
        'SELECT id FROM report_likes WHERE report_id = $1 AND user_id = $2',
        [id, req.user!.id]
      );

      if (existing.rows.length > 0) {
        await pool.query('DELETE FROM report_likes WHERE report_id = $1 AND user_id = $2', [id, req.user!.id]);
      } else {
        await pool.query('INSERT INTO report_likes (report_id, user_id) VALUES ($1, $2)', [id, req.user!.id]);
      }

      const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM report_likes WHERE report_id = $1', [id]);
      return res.json({ likes: countResult.rows[0].count, likedByMe: existing.rows.length === 0 });
    } catch (err) {
      console.error("Like error:", err);
      return res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post("/api/reports/:id/reward", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

      const result = await pool.query(
        'UPDATE pet_reports SET reward_pool = reward_pool + $1 WHERE id = $2 RETURNING *',
        [amount, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: "Report not found" });

      await pool.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'sighting', $2)`,
        [id, `$${amount} added to reward pool`]
      );

      return res.json({ rewardPool: result.rows[0].reward_pool });
    } catch (err) {
      console.error("Reward error:", err);
      return res.status(500).json({ message: "Failed to add reward" });
    }
  });

  // ===== PET PROFILES CRUD =====
  app.get("/api/profiles", authMiddleware, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT * FROM pet_profiles WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user!.id]
      );
      return res.json(result.rows.map(mapProfileRow));
    } catch (err) {
      console.error("Get profiles error:", err);
      return res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get("/api/profiles/all", optionalAuth, async (_req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM pet_profiles ORDER BY created_at DESC');
      return res.json(result.rows.map(mapProfileRow));
    } catch (err) {
      console.error("Get all profiles error:", err);
      return res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get("/api/suburbs", optionalAuth, async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT suburb, COUNT(*)::int AS count, 
         array_agg(DISTINCT pet_type) AS pet_types
         FROM pet_profiles 
         WHERE suburb IS NOT NULL AND suburb != ''
         GROUP BY suburb 
         ORDER BY count DESC, suburb ASC`
      );
      return res.json(result.rows.map((r: any) => ({
        suburb: r.suburb,
        count: r.count,
        petTypes: r.pet_types || [],
      })));
    } catch (err) {
      console.error("Get suburbs error:", err);
      return res.status(500).json({ message: "Failed to fetch suburbs" });
    }
  });

  app.get("/api/profiles/suburb/:suburb", optionalAuth, async (req: Request, res: Response) => {
    try {
      const { suburb } = req.params;
      const result = await pool.query(
        `SELECT pp.id, pp.pet_type, pp.pet_name, pp.breed, pp.size, pp.color, pp.markings,
                pp.photo_uris, pp.suburb, pp.microchip_number, pp.created_at,
                u.display_name as owner_display_name 
         FROM pet_profiles pp 
         JOIN users u ON pp.user_id = u.id 
         WHERE LOWER(pp.suburb) = LOWER($1) 
         ORDER BY pp.created_at DESC`,
        [suburb]
      );
      return res.json(result.rows.map((row: any) => ({
        id: row.id,
        petType: row.pet_type,
        petName: row.pet_name,
        breed: row.breed,
        size: row.size,
        color: row.color,
        markings: row.markings,
        photoUris: typeof row.photo_uris === 'string' ? JSON.parse(row.photo_uris) : (row.photo_uris || []),
        suburb: row.suburb,
        hasChip: !!row.microchip_number,
        ownerDisplayName: row.owner_display_name,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      })));
    } catch (err) {
      console.error("Get profiles by suburb error:", err);
      return res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.post("/api/profiles", authMiddleware, async (req: Request, res: Response) => {
    try {
      const b = req.body;
      const result = await pool.query(
        `INSERT INTO pet_profiles (user_id, pet_type, pet_name, breed, size, color, markings, photo_uris, biometric_photo_uris, microchip_number, medical_notes, suburb, owner_name, owner_phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [req.user!.id, b.petType, b.petName, b.breed || '', b.size || 'medium', b.color || '', b.markings || '', JSON.stringify(b.photoUris || []), JSON.stringify(b.biometricPhotoUris || []), b.microchipNumber || '', b.medicalNotes || '', b.suburb || '', b.ownerName || '', b.ownerPhone || '']
      );
      return res.status(201).json(mapProfileRow(result.rows[0]));
    } catch (err) {
      console.error("Create profile error:", err);
      return res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profiles/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT user_id FROM pet_profiles WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
      if (existing.rows[0].user_id !== req.user!.id) return res.status(403).json({ message: "Not authorised" });

      const b = req.body;
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const updatable: Record<string, string> = {
        petType: 'pet_type', petName: 'pet_name', breed: 'breed', size: 'size',
        color: 'color', markings: 'markings', microchipNumber: 'microchip_number',
        medicalNotes: 'medical_notes', suburb: 'suburb', ownerName: 'owner_name', ownerPhone: 'owner_phone',
      };

      for (const [key, col] of Object.entries(updatable)) {
        if (b[key] !== undefined) {
          fields.push(`${col} = $${idx}`);
          values.push(b[key]);
          idx++;
        }
      }

      if (b.photoUris !== undefined) {
        fields.push(`photo_uris = $${idx}`);
        values.push(JSON.stringify(b.photoUris));
        idx++;
      }

      if (b.biometricPhotoUris !== undefined) {
        fields.push(`biometric_photo_uris = $${idx}`);
        values.push(JSON.stringify(b.biometricPhotoUris));
        idx++;
      }

      fields.push(`updated_at = NOW()`);

      if (fields.length <= 1) return res.status(400).json({ message: "No fields to update" });

      values.push(id);
      const result = await pool.query(
        `UPDATE pet_profiles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      return res.json(mapProfileRow(result.rows[0]));
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT user_id FROM pet_profiles WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
      if (existing.rows[0].user_id !== req.user!.id) return res.status(403).json({ message: "Not authorised" });

      await pool.query('DELETE FROM pet_profiles WHERE id = $1', [id]);
      return res.json({ message: "Profile deleted" });
    } catch (err) {
      console.error("Delete profile error:", err);
      return res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // ===== NOTIFICATIONS =====
  app.get("/api/notifications", authMiddleware, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
        [req.user!.id]
      );
      return res.json(result.rows.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        reportId: n.report_id,
        profileId: n.profile_id,
        read: n.read,
        createdAt: n.created_at.toISOString(),
      })));
    } catch (err) {
      console.error("Get notifications error:", err);
      return res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", authMiddleware, async (req: Request, res: Response) => {
    try {
      await pool.query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user!.id]
      );
      return res.json({ message: "Marked as read" });
    } catch (err) {
      console.error("Mark read error:", err);
      return res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.post("/api/notifications/read-all", authMiddleware, async (req: Request, res: Response) => {
    try {
      await pool.query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user!.id]);
      return res.json({ message: "All marked as read" });
    } catch (err) {
      console.error("Mark all read error:", err);
      return res.status(500).json({ message: "Failed to mark all as read" });
    }
  });

  app.delete("/api/notifications", authMiddleware, async (req: Request, res: Response) => {
    try {
      await pool.query('DELETE FROM notifications WHERE user_id = $1', [req.user!.id]);
      return res.json({ message: "Notifications cleared" });
    } catch (err) {
      console.error("Clear notifications error:", err);
      return res.status(500).json({ message: "Failed to clear notifications" });
    }
  });

  // ===== BLOCK & REPORT ROUTES =====
  app.post("/api/users/:id/block", authMiddleware, async (req: Request, res: Response) => {
    try {
      const blockedId = req.params.id;
      if (blockedId === req.user!.id) {
        return res.status(400).json({ message: "You cannot block yourself" });
      }
      try {
        await pool.query(
          'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2)',
          [req.user!.id, blockedId]
        );
      } catch (e: any) {
        if (e.code === '23505') {
          return res.json({ message: "User already blocked" });
        }
        throw e;
      }
      return res.json({ message: "User blocked" });
    } catch (err) {
      console.error("Block user error:", err);
      return res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.delete("/api/users/:id/block", authMiddleware, async (req: Request, res: Response) => {
    try {
      await pool.query(
        'DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2',
        [req.user!.id, req.params.id]
      );
      return res.json({ message: "User unblocked" });
    } catch (err) {
      console.error("Unblock user error:", err);
      return res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  app.get("/api/users/blocked", authMiddleware, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT b.blocked_id, u.display_name, b.created_at
         FROM blocked_users b JOIN users u ON u.id = b.blocked_id
         WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`,
        [req.user!.id]
      );
      return res.json(result.rows.map((r: any) => ({
        id: r.blocked_id,
        displayName: r.display_name,
        blockedAt: r.created_at.toISOString(),
      })));
    } catch (err) {
      console.error("Get blocked users error:", err);
      return res.status(500).json({ message: "Failed to fetch blocked users" });
    }
  });

  app.post("/api/content-report", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { reportId, commentId, reason, details } = req.body;
      if (!reason) return res.status(400).json({ message: "Reason is required" });
      if (!reportId && !commentId) return res.status(400).json({ message: "Must specify a report or comment to flag" });

      await pool.query(
        'INSERT INTO content_reports (reporter_id, report_id, comment_id, reason, details) VALUES ($1, $2, $3, $4, $5)',
        [req.user!.id, reportId || null, commentId || null, reason, details || null]
      );
      return res.json({ message: "Content reported. We will review it shortly." });
    } catch (err) {
      console.error("Content report error:", err);
      return res.status(500).json({ message: "Failed to report content" });
    }
  });

  // ===== REFERRAL & AMBASSADOR ROUTES =====
  app.get("/api/referral", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userResult = await pool.query(
        'SELECT referral_code, premium_until FROM users WHERE id = $1',
        [req.user!.id]
      );
      const referralCode = userResult.rows[0]?.referral_code || '';
      const premiumUntil = userResult.rows[0]?.premium_until;

      const referralCount = await pool.query(
        'SELECT COUNT(*)::int AS count FROM users WHERE referred_by = $1',
        [req.user!.id]
      );

      const rewardsResult = await pool.query(
        'SELECT type, days_awarded, reason, created_at FROM referral_rewards WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user!.id]
      );

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const sharesResult = await pool.query(
        'SELECT platform, shared_date FROM social_shares WHERE user_id = $1 AND shared_date >= $2 ORDER BY shared_date DESC',
        [req.user!.id, startOfMonth.toISOString()]
      );

      const totalSharesThisMonth = sharesResult.rows.length;

      return res.json({
        referralCode,
        referralCount: referralCount.rows[0].count,
        premiumUntil: premiumUntil ? new Date(premiumUntil).toISOString() : null,
        rewards: rewardsResult.rows.map((r: any) => ({
          type: r.type,
          daysAwarded: r.days_awarded,
          reason: r.reason,
          createdAt: r.created_at.toISOString(),
        })),
        sharesThisMonth: totalSharesThisMonth,
        shares: sharesResult.rows.map((s: any) => ({
          platform: s.platform,
          date: s.shared_date,
        })),
      });
    } catch (err) {
      console.error("Get referral info error:", err);
      return res.status(500).json({ message: "Failed to fetch referral info" });
    }
  });

  app.post("/api/referral/log-share", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { platform } = req.body;
      if (!platform) return res.status(400).json({ message: "Platform is required" });

      const validPlatforms = ['instagram', 'facebook', 'tiktok'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ message: "Invalid platform" });
      }

      try {
        await pool.query(
          'INSERT INTO social_shares (user_id, platform) VALUES ($1, $2)',
          [req.user!.id, platform]
        );
      } catch (e: any) {
        if (e.code === '23505') {
          return res.status(409).json({ message: "You already logged a share on this platform today" });
        }
        throw e;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const countResult = await pool.query(
        'SELECT COUNT(*)::int AS count FROM social_shares WHERE user_id = $1 AND shared_date >= $2',
        [req.user!.id, startOfMonth.toISOString()]
      );

      const totalShares = countResult.rows[0].count;

      if (totalShares === 20) {
        await awardPremiumDays(req.user!.id, 7, 'ambassador', 'Social ambassador - 20 shares this month - earned 1 free week');
      }

      return res.json({
        message: "Share logged",
        sharesThisMonth: totalShares,
        rewardEarned: totalShares === 20,
      });
    } catch (err) {
      console.error("Log share error:", err);
      return res.status(500).json({ message: "Failed to log share" });
    }
  });

  app.delete("/api/account", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      await pool.query('DELETE FROM comments WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM report_likes WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM content_reports WHERE reporter_id = $1', [userId]);
      await pool.query('DELETE FROM blocked_users WHERE blocker_id = $1 OR blocked_id = $1', [userId]);
      await pool.query('DELETE FROM referral_shares WHERE user_id = $1', [userId]);

      const profileIds = await pool.query('SELECT id FROM pet_profiles WHERE user_id = $1', [userId]);
      for (const p of profileIds.rows) {
        await pool.query('DELETE FROM biometric_scans WHERE profile_id = $1', [p.id]);
      }
      await pool.query('DELETE FROM pet_profiles WHERE user_id = $1', [userId]);

      const reportIds = await pool.query('SELECT id FROM pet_reports WHERE user_id = $1', [userId]);
      for (const r of reportIds.rows) {
        await pool.query('DELETE FROM timeline_events WHERE report_id = $1', [r.id]);
        await pool.query('DELETE FROM comments WHERE report_id = $1', [r.id]);
        await pool.query('DELETE FROM report_likes WHERE report_id = $1', [r.id]);
      }
      await pool.query('DELETE FROM pet_reports WHERE user_id = $1', [userId]);

      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      return res.json({ message: "Account and all associated data deleted successfully" });
    } catch (err) {
      console.error("Delete account error:", err);
      return res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // ===== ORGANISATION ROUTES =====

  app.post("/api/org/register", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, type, abn, address, phone, email, website, latitude, longitude, description, logoUri } = req.body;

      if (!name || !type || !address || !phone || !email) {
        return res.status(400).json({ message: "Name, type, address, phone, and email are required" });
      }

      if (!['vet', 'shelter', 'rescue'].includes(type)) {
        return res.status(400).json({ message: "Type must be vet, shelter, or rescue" });
      }

      const existing = await pool.query('SELECT id FROM organisations WHERE user_id = $1', [userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: "You already have a registered organisation" });
      }

      const result = await pool.query(
        `INSERT INTO organisations (user_id, name, type, abn, address, phone, email, website, latitude, longitude, description, logo_uri)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [userId, name, type, abn || null, address, phone, email, website || null, latitude || 0, longitude || 0, description || null, logoUri || null]
      );

      await pool.query("UPDATE users SET role = 'org' WHERE id = $1", [userId]);

      const org = result.rows[0];
      return res.status(201).json({
        id: org.id, userId: org.user_id, name: org.name, type: org.type, abn: org.abn,
        address: org.address, phone: org.phone, email: org.email, website: org.website,
        latitude: org.latitude, longitude: org.longitude, description: org.description,
        logoUri: org.logo_uri, status: org.status, approvedAt: org.approved_at, createdAt: org.created_at,
      });
    } catch (err) {
      console.error("Org register error:", err);
      return res.status(500).json({ message: "Failed to register organisation" });
    }
  });

  app.get("/api/org/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM organisations WHERE user_id = $1', [req.user!.id]);
      if (result.rows.length === 0) {
        return res.json(null);
      }
      const org = result.rows[0];
      const animalCount = await pool.query('SELECT COUNT(*)::int AS count FROM organisation_animals WHERE org_id = $1', [org.id]);
      return res.json({
        id: org.id, userId: org.user_id, name: org.name, type: org.type, abn: org.abn,
        address: org.address, phone: org.phone, email: org.email, website: org.website,
        latitude: org.latitude, longitude: org.longitude, description: org.description,
        logoUri: org.logo_uri, status: org.status, approvedAt: org.approved_at, createdAt: org.created_at,
        animalCount: animalCount.rows[0].count,
      });
    } catch (err) {
      console.error("Get org error:", err);
      return res.status(500).json({ message: "Failed to get organisation" });
    }
  });

  app.put("/api/org/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const org = await pool.query('SELECT id FROM organisations WHERE user_id = $1', [userId]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const orgId = org.rows[0].id;
      const { name, type, abn, address, phone, email, website, latitude, longitude, description, logoUri } = req.body;
      if (type && !['vet', 'shelter', 'rescue'].includes(type)) {
        return res.status(400).json({ message: "Type must be vet, shelter, or rescue" });
      }
      const result = await pool.query(
        `UPDATE organisations SET name = COALESCE($1, name), type = COALESCE($2, type), abn = $3, address = COALESCE($4, address),
         phone = COALESCE($5, phone), email = COALESCE($6, email), website = $7, latitude = COALESCE($8, latitude),
         longitude = COALESCE($9, longitude), description = $10, logo_uri = $11
         WHERE id = $12 RETURNING *`,
        [name, type, abn || null, address, phone, email, website || null, latitude, longitude, description || null, logoUri || null, orgId]
      );
      const o = result.rows[0];
      return res.json({
        id: o.id, userId: o.user_id, name: o.name, type: o.type, abn: o.abn,
        address: o.address, phone: o.phone, email: o.email, website: o.website,
        latitude: o.latitude, longitude: o.longitude, description: o.description,
        logoUri: o.logo_uri, status: o.status, approvedAt: o.approved_at, createdAt: o.created_at,
      });
    } catch (err) {
      console.error("Update org error:", err);
      return res.status(500).json({ message: "Failed to update organisation" });
    }
  });

  app.get("/api/org/animals", authMiddleware, async (req: Request, res: Response) => {
    try {
      const org = await pool.query('SELECT id FROM organisations WHERE user_id = $1', [req.user!.id]);
      if (org.rows.length === 0) {
        return res.json([]);
      }
      const result = await pool.query(
        'SELECT * FROM organisation_animals WHERE org_id = $1 ORDER BY created_at DESC',
        [org.rows[0].id]
      );
      return res.json(result.rows.map((a: any) => ({
        id: a.id, orgId: a.org_id, petType: a.pet_type, petName: a.pet_name, breed: a.breed,
        size: a.size, color: a.color, markings: a.markings, photoUris: a.photo_uris || [],
        description: a.description, intakeDate: a.intake_date, intakeType: a.intake_type,
        microchipNumber: a.microchip_number, desexed: a.desexed, status: a.status,
        createdAt: a.created_at, updatedAt: a.updated_at,
      })));
    } catch (err) {
      console.error("Get org animals error:", err);
      return res.status(500).json({ message: "Failed to get animals" });
    }
  });

  app.get("/api/org/animals/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const org = await pool.query('SELECT id FROM organisations WHERE user_id = $1', [req.user!.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const result = await pool.query(
        'SELECT * FROM organisation_animals WHERE id = $1 AND org_id = $2',
        [req.params.id, org.rows[0].id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Animal not found" });
      }
      const a = result.rows[0];
      return res.json({
        id: a.id, orgId: a.org_id, petType: a.pet_type, petName: a.pet_name, breed: a.breed,
        size: a.size, color: a.color, markings: a.markings, photoUris: a.photo_uris || [],
        description: a.description, intakeDate: a.intake_date, intakeType: a.intake_type,
        microchipNumber: a.microchip_number, desexed: a.desexed, status: a.status,
        createdAt: a.created_at, updatedAt: a.updated_at,
      });
    } catch (err) {
      console.error("Get org animal error:", err);
      return res.status(500).json({ message: "Failed to get animal" });
    }
  });

  app.post("/api/org/animals", authMiddleware, async (req: Request, res: Response) => {
    try {
      const org = await pool.query('SELECT id, status FROM organisations WHERE user_id = $1', [req.user!.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      if (org.rows[0].status !== 'approved') {
        return res.status(403).json({ message: "Organisation must be approved to add animals" });
      }
      const orgId = org.rows[0].id;
      const { petType, petName, breed, size, color, markings, photoUris, description, intakeDate, intakeType, microchipNumber, desexed } = req.body;
      if (!petType) {
        return res.status(400).json({ message: "Pet type is required" });
      }
      if (!['dog', 'cat', 'bird', 'rabbit', 'other'].includes(petType)) {
        return res.status(400).json({ message: "Invalid pet type" });
      }
      if (size && !['small', 'medium', 'large'].includes(size)) {
        return res.status(400).json({ message: "Invalid size" });
      }
      if (intakeType && !['stray', 'surrendered', 'rescue', 'transferred'].includes(intakeType)) {
        return res.status(400).json({ message: "Invalid intake type" });
      }
      const result = await pool.query(
        `INSERT INTO organisation_animals (org_id, pet_type, pet_name, breed, size, color, markings, photo_uris, description, intake_date, intake_type, microchip_number, desexed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [orgId, petType, petName || '', breed || '', size || 'medium', color || '', markings || '', JSON.stringify(photoUris || []), description || '', intakeDate || null, intakeType || 'stray', microchipNumber || null, desexed || false]
      );
      const a = result.rows[0];
      return res.status(201).json({
        id: a.id, orgId: a.org_id, petType: a.pet_type, petName: a.pet_name, breed: a.breed,
        size: a.size, color: a.color, markings: a.markings, photoUris: a.photo_uris || [],
        description: a.description, intakeDate: a.intake_date, intakeType: a.intake_type,
        microchipNumber: a.microchip_number, desexed: a.desexed, status: a.status,
        createdAt: a.created_at, updatedAt: a.updated_at,
      });
    } catch (err) {
      console.error("Add org animal error:", err);
      return res.status(500).json({ message: "Failed to add animal" });
    }
  });

  app.put("/api/org/animals/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const animalId = req.params.id;
      const org = await pool.query('SELECT id FROM organisations WHERE user_id = $1', [req.user!.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const animal = await pool.query('SELECT id FROM organisation_animals WHERE id = $1 AND org_id = $2', [animalId, org.rows[0].id]);
      if (animal.rows.length === 0) {
        return res.status(404).json({ message: "Animal not found" });
      }
      const { petType, petName, breed, size, color, markings, photoUris, description, intakeDate, intakeType, microchipNumber, desexed, status } = req.body;
      if (petType && !['dog', 'cat', 'bird', 'rabbit', 'other'].includes(petType)) {
        return res.status(400).json({ message: "Invalid pet type" });
      }
      if (size && !['small', 'medium', 'large'].includes(size)) {
        return res.status(400).json({ message: "Invalid size" });
      }
      if (intakeType && !['stray', 'surrendered', 'rescue', 'transferred'].includes(intakeType)) {
        return res.status(400).json({ message: "Invalid intake type" });
      }
      if (status && !['available', 'adopted', 'on_hold', 'fostered'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const result = await pool.query(
        `UPDATE organisation_animals SET pet_type = COALESCE($1, pet_type), pet_name = COALESCE($2, pet_name),
         breed = COALESCE($3, breed), size = COALESCE($4, size), color = COALESCE($5, color),
         markings = COALESCE($6, markings), photo_uris = COALESCE($7, photo_uris),
         description = COALESCE($8, description), intake_date = $9, intake_type = COALESCE($10, intake_type),
         microchip_number = $11, desexed = COALESCE($12, desexed), status = COALESCE($13, status),
         updated_at = NOW() WHERE id = $14 RETURNING *`,
        [petType, petName, breed, size, color, markings, photoUris ? JSON.stringify(photoUris) : null, description, intakeDate || null, intakeType, microchipNumber || null, desexed, status, animalId]
      );
      const a = result.rows[0];
      return res.json({
        id: a.id, orgId: a.org_id, petType: a.pet_type, petName: a.pet_name, breed: a.breed,
        size: a.size, color: a.color, markings: a.markings, photoUris: a.photo_uris || [],
        description: a.description, intakeDate: a.intake_date, intakeType: a.intake_type,
        microchipNumber: a.microchip_number, desexed: a.desexed, status: a.status,
        createdAt: a.created_at, updatedAt: a.updated_at,
      });
    } catch (err) {
      console.error("Update org animal error:", err);
      return res.status(500).json({ message: "Failed to update animal" });
    }
  });

  app.delete("/api/org/animals/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const org = await pool.query('SELECT id FROM organisations WHERE user_id = $1', [req.user!.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const result = await pool.query('DELETE FROM organisation_animals WHERE id = $1 AND org_id = $2 RETURNING id', [req.params.id, org.rows[0].id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Animal not found" });
      }
      return res.json({ message: "Animal deleted" });
    } catch (err) {
      console.error("Delete org animal error:", err);
      return res.status(500).json({ message: "Failed to delete animal" });
    }
  });

  app.get("/api/org/public", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT o.*, COUNT(oa.id)::int AS animal_count
         FROM organisations o
         LEFT JOIN organisation_animals oa ON oa.org_id = o.id AND oa.status = 'available'
         WHERE o.status = 'approved'
         GROUP BY o.id
         ORDER BY o.name`
      );
      return res.json(result.rows.map((o: any) => ({
        id: o.id, userId: o.user_id, name: o.name, type: o.type, abn: o.abn,
        address: o.address, phone: o.phone, email: o.email, website: o.website,
        latitude: o.latitude, longitude: o.longitude, description: o.description,
        logoUri: o.logo_uri, status: o.status, approvedAt: o.approved_at, createdAt: o.created_at,
        animalCount: o.animal_count,
      })));
    } catch (err) {
      console.error("Get public orgs error:", err);
      return res.status(500).json({ message: "Failed to get organisations" });
    }
  });

  app.get("/api/org/:id/animals", async (req: Request, res: Response) => {
    try {
      const org = await pool.query("SELECT id, name, type, status FROM organisations WHERE id = $1 AND status = 'approved'", [req.params.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "Organisation not found" });
      }
      const result = await pool.query(
        "SELECT * FROM organisation_animals WHERE org_id = $1 AND status = 'available' ORDER BY created_at DESC",
        [req.params.id]
      );
      return res.json(result.rows.map((a: any) => ({
        id: a.id, orgId: a.org_id, petType: a.pet_type, petName: a.pet_name, breed: a.breed,
        size: a.size, color: a.color, markings: a.markings, photoUris: a.photo_uris || [],
        description: a.description, intakeDate: a.intake_date, intakeType: a.intake_type,
        microchipNumber: a.microchip_number, desexed: a.desexed, status: a.status,
        createdAt: a.created_at, updatedAt: a.updated_at,
        orgName: org.rows[0].name, orgType: org.rows[0].type,
      })));
    } catch (err) {
      console.error("Get org animals public error:", err);
      return res.status(500).json({ message: "Failed to get animals" });
    }
  });

  // ===== ADMIN ROUTES =====

  app.get("/api/admin/org/pending", authMiddleware, requireRole('admin'), async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT o.*, u.email AS registrant_email, u.display_name AS registrant_name
         FROM organisations o JOIN users u ON u.id = o.user_id
         WHERE o.status = 'pending' ORDER BY o.created_at`
      );
      return res.json(result.rows.map((o: any) => ({
        id: o.id, userId: o.user_id, name: o.name, type: o.type, abn: o.abn,
        address: o.address, phone: o.phone, email: o.email, website: o.website,
        latitude: o.latitude, longitude: o.longitude, description: o.description,
        logoUri: o.logo_uri, status: o.status, createdAt: o.created_at,
        registrantEmail: o.registrant_email, registrantName: o.registrant_name,
      })));
    } catch (err) {
      console.error("Get pending orgs error:", err);
      return res.status(500).json({ message: "Failed to get pending organisations" });
    }
  });

  app.post("/api/admin/org/:id/approve", authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        "UPDATE organisations SET status = 'approved', approved_at = NOW() WHERE id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Organisation not found" });
      }
      return res.json({ message: "Organisation approved", id: req.params.id });
    } catch (err) {
      console.error("Approve org error:", err);
      return res.status(500).json({ message: "Failed to approve" });
    }
  });

  app.post("/api/admin/org/:id/reject", authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        "UPDATE organisations SET status = 'rejected' WHERE id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Organisation not found" });
      }
      return res.json({ message: "Organisation rejected", id: req.params.id });
    } catch (err) {
      console.error("Reject org error:", err);
      return res.status(500).json({ message: "Failed to reject" });
    }
  });

  // ===== MESSAGING =====

  app.get("/api/conversations", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const result = await pool.query(
        `SELECT c.*,
          u1.display_name AS participant1_name,
          u2.display_name AS participant2_name,
          pr.pet_name AS report_pet_name,
          pr.status AS report_status,
          pr.photo_uri AS report_photo,
          (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.read_at IS NULL) AS unread_count
         FROM conversations c
         JOIN users u1 ON u1.id = c.participant1_id
         JOIN users u2 ON u2.id = c.participant2_id
         LEFT JOIN pet_reports pr ON pr.id = c.report_id
         WHERE c.participant1_id = $1 OR c.participant2_id = $1
         ORDER BY c.last_message_at DESC`,
        [userId]
      );
      return res.json(result.rows.map((r: any) => ({
        id: r.id,
        reportId: r.report_id,
        reportPetName: r.report_pet_name || null,
        reportStatus: r.report_status || null,
        reportPhoto: r.report_photo || null,
        otherUserId: r.participant1_id === userId ? r.participant2_id : r.participant1_id,
        otherUserName: r.participant1_id === userId ? r.participant2_name : r.participant1_name,
        lastMessageText: r.last_message_text,
        lastMessageAt: r.last_message_at instanceof Date ? r.last_message_at.toISOString() : r.last_message_at,
        unreadCount: r.unread_count,
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      })));
    } catch (err) {
      console.error("Get conversations error:", err);
      return res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/unread-count", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
         AND m.sender_id != $1 AND m.read_at IS NULL`,
        [userId]
      );
      return res.json({ count: result.rows[0]?.count || 0 });
    } catch (err) {
      console.error("Unread count error:", err);
      return res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  app.post("/api/conversations", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { reportId, recipientId } = req.body;
      if (!recipientId) return res.status(400).json({ message: "recipientId is required" });
      if (recipientId === userId) return res.status(400).json({ message: "Cannot message yourself" });

      const p1 = userId < recipientId ? userId : recipientId;
      const p2 = userId < recipientId ? recipientId : userId;

      const existing = await pool.query(
        reportId
          ? `SELECT id FROM conversations WHERE report_id = $1 AND participant1_id = $2 AND participant2_id = $3`
          : `SELECT id FROM conversations WHERE report_id IS NULL AND participant1_id = $1 AND participant2_id = $2`,
        reportId ? [reportId, p1, p2] : [p1, p2]
      );

      if (existing.rows.length > 0) {
        return res.json({ conversationId: existing.rows[0].id, existing: true });
      }

      const result = await pool.query(
        `INSERT INTO conversations (report_id, participant1_id, participant2_id) VALUES ($1, $2, $3) RETURNING id`,
        [reportId || null, p1, p2]
      );
      return res.status(201).json({ conversationId: result.rows[0].id, existing: false });
    } catch (err) {
      console.error("Create conversation error:", err);
      return res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const conv = await pool.query(
        `SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)`,
        [id, userId]
      );
      if (conv.rows.length === 0) return res.status(404).json({ message: "Conversation not found" });

      await pool.query(
        `UPDATE messages SET read_at = NOW() WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
        [id, userId]
      );

      const result = await pool.query(
        `SELECT m.*, u.display_name AS sender_name FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC`,
        [id]
      );
      return res.json(result.rows.map((r: any) => ({
        id: r.id,
        senderId: r.sender_id,
        senderName: r.sender_name,
        text: r.text,
        isMe: r.sender_id === userId,
        readAt: r.read_at ? (r.read_at instanceof Date ? r.read_at.toISOString() : r.read_at) : null,
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      })));
    } catch (err) {
      console.error("Get messages error:", err);
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { text } = req.body;
      if (!text || !text.trim()) return res.status(400).json({ message: "Message text is required" });

      const conv = await pool.query(
        `SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)`,
        [id, userId]
      );
      if (conv.rows.length === 0) return res.status(404).json({ message: "Conversation not found" });

      const result = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *`,
        [id, userId, text.trim()]
      );

      await pool.query(
        `UPDATE conversations SET last_message_text = $1, last_message_at = NOW() WHERE id = $2`,
        [text.trim().substring(0, 200), id]
      );

      const otherId = conv.rows[0].participant1_id === userId ? conv.rows[0].participant2_id : conv.rows[0].participant1_id;
      const senderName = req.user!.displayName;
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'message', $2, $3)`,
        [otherId, `New message from ${senderName}`, text.trim().substring(0, 100)]
      );

      const msg = result.rows[0];
      return res.status(201).json({
        id: msg.id,
        senderId: msg.sender_id,
        senderName,
        text: msg.text,
        isMe: true,
        readAt: null,
        createdAt: msg.created_at instanceof Date ? msg.created_at.toISOString() : msg.created_at,
      });
    } catch (err) {
      console.error("Send message error:", err);
      return res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
