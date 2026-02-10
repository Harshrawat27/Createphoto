import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';
import { getModelById } from '@/lib/ai-models-config';

// Helper function to fetch image from URL and convert to base64
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const referenceImageUrl = formData.get('referenceImageUrl') as string;
    const aspectRatio = (formData.get('aspectRatio') as string) || '9:16';
    const resolution = (formData.get('resolution') as string) || '1K';
    const aiModelId =
      (formData.get('aiModelId') as string) || 'gemini-3-pro';

    if (!prompt || !referenceImageUrl) {
      return NextResponse.json(
        { error: 'Prompt and reference image URL are required' },
        { status: 400 }
      );
    }

    // Get AI model from static config
    const aiModel = getModelById(aiModelId);
    if (!aiModel) {
      return NextResponse.json(
        { error: 'AI model not found' },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    if (user.credits < aiModel.creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Need ${aiModel.creditCost}, have ${user.credits}`,
        },
        { status: 402 }
      );
    }

    // Initialize Google AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    // Build contents array
    const contents: any[] = [];

    // Build the edit prompt
    const editPrompt = `Edit this image according to the following instructions: ${prompt}

Keep the main subject and overall composition similar, but apply the requested changes. Maintain high quality and realistic details.`;

    contents.push({ text: editPrompt });

    // Add reference image
    console.log('Fetching reference image for edit...');
    try {
      const base64Data = await fetchImageAsBase64(referenceImageUrl);
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
      console.log('Added reference image to contents');
    } catch (err) {
      console.error('Failed to fetch reference image:', referenceImageUrl, err);
      return NextResponse.json(
        { error: 'Failed to fetch reference image' },
        { status: 400 }
      );
    }

    // Generate edited image with Gemini
    console.log('Generating edited image with Gemini 3 Pro Image...');
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: contents,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: resolution,
        },
      },
    });

    // Check if response has candidates
    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates in response');
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      console.error('No content parts in response');
      return NextResponse.json(
        { error: 'No content in response' },
        { status: 500 }
      );
    }

    let imageUrl = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        console.log('Found inline image data');

        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';

        // Create blob and file for upload
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: mimeType });
        const file = new File([blob], `edited-${Date.now()}.png`, {
          type: mimeType,
        });

        // Upload to R2
        const { uploadToR2 } = await import('@/lib/r2-upload');
        imageUrl = await uploadToR2(file, 'generated');

        console.log('Uploaded edited image to R2:', imageUrl);
        break;
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to extract image from response' },
        { status: 500 }
      );
    }

    // Save generation to database
    const generation = await prisma.generation.create({
      data: {
        prompt: `[Edit] ${prompt}`,
        imageUrl: imageUrl,
        modelId: null,
        aiModelId: aiModel.id,
        aspectRatio,
        resolution,
        creditsCost: aiModel.creditCost,
        userId: user.id,
      },
    });

    // Deduct credits from user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          decrement: aiModel.creditCost,
        },
      },
    });

    return NextResponse.json({
      success: true,
      images: [
        {
          id: generation.id,
          url: generation.imageUrl,
          prompt: generation.prompt,
        },
      ],
      creditsUsed: aiModel.creditCost,
      remainingCredits: user.credits - aiModel.creditCost,
    });
  } catch (error: any) {
    console.error('Edit API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to edit image' },
      { status: 500 }
    );
  }
}
