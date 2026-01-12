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

    // Handle payment succeeded event
    if (eventType === 'payment.succeeded') {
      const metadata = eventData.metadata;
      const productCart = eventData.product_cart || [];

      if (metadata && metadata.userId) {
        // Determine the plan based on the product purchased
        let plan: 'FREE' | 'PRO' | 'ULTRA' = 'FREE';

        if (productCart.length > 0) {
          const productId = productCart[0].product_id;
          plan = getPlanFromProductId(productId);
        }

        // Update user plan
        await prisma.user.update({
          where: { id: metadata.userId as string },
          data: { plan },
        });

        console.log(`User ${metadata.userId} upgraded to ${plan}`);
      } else {
        console.warn('No userId found in payment metadata');
      }
    }

    // Handle subscription events
    if (eventType === 'subscription.active') {
      const metadata = eventData.metadata;
      const productCart = eventData.product_cart || [];

      if (metadata && metadata.userId) {
        let plan: 'FREE' | 'PRO' | 'ULTRA' = 'FREE';

        if (productCart.length > 0) {
          const productId = productCart[0].product_id;
          plan = getPlanFromProductId(productId);
        }

        await prisma.user.update({
          where: { id: metadata.userId as string },
          data: { plan },
        });

        console.log(`User ${metadata.userId} subscription activated with ${plan}`);
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
          data: { plan: 'FREE' },
        });

        console.log(`User ${metadata.userId} downgraded to FREE`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler error', { status: 500 });
  }
}
