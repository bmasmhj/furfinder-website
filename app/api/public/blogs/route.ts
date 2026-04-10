import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = 'SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE is_published = true';
    const params: any[] = [];
    let countQuery = 'SELECT COUNT(*) as total FROM blogs WHERE is_published = true';


    if (category) {
      query += ' AND category = $1';
      countQuery += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [blogs, countResult] = await Promise.all([
      db.queryMany(query, params),
      db.queryOne(countQuery, params.slice(0, -2))
    ]);

    const total = (countResult as any)?.total || 0;

    return NextResponse.json({
      data: blogs,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
