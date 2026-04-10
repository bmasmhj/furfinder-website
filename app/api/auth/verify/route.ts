import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApiError, handleApiError } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Missing or invalid authorization header', 401);
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    // Get user from database
    const result = await db.query(
      'SELECT id, email, display_name FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('User not found', 404);
    }

    const user = result.rows[0];

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
        },
        valid: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
