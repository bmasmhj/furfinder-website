
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT
         q.id, q.confidence, q.reason, q.status, q.created_at, q.reviewed_at,
         l.id AS lost_id, l.pet_name AS lost_pet_name, l.pet_type AS lost_pet_type,
         l.breed AS lost_breed, l.color AS lost_color, l.location_name AS lost_location,
         l.last_seen_date AS lost_date, l.photo_uri AS lost_photo_uri, l.photo_uris AS lost_photo_uris,
         lu.id AS lost_user_id, lu.id AS "lostUserId", lu.display_name AS lost_username, lu.email AS lost_email, lu.push_token AS lost_push_token,
         f.id AS found_id, f.pet_name AS found_pet_name, f.pet_type AS found_pet_type,
         f.breed AS found_breed, f.color AS found_color, f.location_name AS found_location,
         f.last_seen_date AS found_date, f.photo_uri AS found_photo_uri, f.photo_uris AS found_photo_uris,
         fu.display_name AS found_username, fu.email AS found_email
       FROM admin_match_queue q
       JOIN pet_reports l ON l.id = q.lost_report_id
       JOIN pet_reports f ON f.id = q.found_report_id
       JOIN users lu ON lu.id = l.user_id
       JOIN users fu ON fu.id = f.user_id
       WHERE q.status = $1
       ORDER BY q.confidence DESC, q.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const rows = result.rows.map((r: any) => {
      const lostUris = typeof r.lost_photo_uris === 'string' ? JSON.parse(r.lost_photo_uris || '[]') : (r.lost_photo_uris || []);
      const foundUris = typeof r.found_photo_uris === 'string' ? JSON.parse(r.found_photo_uris || '[]') : (r.found_photo_uris || []);
      const lostThumb = lostUris.find((u: string) => u.startsWith('data:') || u.startsWith('http')) || r.lost_photo_uri || null;
      const foundThumb = foundUris.find((u: string) => u.startsWith('data:') || u.startsWith('http')) || r.found_photo_uri || null;
      
      return {
        id: r.id,
        confidence: r.confidence,
        reason: r.reason,
        status: r.status,
        createdAt: r.created_at,
        reviewedAt: r.reviewed_at,
        lostReport: {
          id: r.lost_id,
          pet_name: r.lost_pet_name,
          petType: r.lost_pet_type,
          breed: r.lost_breed,
          color: r.lost_color,
          location: r.lost_location,
          date: r.lost_date,
          thumbnail: lostThumb,
          ownerName: r.lost_username,
          ownerEmail: r.lost_email,
          ownerPushToken: r.lost_push_token,
          ownerId: r.lost_user_id,
        },
        foundReport: {
          id: r.found_id,
          pet_name: r.found_pet_name,
          petType: r.found_pet_type,
          breed: r.found_breed,
          color: r.found_color,
          location: r.found_location,
          date: r.found_date,
          thumbnail: foundThumb,
          reporterName: r.found_username,
          reporterEmail: r.found_email,
        },
      };
    });

    const countResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM admin_match_queue WHERE status = $1`,
      [status]
    );

    return NextResponse.json({
      items: rows,
      total: countResult.rows[0].count,
      page,
      limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
