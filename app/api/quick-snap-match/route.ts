
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

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

async function getOrgAnimalCandidates(petType: string) {
  const sql = `
    SELECT oa.*, o.name as org_name, o.type as org_type, o.latitude as org_latitude, o.longitude as org_longitude
    FROM organisation_animals oa
    JOIN organisations o ON o.id = oa.org_id
    WHERE oa.pet_type = $1 AND oa.status = 'available'
    ORDER BY oa.created_at DESC
    LIMIT 50
  `;
  const res = await db.query(sql, [petType]);
  return res.rows;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { photo_uri, petType, reports, profiles } = body;

    if (!photo_uri) {
      return NextResponse.json({ error: "A photo is required" }, { status: 400 });
    }

    const validPhoto = photo_uri.startsWith('data:') || photo_uri.startsWith('http');
    if (!validPhoto) {
      return NextResponse.json({ error: "Invalid photo format" }, { status: 400 });
    }

    const lostReportsParams: any[] = ['lost'];
    let lostReportsQuery = `SELECT * FROM pet_reports WHERE status = $1`;
    if (petType) {
      lostReportsParams.push(petType);
      lostReportsQuery += ` AND pet_type = $2`;
    }
    const reportsRes = await db.query(lostReportsQuery, lostReportsParams);
    const lostReports = reportsRes.rows;

    const allProfilesParams: any[] = [];
    let allProfilesQuery = `SELECT * FROM pet_profiles`;
    if (petType) {
      allProfilesParams.push(petType);
      allProfilesQuery += ` WHERE pet_type = $1`;
    }
    const profilesRes = await db.query(allProfilesQuery, allProfilesParams);
    const allProfiles = profilesRes.rows;

    const candidates: any[] = [];

    for (const r of lostReports) {
      candidates.push({
        type: 'report',
        id: r.id,
        summary: `[Lost Report] ${r.pet_type} named "${r.pet_name}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.location_name}, date: ${r.last_seen_date}`,
        photos: getReportPhotos({ 
          photo_uris: r.photo_uris ? (typeof r.photo_uris === 'string' ? JSON.parse(r.photo_uris) : r.photo_uris) : [], 
          photo_uri: r.photo_uri 
        }),
        name: r.pet_name,
        breed: r.breed,
        petType: r.pet_type,
        status: r.status
      });
    }

    for (const p of allProfiles) {
      const profilePhotos = getProfilePhotos(p);
      const biometricPhotos = getProfileBiometricPhotos(p);
      candidates.push({
        type: 'profile',
        id: p.id,
        summary: `[Registered Pet] ${p.pet_type} named "${p.pet_name}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, owner: ${p.owner_name}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s)` : ''}`,
        photos: [...profilePhotos, ...biometricPhotos],
        name: p.pet_name,
        breed: p.breed,
        petType: p.pet_type,
        status: 'registered'
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
        name: oa.pet_name,
        breed: oa.breed,
        petType: oa.pet_type,
        status: 'org_animal'
      });
    }

    return NextResponse.json({ 
      matches: candidates.slice(0, MAX_VISION_CANDIDATES).map(c => ({
        id: c.id,
        type: c.type,
        confidence: 50,
        reason: "Visual candidate based on pet type and report category",
        details: c.summary,
        name: c.name,
        breed: c.breed,
        photo_uri: c.photos[0] || '',
        petType: c.petType,
        status: c.status
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
