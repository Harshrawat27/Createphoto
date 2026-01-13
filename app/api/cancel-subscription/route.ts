import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { dodoClient } from '@/lib/dodo-payment';

export async function POST(req: NextRequest) {
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

    // Fetch user data to get subscription ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionId: true,
        plan: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.subscriptionId) {
      return new NextResponse('No active subscription', { status: 400 });
    }

    if (user.plan === 'FREE') {
      return new NextResponse('Already on free plan', { status: 400 });
    }

    // Cancel the subscription using Dodo Payments API
    try {
      await dodoClient.subscriptions.update(user.subscriptionId, {
        cancel_at_next_billing_date: true
      });
      console.log(`Scheduled cancellation for subscription ${user.subscriptionId} for user ${userId}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period'
      });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      return new NextResponse(
        `Failed to cancel subscription: ${error.message || 'Unknown error'}`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in cancel subscription API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
