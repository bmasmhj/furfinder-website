
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

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const org = await db.query('SELECT id FROM organisations WHERE user_id = $1', [user.id]);
    if (org.rows.length === 0) {
      return NextResponse.json({ message: "No organisation found" }, { status: 404 });
    }
    const result = await db.query(
      'SELECT * FROM organisation_animals WHERE id = $1 AND org_id = $2',
      [id, org.rows[0].id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Animal not found" }, { status: 404 });
    }
    return NextResponse.json(mapAnimalRow(result.rows[0]));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const org = await db.query('SELECT id FROM organisations WHERE user_id = $1', [user.id]);
    if (org.rows.length === 0) {
      return NextResponse.json({ message: "No organisation found" }, { status: 404 });
    }
    const orgId = org.rows[0].id;
    const body = await request.json();
    const { petType, pet_name, breed, size, color, markings, photo_uris, description, intakeDate, intakeType, microchipNumber, desexed, status } = body;
    
    if (petType && !['dog', 'cat', 'bird', 'rabbit', 'other'].includes(petType)) {
      return NextResponse.json({ message: "Invalid pet type" }, { status: 400 });
    }
    if (size && !['small', 'medium', 'large'].includes(size)) {
      return NextResponse.json({ message: "Invalid size" }, { status: 400 });
    }
    if (intakeType && !['stray', 'surrendered', 'rescue', 'transferred'].includes(intakeType)) {
      return NextResponse.json({ message: "Invalid intake type" }, { status: 400 });
    }
    if (status && !['available', 'adopted', 'on_hold', 'fostered'].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE organisation_animals 
       SET pet_type = COALESCE($1, pet_type),
           pet_name = COALESCE($2, pet_name),
           breed = COALESCE($3, breed),
           size = COALESCE($4, size),
           color = COALESCE($5, color),
           markings = COALESCE($6, markings),
           photo_uris = COALESCE($7, photo_uris),
           description = COALESCE($8, description),
           intake_date = COALESCE($9, intake_date),
           intake_type = COALESCE($10, intake_type),
           microchip_number = COALESCE($11, microchip_number),
           desexed = COALESCE($12, desexed),
           status = COALESCE($13, status),
           updated_at = NOW()
       WHERE id = $14 AND org_id = $15
       RETURNING *`,
      [petType, pet_name, breed, size, color, markings, photo_uris ? JSON.stringify(photo_uris) : null, description, intakeDate, intakeType, microchipNumber, desexed, status, id, orgId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Animal not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(mapAnimalRow(result.rows[0]));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const org = await db.query('SELECT id FROM organisations WHERE user_id = $1', [user.id]);
    if (org.rows.length === 0) {
      return NextResponse.json({ message: "No organisation found" }, { status: 404 });
    }
    const result = await db.query('DELETE FROM organisation_animals WHERE id = $1 AND org_id = $2 RETURNING id', [id, org.rows[0].id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Animal not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json({ message: "Animal deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
