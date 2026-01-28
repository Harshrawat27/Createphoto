import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get public photo by slug (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const photo = await prisma.photoTemplate.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Get related photos (photos with at least one matching tag)
    const tagIds = photo.tags.map((t) => t.tag.id);

    let relatedPhotos: typeof photo[] = [];
    if (tagIds.length > 0) {
      relatedPhotos = await prisma.photoTemplate.findMany({
        where: {
          id: { not: photo.id },
          tags: {
            some: {
              tagId: { in: tagIds },
            },
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({
      photo: {
        ...photo,
        tags: photo.tags.map((t) => t.tag),
      },
      relatedPhotos: relatedPhotos.map((p) => ({
        ...p,
        tags: p.tags.map((t) => t.tag),
      })),
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
