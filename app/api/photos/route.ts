import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - List all photo templates (public)
export async function GET() {
  try {
    const photos = await prisma.photoTemplate.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to flatten tags
    const transformedPhotos = photos.map((photo) => ({
      ...photo,
      tags: photo.tags.map((t) => t.tag),
    }));

    return NextResponse.json(transformedPhotos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
