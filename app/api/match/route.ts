
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';
import { getDistance } from '@/lib/geo';

const RADIUS_KM = 30;
const MAX_VISION_CANDIDATES = 15;

function getReportPhotos(report: any): string[] {
  const photos = [];
  if (report.photo_uris && Array.isArray(report.photo_uris)) {
    photos.push(...report.photo_uris);
  } else if (report.photo_uri) {
    photos.push(report.photo_uri);
  }
  return photos.filter(p => p && (p.startsWith('data:') || p.startsWith('http')));
}

function getProfilePhotos(profile: any): string[] {
  const uris = typeof profile.photo_uris === 'string' ? JSON.parse(profile.photo_uris) : (profile.photo_uris || []);
  return uris.filter((p: string) => p && (p.startsWith('data:') || p.startsWith('http')));
}

function getProfileBiometricPhotos(profile: any): string[] {
  const uris = typeof profile.biometric_photo_uris === 'string' ? JSON.parse(profile.biometric_photo_uris) : (profile.biometric_photo_uris || []);
  return uris.filter((p: string) => p && (p.startsWith('data:') || p.startsWith('http')));
}

async function getOrgAnimalCandidates(petType: string, excludeOrgId?: string) {
  const sql = `
    SELECT oa.*, o.name as org_name, o.type as org_type, o.latitude as org_latitude, o.longitude as org_longitude
    FROM organisation_animals oa
    JOIN organisations o ON o.id = oa.org_id
    WHERE oa.pet_type = $1 AND oa.status = 'available'
    ${excludeOrgId ? 'AND oa.org_id != $2' : ''}
    ORDER BY oa.created_at DESC
    LIMIT 50
  `;
  const params = excludeOrgId ? [petType, excludeOrgId] : [petType];
  const res = await db.query(sql, params);
  return res.rows;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { report, reports, profiles, radiusKm } = body;
    const searchRadius = radiusKm && radiusKm > 0 ? radiusKm : RADIUS_KM;

    if (!report) {
      return NextResponse.json({ error: "Report is required" }, { status: 400 });
    }

    const oppositeStatus = report.status === 'lost' ? 'found' : 'lost';

    // Fetch reports from DB
    const reportsQuery = await db.query(
      `SELECT * FROM pet_reports WHERE status = $1 AND pet_type = $2 AND id != $3`,
      [oppositeStatus, report.petType, report.id]
    );
    const dbReports = reportsQuery.rows;

    const matchingReports = dbReports.filter((r: any) => {
      if (r.latitude && r.longitude && report.latitude && report.longitude) {
        const dist = getDistance(report.latitude, report.longitude, r.latitude, r.longitude);
        if (dist > searchRadius) return false;
      }
      return true;
    });

    const profilesQuery = await db.query(
      `SELECT * FROM pet_profiles WHERE pet_type = $1`,
      [report.petType]
    );
    const matchingProfiles = profilesQuery.rows;

    const candidates: any[] = [];

    for (const r of matchingReports) {
      const dist = getDistance(report.latitude, report.longitude, r.latitude, r.longitude);
      candidates.push({
        type: 'report',
        id: r.id,
        summary: `[Report] ${r.status.toUpperCase()} ${r.petType} named "${r.pet_name}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.location_name}, distance: ${dist.toFixed(1)}km, date: ${r.lastSeenDate}, description: "${r.description}"`,
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
        summary: `[Registered Pet] ${p.petType} named "${p.pet_name}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, microchip: ${p.microchipNumber || 'none'}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s)` : ''}`,
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

    candidates.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    
    // AI analysis is commented out in legacy, returning gathered candidates as potential matches.
    return NextResponse.json({ 
      matches: candidates.slice(0, MAX_VISION_CANDIDATES).map(c => ({
        id: c.id,
        type: c.type,
        confidence: 50, // Default confidence without AI
        reason: "Based on proximity and textual matching",
        details: c.summary
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
