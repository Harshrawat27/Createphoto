import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';

const PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination params
    const searchParams = request.nextUrl.searchParams;
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || String(PAGE_SIZE));

    // Get total count for pagination info
    const totalCount = await prisma.generation.count({
      where: { userId: user.id },
    });

    const generations = await prisma.generation.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: {
        model: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedGenerations = generations.map((gen: any) => ({
      id: gen.id,
      url: gen.imageUrl,
      prompt: gen.prompt,
      modelName: gen.model?.name || 'No Model',
      createdAt: gen.createdAt,
    }));

    return NextResponse.json({
      images: formattedGenerations,
      pagination: {
        total: totalCount,
        skip,
        take,
        hasMore: skip + take < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}
