import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, generateSlug } from '@/lib/admin';
import { uploadToR2 } from '@/lib/r2-upload';

// GET - List all photo templates (protected)
export async function GET() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

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

// POST - Create new photo template (protected)
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const heading = formData.get('heading') as string;
    const prompt = formData.get('prompt') as string;
    const modelName = formData.get('modelName') as string;
    const tagsJson = formData.get('tags') as string;

    // Validation
    if (!image || !heading || !prompt || !modelName) {
      return NextResponse.json(
        { error: 'Image, heading, prompt, and model name are required' },
        { status: 400 }
      );
    }

    // Generate slug from heading
    const slug = generateSlug(heading);

    // Check if slug already exists
    const existingPhoto = await prisma.photoTemplate.findUnique({
      where: { slug },
    });

    if (existingPhoto) {
      return NextResponse.json(
        { error: 'A photo with this heading already exists' },
        { status: 400 }
      );
    }

    // Upload image to R2
    const imageUrl = await uploadToR2(image, 'photos');

    // Parse tags
    const tagIds: string[] = tagsJson ? JSON.parse(tagsJson) : [];

    // Create photo template with tags
    const photo = await prisma.photoTemplate.create({
      data: {
        heading,
        slug,
        imageUrl,
        prompt,
        modelName,
        tags: {
          create: tagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...photo,
        tags: photo.tags.map((t) => t.tag),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 });
  }
}
