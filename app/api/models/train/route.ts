import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const modelName = formData.get('modelName') as string;
    const modelType = formData.get('modelType') as string;
    const files = formData.getAll('files') as File[];

    if (!modelName || !modelType || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (files.length < 3) {
      return NextResponse.json(
        { error: 'Please upload at least 3 images' },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    // Upload all images to Cloudflare R2
    const uploadPromises = files.map(async (file) => {
      const url = await uploadToR2(file, 'models');
      return url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Create model in database
    const model = await prisma.model.create({
      data: {
        name: modelName,
        type: modelType,
        status: 'training',
        progress: 0,
        thumbnailUrl: imageUrls[0],
        trainingImages: imageUrls,
      },
    });

    // Simulate training process (in real app, this would trigger actual training)
    simulateTraining(model.id);

    return NextResponse.json({
      success: true,
      model: {
        id: model.id,
        name: model.name,
        type: model.type,
        status: model.status,
      },
    });
  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { error: 'Failed to start training' },
      { status: 500 }
    );
  }
}

// Simulate training progress
async function simulateTraining(modelId: string) {
  try {
    // Update progress incrementally
    for (let progress = 10; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds delay

      await prisma.model.update({
        where: { id: modelId },
        data: {
          progress,
          status: progress === 100 ? 'ready' : 'training',
        },
      });
    }
  } catch (error) {
    console.error('Training simulation error:', error);
    // Mark as failed
    await prisma.model.update({
      where: { id: modelId },
      data: {
        status: 'failed',
      },
    });
  }
}
