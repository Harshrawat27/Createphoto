import { NextRequest, NextResponse } from 'next/server';
import { dodoClient } from '@/lib/dodo-payment';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const webhookId = req.headers.get('webhook-id');
    const webhookSignature = req.headers.get('webhook-signature');
    const webhookTimestamp = req.headers.get('webhook-timestamp');

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.error('Missing webhook headers');
      return new NextResponse('Missing webhook headers', { status: 400 });
    }

    // Verify webhook signature and parse event
    let event: any;
    try {
      event = dodoClient.webhooks.unwrap(body, {
        headers: {
          'webhook-id': webhookId,
          'webhook-signature': webhookSignature,
          'webhook-timestamp': webhookTimestamp,
        },
      });
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // Extract event type - it's a property of the unwrapped event
    const eventType = (event as any).event_type || (event as any).type;
    const eventData = (event as any).data || event;

    console.log('Webhook event received:', eventType);

    // Helper function to determine plan based on product_id
    const getPlanFromProductId = (productId: string): 'FREE' | 'PRO' | 'ULTRA' => {
      if (productId === process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID) {
        return 'PRO';
      } else if (productId === process.env.NEXT_PUBLIC_DODO_ULTRA_PRODUCT_ID) {
        return 'ULTRA';
      }
      return 'FREE';
    };

    // Handle subscription.renewed event (this fires on initial payment and renewals)
    if (eventType === 'subscription.renewed') {
      const metadata = eventData.metadata;
      const productId = eventData.product_id;
      const subscriptionId = eventData.subscription_id;

      if (metadata && metadata.userId && productId) {
        // Determine the plan based on the product purchased
        const plan = getPlanFromProductId(productId as string);

        // Determine credits based on plan
        let credits = 100; // Default FREE credits
        if (plan === 'PRO') {
          credits = 300;
        } else if (plan === 'ULTRA') {
          credits = 1000;
        }

        // Update user plan, credits, and subscription ID
        await prisma.user.update({
          where: { id: metadata.userId as string },
          data: {
            plan,
            credits,
            subscriptionId: subscriptionId as string
          },
        });

        console.log(`User ${metadata.userId} upgraded to ${plan} with ${credits} credits (Product: ${productId}, Subscription: ${subscriptionId})`);
      } else {
        console.warn('Missing userId or productId in subscription.renewed event');
      }
    }

    // Handle subscription.active event
    if (eventType === 'subscription.active') {
      const metadata = eventData.metadata;
      const productId = eventData.product_id;

      if (metadata && metadata.userId && productId) {
        const plan = getPlanFromProductId(productId as string);

        await prisma.user.update({
          where: { id: metadata.userId as string },
          data: { plan },
        });

        console.log(`User ${metadata.userId} subscription activated with ${plan} (Product: ${productId})`);
      }
    }

    if (
      eventType === 'subscription.cancelled' ||
      eventType === 'subscription.expired'
    ) {
      const metadata = eventData.metadata;

      if (metadata && metadata.userId) {
        await prisma.user.update({
          where: { id: metadata.userId as string },
          data: {
            plan: 'FREE',
            subscriptionId: null
          },
        });

        console.log(`User ${metadata.userId} downgraded to FREE and subscription ID cleared`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler error', { status: 500 });
  }
}
