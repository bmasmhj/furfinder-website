
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

import { mapReportRow } from '@/lib/api-helpers';
import { processNewReportMatches } from '@/lib/match-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    
    const isPaginated = searchParams.get('page') !== null;
    const limit = Math.min(parseInt(searchParams.get('limit') || (isPaginated ? '20' : '100')), 500);
    const page = parseInt(searchParams.get('page') || '0');
    const offset = isPaginated ? page * limit : (parseInt(searchParams.get('offset') || '0'));
    const statusFilter = searchParams.get('status');
    const suburbFilter = searchParams.get('suburb');
    const mineFilter = searchParams.get('mine') === 'true';
    const lat = parseFloat(searchParams.get('lat') || 'NaN');
    const lng = parseFloat(searchParams.get('lng') || 'NaN');
    const radiusKm = parseFloat(searchParams.get('radius') || 'NaN');
    const hasGeo = !isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm) && radiusKm > 0;

    const innerConditions: string[] = [];
    const params: any[] = [];

    if (statusFilter && statusFilter !== 'all' && ['lost', 'found', 'reunited'].includes(statusFilter)) {
      params.push(statusFilter);
      innerConditions.push(`r.status = $${params.length}`);
    } else {
      innerConditions.push(`r.status != 'reunited'`);
    }

    if (suburbFilter) {
      params.push(`%${suburbFilter.toLowerCase()}%`);
      innerConditions.push(`LOWER(r.location_name) LIKE $${params.length}`);
    }
    
    if (mineFilter && user) {
      params.push(user.id);
      innerConditions.push(`r.user_id = $${params.length}`);
    }

    if (hasGeo) {
      const delta = radiusKm / 111.0;
      params.push(lat - delta); params.push(lat + delta);
      innerConditions.push(`r.latitude BETWEEN $${params.length - 1} AND $${params.length}`);
      params.push(lng - delta); params.push(lng + delta);
      innerConditions.push(`r.longitude BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    const whereClause = innerConditions.length > 0 ? `WHERE ${innerConditions.join(' AND ')}` : '';

    const distanceExpr = hasGeo
      ? `(6371 * acos(GREATEST(-1.0, LEAST(1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))))`
      : 'NULL::float';

    const outerWhere = hasGeo ? `WHERE distance < ${radiusKm}` : '';

    const orderClause = hasGeo
      ? `ORDER BY distance ASC`
      : `ORDER BY CASE WHEN is_boosted = true AND boost_expires_at > NOW() THEN 0 ELSE 1 END, created_at DESC`;

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    params.push(limit);
    params.push(offset);

    const mainQuery = `
      SELECT * FROM (
        SELECT r.*,
          COALESCE((SELECT COUNT(*) FROM report_likes WHERE report_id = r.id), 0)::int AS likes,
          ${distanceExpr} AS distance
        FROM pet_reports r
        ${whereClause}
      ) sub
      ${outerWhere}
      ${orderClause}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const result = await db.query(mainQuery, params);

    const reports = result.rows.map((row: any) => {
      const isOwner = user ? row.user_id === user.id : false;
      const mapped = mapReportRow(row, isOwner, false);
      if (hasGeo && row.distance !== null) {
        (mapped as any).distanceKm = parseFloat(parseFloat(row.distance).toFixed(1));
      }
      return mapped;
    });

    if (user) {
      const likedResult = await db.query(
        'SELECT report_id FROM report_likes WHERE user_id = $1',
        [user.id]
      );
      const likedIds = new Set(likedResult.rows.map((r: any) => r.report_id));
      reports.forEach((r: any) => { r.likedByMe = likedIds.has(r.id); });
    }

    if (isPaginated) {
      const countParams = params.slice(0, params.length - 2);
      const countQuery = `
        SELECT (SELECT COUNT(*) FROM (
          SELECT r.id, ${distanceExpr} AS distance
          FROM pet_reports r
          ${whereClause}
        ) s ${outerWhere}) as count
      `;
      
      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      return NextResponse.json({ reports, total, page, hasMore: (page + 1) * limit < total });
    }

    return NextResponse.json(reports);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      petType, pet_name, breed, size, color, markings, photo_uri, photo_uris,
      description, latitude, longitude, location_name, lastSeenDate,
      reward, contactName, contactPhone, showContactPublic, status 
    } = body;

    // Original uses status = status || 'lost'
    const reportStatus = status || 'lost';

    const result = await db.query(
      `INSERT INTO pet_reports (
        user_id, status, pet_type, pet_name, breed, size, color, markings, 
        photo_uri, photo_uris, description, latitude, longitude, location_name, 
        last_seen_date, reward, contact_name, contact_phone, show_contact_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        user.id, reportStatus, petType, pet_name, breed || '', size || 'medium', 
        color || '', markings || '', photo_uri || '', JSON.stringify(photo_uris || []),
        description || '', latitude || 0, longitude || 0, location_name || '',
        lastSeenDate || '', reward || '', contactName || '', contactPhone || '',
        showContactPublic ?? true
      ]
    );

    const report = mapReportRow(result.rows[0], true, false);

    // Trigger automatic matching
    try {
      await processNewReportMatches(report.id);
    } catch (matchError) {
      console.error('Match processing failed:', matchError);
      // Don't fail the report creation if matching fails
    }
    
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
