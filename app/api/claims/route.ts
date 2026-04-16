
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const type = searchParams.get('type') || 'received'; // received or sent

    let query = '';
    let params: any[] = [];

    const isAll = status === 'all';
    
    if (type === 'sent') {
      query = `
        SELECT c.*, 
               f.pet_name as found_pet_name, 
               f.photo_uri as found_pet_photo, 
               f.location_name as found_location,
               u.display_name as owner_name
        FROM claim_requests c
        JOIN pet_reports f ON f.id = c.found_report_id
        JOIN users u ON u.id = c.found_user_id
        WHERE c.claimer_user_id = $1 ${isAll ? '' : 'AND c.status = $2'}
        ORDER BY c.created_at DESC
      `;
      params = isAll ? [user.id] : [user.id, status];
    } else {
      query = `
        SELECT c.*, 
               l.pet_name as lost_pet_name, 
               l.photo_uri as lost_pet_photo, 
               l.location_name as lost_location,
               u.display_name as claimer_name,
               u.email as claimer_email
        FROM claim_requests c
        JOIN pet_reports l ON l.id = c.lost_report_id
        JOIN users u ON u.id = c.claimer_user_id
        WHERE c.found_user_id = $1 ${isAll ? '' : 'AND c.status = $2'}
        ORDER BY c.created_at DESC
      `;
      params = isAll ? [user.id] : [user.id, status];
    }

    const claims = await db.queryMany(query, params);

    return NextResponse.json(claims);
  } catch (error) {
    return handleApiError(error);
  }
}
