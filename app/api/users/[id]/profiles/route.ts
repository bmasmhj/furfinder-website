import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';
import { mapProfileRow } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT * FROM pet_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [targetUserId]
    );

    return NextResponse.json(result.rows.map(mapProfileRow));
  } catch (error) {
    return handleApiError(error);
  }
}
