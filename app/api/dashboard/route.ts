import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the current user session
    const incomingHeaders = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(incomingHeaders),
    });

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Fetch active model (most recent ready model)
    const activeModel = await prisma.model.findFirst({
      where: {
        userId,
        status: 'ready',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    // Fetch total generations count
    const totalGenerations = await prisma.generation.count({
      where: {
        userId,
      },
    });

    // Fetch recent 5 generations
    const recentGenerations = await prisma.generation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        imageUrl: true,
        prompt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      activeModel,
      totalGenerations,
      recentGenerations,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
