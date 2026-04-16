
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

function mapAnimalRow(a: any) {
  return {
    id: a.id, 
    orgId: a.org_id, 
    petType: a.pet_type, 
    pet_name: a.pet_name, 
    breed: a.breed,
    size: a.size, 
    color: a.color, 
    markings: a.markings, 
    photo_uris: typeof a.photo_uris === 'string' ? JSON.parse(a.photo_uris) : (a.photo_uris || []),
    description: a.description, 
    intakeDate: a.intake_date, 
    intakeType: a.intake_type,
    microchipNumber: a.microchip_number, 
    desexed: a.desexed, 
    status: a.status,
    createdAt: a.created_at, 
    updatedAt: a.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const org = await db.query('SELECT id FROM organisations WHERE user_id = $1', [user.id]);
    if (org.rows.length === 0) {
      return NextResponse.json([]);
    }
    const result = await db.query(
      'SELECT * FROM organisation_animals WHERE org_id = $1 ORDER BY created_at DESC',
      [org.rows[0].id]
    );
    return NextResponse.json(result.rows.map(mapAnimalRow));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const org = await db.query('SELECT id, status FROM organisations WHERE user_id = $1', [user.id]);
    if (org.rows.length === 0) {
      return NextResponse.json({ message: "No organisation found" }, { status: 404 });
    }
    if (org.rows[0].status !== 'approved') {
      return NextResponse.json({ message: "Organisation must be approved to add animals" }, { status: 403 });
    }
    const orgId = org.rows[0].id;
    const body = await request.json();
    const { petType, pet_name, breed, size, color, markings, photo_uris, description, intakeDate, intakeType, microchipNumber, desexed } = body;
    
    if (!petType) {
      return NextResponse.json({ message: "Pet type is required" }, { status: 400 });
    }
    if (!['dog', 'cat', 'bird', 'rabbit', 'other'].includes(petType)) {
      return NextResponse.json({ message: "Invalid pet type" }, { status: 400 });
    }
    if (size && !['small', 'medium', 'large'].includes(size)) {
      return NextResponse.json({ message: "Invalid size" }, { status: 400 });
    }
    if (intakeType && !['stray', 'surrendered', 'rescue', 'transferred'].includes(intakeType)) {
      return NextResponse.json({ message: "Invalid intake type" }, { status: 400 });
    }
    const result = await db.query(
      `INSERT INTO organisation_animals (org_id, pet_type, pet_name, breed, size, color, markings, photo_uris, description, intake_date, intake_type, microchip_number, desexed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [orgId, petType, pet_name || '', breed || '', size || 'medium', color || '', markings || '', JSON.stringify(photo_uris || []), description || '', intakeDate || null, intakeType || 'stray', microchipNumber || null, desexed || false]
    );
    return NextResponse.json(mapAnimalRow(result.rows[0]), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
