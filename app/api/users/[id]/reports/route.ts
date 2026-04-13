import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';
import { mapReportRow } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = parseInt(searchParams.get('page') || '0');
    const offset = page * limit;

    const query = `
      SELECT r.*,
        COALESCE((SELECT COUNT(*) FROM report_likes WHERE report_id = r.id), 0)::int AS likes
      FROM pet_reports r
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [targetUserId, limit, offset]);
    const isOwner = user ? targetUserId === user.id : false;
    const reports = result.rows.map((row: any) => mapReportRow(row, isOwner, false));

    if (user) {
      const likedResult = await db.query(
        'SELECT report_id FROM report_likes WHERE user_id = $1',
        [user.id]
      );
      const likedIds = new Set(likedResult.rows.map((r: any) => r.report_id));
      reports.forEach((r: any) => { r.likedByMe = likedIds.has(r.id); });
    }

    const countResult = await db.query(
      `SELECT COUNT(*)::int as count FROM pet_reports WHERE user_id = $1`,
      [targetUserId]
    );
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      reports,
      total,
      page,
      hasMore: (page + 1) * limit < total
    });
  } catch (error) {
    return handleApiError(error);
  }
}
