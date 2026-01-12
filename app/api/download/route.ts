import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const incomingHeaders = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(incomingHeaders),
    });

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get image URL from query params
    const searchParams = req.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Image URL is required', { status: 400 });
    }

    // Fetch the image from R2
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: 500 });
    }

    // Get the image blob
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    // Return the image with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Content-Disposition': 'attachment; filename="generated-image.png"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
