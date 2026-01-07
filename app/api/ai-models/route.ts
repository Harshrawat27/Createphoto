import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';
import { getActiveModels } from '@/lib/ai-models-config';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active AI models from static config
    const aiModels = getActiveModels();

    // Get user's credit balance from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    return NextResponse.json({
      models: aiModels,
      userCredits: userData?.credits || 0,
    });
  } catch (error: any) {
    console.error('AI Models API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch AI models' },
      { status: 500 }
    );
  }
}
