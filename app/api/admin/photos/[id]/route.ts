import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, generateSlug } from '@/lib/admin';
import { uploadToR2, deleteFromR2 } from '@/lib/r2-upload';

// GET - Get single photo template (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

  const { id } = await params;

  try {
    const photo = await prisma.photoTemplate.findUnique({
      where: { id },
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

    return NextResponse.json({
      ...photo,
      tags: photo.tags.map((t) => t.tag),
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}

// PUT - Update photo template (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

  const { id } = await params;

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const heading = formData.get('heading') as string;
    const prompt = formData.get('prompt') as string;
    const pseudoPrompt = formData.get('pseudoPrompt') as string | null;
    const modelName = formData.get('modelName') as string;
    const tagsJson = formData.get('tags') as string;
    const useImageRaw = formData.get('useImage');
    const useImage = useImageRaw !== null ? useImageRaw === 'true' : undefined;

    // Check if photo exists
    const existingPhoto = await prisma.photoTemplate.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Generate new slug if heading changed
    const slug = heading ? generateSlug(heading) : existingPhoto.slug;

    // Check if new slug conflicts with another photo
    if (slug !== existingPhoto.slug) {
      const slugConflict = await prisma.photoTemplate.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A photo with this heading already exists' },
          { status: 400 }
        );
      }
    }

    // Upload new image if provided
    let imageUrl = existingPhoto.imageUrl;
    if (image && image.size > 0) {
      // Delete old image
      try {
        await deleteFromR2(existingPhoto.imageUrl);
      } catch {
        // Continue even if delete fails
      }
      imageUrl = await uploadToR2(image, 'photos');
    }

    // Parse tags
    const tagIds: string[] = tagsJson ? JSON.parse(tagsJson) : [];

    // Update photo template
    const photo = await prisma.photoTemplate.update({
      where: { id },
      data: {
        heading: heading || existingPhoto.heading,
        slug,
        imageUrl,
        prompt: prompt || existingPhoto.prompt,
        pseudoPrompt: pseudoPrompt !== undefined ? (pseudoPrompt || null) : existingPhoto.pseudoPrompt,
        modelName: modelName || existingPhoto.modelName,
        useImage: useImage !== undefined ? useImage : existingPhoto.useImage,
        tags: {
          deleteMany: {},
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

    return NextResponse.json({
      ...photo,
      tags: photo.tags.map((t) => t.tag),
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

// DELETE - Delete photo template (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAuthorized) {
    return adminCheck.response;
  }

  const { id } = await params;

  try {
    const photo = await prisma.photoTemplate.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete image from R2
    try {
      await deleteFromR2(photo.imageUrl);
    } catch {
      // Continue even if delete fails
    }

    // Delete photo template (cascade will delete tag relations)
    await prisma.photoTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
