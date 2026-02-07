import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';
import { uploadToR2 } from '@/lib/r2-upload';

const ADMIN_EMAIL = 'harshrawat.dev@gmail.com';

// Helper function to fetch image from URL and convert to base64
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const referenceImage = formData.get('referenceImage') as File;
    const modelId = formData.get('modelId') as string;
    const heading = formData.get('heading') as string;
    const description = formData.get('description') as string;

    if (!referenceImage || !modelId || !heading || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the model with training images
    const modelData = await prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!modelData || modelData.status !== 'ready') {
      return NextResponse.json(
        { error: 'Model not ready or not found' },
        { status: 400 }
      );
    }

    // Initialize Google AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    // Build contents array
    const contents: any[] = [];

    // Build the admin generation prompt (with 20% change line)
    const adminPrompt = `Generate a photo of this ${modelData.type} (shown in the reference images).
Use the pose, clothes, lighting, and background from the last reference image, but KEEP the face and body of the model from first 4 images.
${heading}. ${description}
Make sure to slightly change the photo by 20% so that it looks like a new AI-generated version while maintaining the essence.`;

    contents.push({ text: adminPrompt });

    // Add training images (limit to 4)
    if (modelData.trainingImages && modelData.trainingImages.length > 0) {
      const trainingImages = modelData.trainingImages.slice(0, 4);
      for (const imageUrl of trainingImages) {
        try {
          const base64Data = await fetchImageAsBase64(imageUrl);
          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          });
        } catch (err) {
          console.error('Failed to fetch training image:', imageUrl, err);
        }
      }
    }

    // Add reference image
    const refBase64 = await fileToBase64(referenceImage);
    contents.push({
      inlineData: {
        mimeType: referenceImage.type || 'image/jpeg',
        data: refBase64,
      },
    });

    // Generate image with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: contents,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '9:16',
          imageSize: '1K',
        },
      },
    });

    // Extract image from response
    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      return NextResponse.json(
        { error: 'No content in response' },
        { status: 500 }
      );
    }

    let imageUrl = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';

        // Create blob and file for upload
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });
        const file = new File([blob], `template-${Date.now()}.png`, {
          type: mimeType,
        });

        // Upload to R2
        imageUrl = await uploadToR2(file, 'templates');
        break;
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to extract image from response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error('Generate template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}
