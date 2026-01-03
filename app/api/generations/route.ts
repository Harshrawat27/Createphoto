import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const generations = await prisma.generation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 generations
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

    return NextResponse.json(formattedGenerations);
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}
