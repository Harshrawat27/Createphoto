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

    // Parse JSON body
    const body = await request.json();
    const { modelName, modelType } = body;

    if (!modelName || !modelType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create model in database with empty training images
    // Images will be uploaded separately via /api/models/upload-image
    const model = await prisma.model.create({
      data: {
        name: modelName,
        type: modelType,
        status: 'training',
        progress: 0,
        trainingImages: [],
        userId: user.id,
      },
    });

    // Start training simulation (will update progress in background)
    simulateTraining(model.id);

    return NextResponse.json({
      success: true,
      modelId: model.id,
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
