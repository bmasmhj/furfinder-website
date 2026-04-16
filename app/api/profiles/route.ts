
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

import { mapProfileRow } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const result = await db.query(
      'SELECT * FROM pet_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json(result.rows.map(mapProfileRow));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const { 
      petType, pet_name, breed, size, color, markings, 
      photo_uris, biometricphoto_uris, microchipNumber, 
      medicalNotes, suburb, ownerName, ownerPhone 
    } = body;

    const result = await db.query(
      `INSERT INTO pet_profiles (
        user_id, pet_type, pet_name, breed, size, color, markings, 
        photo_uris, biometric_photo_uris, microchip_number, medical_notes, 
        suburb, owner_name, owner_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        user.id, petType, pet_name, breed || '', size || 'medium', color || '', markings || '',
        JSON.stringify(photo_uris || []), JSON.stringify(biometricphoto_uris || []),
        microchipNumber || '', medicalNotes || '', suburb || '', ownerName || '', ownerPhone || ''
      ]
    );

    return NextResponse.json(mapProfileRow(result.rows[0]), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
