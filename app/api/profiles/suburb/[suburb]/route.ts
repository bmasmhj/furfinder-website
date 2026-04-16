
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-errors';

type Context = { params: Promise<{ suburb: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { suburb } = await params;
    const decodedSuburb = decodeURIComponent(suburb);
    
    const result = await db.query(
      `SELECT pp.id, pp.pet_type, pp.pet_name, pp.breed, pp.size, pp.color, pp.markings,
              pp.photo_uris, pp.suburb, pp.microchip_number, pp.created_at,
              u.display_name as owner_display_name 
       FROM pet_profiles pp
       JOIN users u ON u.id = pp.user_id
       WHERE pp.suburb = $1
       ORDER BY pp.created_at DESC`,
      [decodedSuburb]
    );

    return NextResponse.json(result.rows.map((r: any) => ({
      id: r.id,
      petType: r.pet_type,
      pet_name: r.pet_name,
      breed: r.breed,
      size: r.size,
      color: r.color,
      markings: r.markings,
      photo_uris: typeof r.photo_uris === 'string' ? JSON.parse(r.photo_uris) : (r.photo_uris || []),
      suburb: r.suburb,
      microchipNumber: r.microchip_number,
      createdAt: r.created_at,
      ownerdisplay_name: r.owner_display_name,
    })));
  } catch (error) {
    return handleApiError(error);
  }
}
