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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    let query = 'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC';
    const params: any[] = [conversationId];

    const result = await db.query(query, params);

    return NextResponse.json({ messages: result.rows }, { status: 200 });
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
    const { conversation_id, content } = body;

    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [conversation_id, decoded.id, content]
    );

    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
