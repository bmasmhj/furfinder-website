import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await db.queryOne(
      'SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs WHERE slug = $1 AND is_published = true',
      [slug]
    );


    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Get related blogs (same category, exclude current)
    const relatedBlogs = await db.queryMany(
      `SELECT *, featured_image_url AS image_url, author_name AS author FROM blogs 
       WHERE category = $1 AND id != $2 AND is_published = true
       ORDER BY created_at DESC
       LIMIT 3`,
      [blog.category, blog.id]
    );


    return NextResponse.json({
      data: blog,
      related: relatedBlogs
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}
