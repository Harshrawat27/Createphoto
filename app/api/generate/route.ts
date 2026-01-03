import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

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
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const modelId = formData.get('modelId') as string;
    const aspectRatio = (formData.get('aspectRatio') as string) || '1:1';
    const resolution = (formData.get('resolution') as string) || '1K';
    const imageCount = parseInt(formData.get('imageCount') as string) || 1;
    const referenceImage = formData.get('referenceImage') as File | null;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize Google AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    // If modelId is provided, get the model details
    let modelData = null;
    if (modelId) {
      modelData = await prisma.model.findUnique({
        where: { id: modelId },
      });

      if (!modelData || modelData.status !== 'ready') {
        return NextResponse.json({ error: 'Model not ready' }, { status: 400 });
      }
    }

    // Build contents array for the API
    const contents: any[] = [];

    // Build the smart prompt
    let enhancedPrompt = '';
    if (modelData) {
      // Prompt that tells the AI to use the training images
      enhancedPrompt = `Generate a photo of this ${modelData.type} (shown in the reference images). ${prompt}`;

      // Add reference image instruction if provided
      if (referenceImage) {
        enhancedPrompt += ` The person should be in a similar pose or style as shown in the style reference image. but never use face of this image.`;
      }
    } else {
      enhancedPrompt = prompt;
    }

    // Add text prompt
    contents.push({ text: enhancedPrompt });

    // Add training images if model is selected (limit to 5 images)
    if (
      modelData &&
      modelData.trainingImages &&
      modelData.trainingImages.length > 0
    ) {
      console.log('Fetching training images from R2...');
      const trainingImages = modelData.trainingImages.slice(0, 5); // Max 5 images

      for (const imageUrl of trainingImages) {
        try {
          const base64Data = await fetchImageAsBase64(imageUrl);
          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          });
          console.log('Added training image to contents');
        } catch (err) {
          console.error('Failed to fetch training image:', imageUrl, err);
        }
      }
    }

    // Add reference image if provided by user
    if (referenceImage) {
      console.log('Adding reference image from user upload...');
      const base64Data = await fileToBase64(referenceImage);
      contents.push({
        inlineData: {
          mimeType: referenceImage.type,
          data: base64Data,
        },
      });
      console.log('Added reference image to contents');
    }

    // Generate images
    const generatedImages = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        console.log(
          'Generating image with Gemini Image API, prompt:',
          enhancedPrompt
        );
        console.log('Contents array length:', contents.length);
        console.log(
          'Config - Aspect Ratio:',
          aspectRatio,
          'Resolution:',
          resolution
        );

        // Generate image with Gemini Image API
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: contents,
          config: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: aspectRatio, // "1:1", "9:16", "16:9"
              imageSize: resolution, // "1K", "2K" or "4K"
            },
          },
        });

        console.log('Gemini Image API response received');

        let imageUrl = '';
        let imageFound = false;

        // Check if response has candidates
        if (!response.candidates || response.candidates.length === 0) {
          console.error('No candidates in response');
          throw new Error('No image candidates received from Gemini Image API');
        }

        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts) {
          console.error('No content parts in response');
          throw new Error('No content parts received from Gemini Image API');
        }

        // Extract image data from response parts
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            console.log('Found inline image data');

            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';

            console.log('Converting base64 to file for upload...');

            // Create a buffer from base64
            const buffer = Buffer.from(base64Data, 'base64');

            // Create a File-like object
            const blob = new Blob([buffer], { type: mimeType });
            const file = new File([blob], `generated-${Date.now()}-${i}.png`, {
              type: mimeType,
            });

            // Upload to R2
            const { uploadToR2 } = await import('@/lib/r2-upload');
            imageUrl = await uploadToR2(file, 'generated');

            console.log('Uploaded to R2:', imageUrl);
            imageFound = true;
            break;
          }
        }

        if (!imageFound) {
          console.error('No image data in response');
          throw new Error('No image data received from Gemini Image API');
        }

        const generation = await prisma.generation.create({
          data: {
            prompt: enhancedPrompt,
            imageUrl: imageUrl,
            modelId: modelId || null,
            aspectRatio,
            resolution,
          },
        });

        console.log('Saved generation to database:', generation);

        generatedImages.push({
          id: generation.id,
          url: generation.imageUrl,
          prompt: generation.prompt,
        });
      } catch (genError) {
        console.error('Image generation error:', genError);
        // Continue with other images if one fails
      }
    }

    console.log('All generated images:', generatedImages);

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
    });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}
