import { db } from './db';
import { sendPushNotification } from './push';

export interface MatchCandidate {
  id: string;
  userId: string;
  pet_name: string;
  petType: string;
  breed: string;
  color: string;
  photo_uri: string;
  distance: number;
  score: number;
  status: string;
  location_name: string;
  reason: string;
  type: 'report' | 'org_animal';
  orgType?: string;
  orgName?: string;
}

export async function findMatchesForReport(reportId: string) {
  // 1. Get the current report
  const reportResult = await db.query(
    'SELECT * FROM pet_reports WHERE id = $1',
    [reportId]
  );
  
  if (reportResult.rows.length === 0) return [];
  const report = reportResult.rows[0];

  // 2. Find candidate matches using PostGIS
  // Match opposite status, within 5km, last 14 days
  const oppositeStatus = report.status === 'lost' ? 'found' : 'lost';
  
  const query = `
    SELECT * FROM (
      -- Search in pet_reports (public reports)
      SELECT 
        id, user_id, pet_name, pet_type, breed, color, photo_uri, status, location_name,
        'report' as match_type, NULL as org_type, NULL as org_name,
        (6371 * acos(GREATEST(-1.0, LEAST(1.0, cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($1)) + sin(radians($2)) * sin(radians(latitude)))))) AS distance_km
      FROM pet_reports
      WHERE 
        status = $3
        AND created_at >= NOW() - INTERVAL '14 days'
        AND id != $4
        AND latitude BETWEEN $2 - 0.05 AND $2 + 0.05
        AND longitude BETWEEN $1 - 0.05 AND $1 + 0.05

      UNION ALL

      -- Search in organisation_animals (shelters, vets, rescues)
      SELECT 
        oa.id, o.user_id, oa.pet_name, oa.pet_type, oa.breed, oa.color, oa.photo_uris->>0 as photo_uri, oa.status, o.address as location_name,
        'org_animal' as match_type, o.type as org_type, o.name as org_name,
        (6371 * acos(GREATEST(-1.0, LEAST(1.0, cos(radians($2)) * cos(radians(o.latitude)) * cos(radians(o.longitude) - radians($1)) + sin(radians($2)) * sin(radians(o.latitude)))))) AS distance_km
      FROM organisation_animals oa
      JOIN organisations o ON oa.org_id = o.id
      WHERE 
        oa.pet_type = (SELECT pet_type FROM pet_reports WHERE id = $4)
        AND oa.created_at >= NOW() - INTERVAL '14 days'
        AND o.latitude BETWEEN $2 - 0.05 AND $2 + 0.05
        AND o.longitude BETWEEN $1 - 0.05 AND $1 + 0.05
    ) sub
    ORDER BY distance_km ASC
    LIMIT 50
  `;

  const candidatesResult = await db.query(query, [
    report.longitude,
    report.latitude,
    oppositeStatus,
    reportId
  ]);

  const candidates = candidatesResult.rows;

  // 3. Calculate match scoring
  const matches: MatchCandidate[] = candidates.map(c => {
    let score = 0;
    const distanceVal = parseFloat(c.distance_km);
    let reason = '';

    // distance < 1km = 40
    if (distanceVal < 1) {
      score += 40;
      reason += 'Close distance, ';
    }
    // distance < 5km = 25 (if not already < 1km)
    else if (distanceVal < 5) {
      score += 25;
      reason += 'Medium distance, ';
    }

    // same pet_type = 20
    if (c.pet_type === report.pet_type) {
      score += 20;
      reason += 'Same pet type, ';
    }

    // same color = 15 (supports comma-separated color lists — score by intersection ratio)
    if (c.color && report.color) {
      const toTokens = (s: string) =>
        s.toLowerCase().split(',').map((t: string) => t.trim()).filter(Boolean);
      const cColors = toTokens(c.color);
      const rColors = toTokens(report.color);
      const matches = cColors.filter((col: string) => rColors.includes(col)).length;
      const maxLen = Math.max(cColors.length, rColors.length);
      if (maxLen > 0 && matches > 0) {
        const colorScore = Math.round(15 * (matches / maxLen));
        score += colorScore;
        reason += matches === maxLen ? 'Same color, ' : `Partial color match (${matches}/${maxLen}), `;
      }
    }

    // same breed = 10
    if (c.breed && report.breed && c.breed.toLowerCase() === report.breed.toLowerCase()) {
      score += 10;
      reason += 'Same breed, ';
    }

    // remove last , 
    reason = reason.slice(0, -2);

    return {
      id: c.id,
      userId: c.user_id,
      pet_name: c.pet_name,
      petType: c.pet_type,
      breed: c.breed,
      color: c.color,
      photo_uri: c.photo_uri,
      distance: parseFloat(distanceVal.toFixed(2)),
      score: score,
      status: c.status,
      location_name: c.location_name,
      reason : reason,
      type: c.match_type,
      orgType: c.org_type,
      orgName: c.org_name
    };
  });

  return matches.sort((a, b) => b.score - a.score);
}

export async function processNewReportMatches(reportId: string) {
  const matches = await findMatchesForReport(reportId);
  const bestMatch = matches[0];

  if (bestMatch && bestMatch.score >= 60) {
    // Notify report owner
    const reportResult = await db.query(
      'SELECT r.user_id, u.push_token FROM pet_reports r JOIN users u ON r.user_id = u.id WHERE r.id = $1',
      [reportId]
    );

    if (reportResult.rows.length > 0) {
      const { user_id, push_token } = reportResult.rows[0];
      await sendPushNotification(
        push_token,
        user_id,
        "Possible pet match found 🐾",
        "A similar pet was found near your area. Tap to review.",
        { reportId, matchId: bestMatch.id, type: 'match' }
      );
    }
  }
  
  return matches;
}
