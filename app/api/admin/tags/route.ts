import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, generateSlug } from '@/lib/admin';

// GET - Search tags (protected)
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  try {
    const tags = await prisma.tag.findMany({
      where: query
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
      take: 20,
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST - Create new tag (protected)
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const slug = generateSlug(name);

    // Check if tag already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
      },
    });

    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
