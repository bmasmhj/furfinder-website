import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ApiError, handleApiError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Unauthorized', 401);
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    const result = await db.query(
      `SELECT m.*, 
              r1.pet_name as report1_pet_name, r1.pet_type as report1_pet_type,
              r2.pet_name as report2_pet_name, r2.pet_type as report2_pet_type
       FROM matches m
       JOIN reports r1 ON m.report1_id = r1.id
       JOIN reports r2 ON m.report2_id = r2.id
       WHERE r1.user_id = $1 OR r2.user_id = $1
       ORDER BY m.created_at DESC`,
      [decoded.id]
    );

    return NextResponse.json({ matches: result.rows }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Unauthorized', 401);
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    const body = await request.json();
    const { report1_id, report2_id, confidence_score } = body;

    const result = await db.query(
      `INSERT INTO matches (report1_id, report2_id, confidence_score, status, created_at)
       VALUES ($1, $2, $3, 'active', NOW())
       RETURNING *`,
      [report1_id, report2_id, confidence_score]
    );

    return NextResponse.json({ match: result.rows[0] }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
