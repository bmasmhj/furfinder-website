
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
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
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const result = await db.query('SELECT * FROM pet_profiles WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (result.rows.length === 0) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    return NextResponse.json(mapProfileRow(result.rows[0]));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const updatable: Record<string, string> = {
      petType: 'pet_type', pet_name: 'pet_name', breed: 'breed', size: 'size',
      color: 'color', markings: 'markings', microchipNumber: 'microchip_number',
      medicalNotes: 'medical_notes', suburb: 'suburb', ownerName: 'owner_name',
      ownerPhone: 'owner_phone'
    };

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, col] of Object.entries(updatable)) {
      if (body[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        values.push(body[key]);
        idx++;
      }
    }

    if (body.photo_uris !== undefined) {
      fields.push(`photo_uris = $${idx}`);
      values.push(JSON.stringify(body.photo_uris));
      idx++;
    }
    if (body.biometricphoto_uris !== undefined) {
      fields.push(`biometric_photo_uris = $${idx}`);
      values.push(JSON.stringify(body.biometricphoto_uris));
      idx++;
    }

    if (fields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

    values.push(id);
    values.push(user.id);
    const result = await db.query(
      `UPDATE pet_profiles SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx+1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return NextResponse.json({ message: "Profile not found or unauthorized" }, { status: 404 });

    return NextResponse.json(mapProfileRow(result.rows[0]));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const result = await db.query('DELETE FROM pet_profiles WHERE id = $1 AND user_id = $2 RETURNING id', [id, user.id]);
    if (result.rows.length === 0) return NextResponse.json({ message: "Profile not found or unauthorized" }, { status: 404 });

    return NextResponse.json({ message: "Profile deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
