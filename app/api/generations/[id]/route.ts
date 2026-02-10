import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromR2 } from '@/lib/r2-upload';
import { getAuthenticatedUser } from '@/lib/get-user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const generation = await prisma.generation.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        model: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: generation.id,
      url: generation.imageUrl,
      prompt: generation.prompt,
      modelName: generation.model?.name || 'Unknown',
      createdAt: generation.createdAt,
    });
  } catch (error) {
    console.error('Error fetching generation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the generation to find the image URL
    const generation = await prisma.generation.findUnique({
      where: { id },
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Ensure the user owns this generation
    if (generation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete from R2
    try {
      await deleteFromR2(generation.imageUrl);
    } catch (error) {
      console.error('Failed to delete from R2:', error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    await prisma.generation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete generation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete generation' },
      { status: 500 }
    );
  }
}
