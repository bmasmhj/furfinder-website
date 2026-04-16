
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-errors';

function mapProfileRow(row: any): any {
  return {
    id: row.id,
    petType: row.pet_type,
    pet_name: row.pet_name,
    breed: row.breed,
    size: row.size,
    color: row.color,
    markings: row.markings,
    photo_uris: typeof row.photo_uris === 'string' ? JSON.parse(row.photo_uris) : (row.photo_uris || []),
    biometricphoto_uris: typeof row.biometric_photo_uris === 'string' ? JSON.parse(row.biometric_photo_uris) : (row.biometric_photo_uris || []),
    microchipNumber: row.microchip_number,
    medicalNotes: row.medical_notes,
    suburb: row.suburb,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const result = await db.query('SELECT * FROM pet_profiles ORDER BY created_at DESC');
    return NextResponse.json(result.rows.map(mapProfileRow));
  } catch (error) {
    return handleApiError(error);
  }
}
