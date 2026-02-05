import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch template info by slug (public, no sensitive data)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const template = await prisma.photoTemplate.findUnique({
      where: { slug },
      select: {
        id: true,
        heading: true,
        slug: true,
        imageUrl: true,
        useImage: true,
        // NOT including prompt or pseudoPrompt
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}
