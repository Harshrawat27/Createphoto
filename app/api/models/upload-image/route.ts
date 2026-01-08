import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2-upload';
import { getAuthenticatedUser } from '@/lib/get-user';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const modelId = formData.get('modelId') as string;
    const imageFile = formData.get('image') as File;

    if (!modelId || !imageFile) {
      return NextResponse.json(
        { error: 'Missing modelId or image' },
        { status: 400 }
      );
    }

    // Verify the model exists and belongs to the user
    const model = await prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    if (model.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Upload image to R2
    const imageUrl = await uploadToR2(imageFile, 'models');

    // Update model with the new image URL
    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        trainingImages: {
          push: imageUrl,
        },
        // Set thumbnail to first image if not already set
        ...(model.thumbnailUrl ? {} : { thumbnailUrl: imageUrl }),
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      totalImages: updatedModel.trainingImages.length,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
