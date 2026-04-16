
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-errors';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const orgResult = await db.query(
      "SELECT id, name, type, status FROM organisations WHERE id = $1 AND status = 'approved'", 
      [id]
    );
    
    if (orgResult.rows.length === 0) {
      return NextResponse.json({ message: "Organisation not found" }, { status: 404 });
    }
    
    const result = await db.query(
      "SELECT * FROM organisation_animals WHERE org_id = $1 AND status = 'available' ORDER BY created_at DESC",
      [id]
    );
    
    return NextResponse.json(result.rows.map((a: any) => ({
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
      orgName: orgResult.rows[0].name, 
      orgType: orgResult.rows[0].type,
    })));
  } catch (error) {
    return handleApiError(error);
  }
}
