import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';
import { getModelById } from '@/lib/ai-models-config';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Map aspect ratio to OpenAI size format
function mapAspectRatioToSize(aspectRatio: string): string {
  const sizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1536x1024',
    '9:16': '1024x1536',
  };
  return sizeMap[aspectRatio] || '1024x1024';
}

// Map resolution to OpenAI quality
function mapResolutionToQuality(resolution: string): 'low' | 'medium' | 'high' {
  const qualityMap: Record<string, 'low' | 'medium' | 'high'> = {
    '1K': 'low',
    '2K': 'medium',
    '4K': 'high',
  };
  return qualityMap[resolution] || 'medium';
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
    const modelId = formData.get('modelId') as string;
    const aspectRatio = (formData.get('aspectRatio') as string) || '1:1';
    const resolution = (formData.get('resolution') as string) || '2K';
    const imageCount = parseInt(formData.get('imageCount') as string) || 1;
    const referenceImage = formData.get('referenceImage') as File | null;
    const referenceOptionsStr = formData.get('referenceOptions') as string;
    const aiModelId = formData.get('aiModelId') as string;
    const referenceOptions: string[] = referenceOptionsStr
      ? JSON.parse(referenceOptionsStr)
      : [];

    // Get AI model from static config
    const aiModel = getModelById(aiModelId);

    if (!aiModel) {
      return NextResponse.json(
        { error: 'AI model not found' },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const totalCreditsNeeded = aiModel.creditCost * imageCount;

    // Fetch user with credits from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    if (!dbUser || dbUser.credits < totalCreditsNeeded) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Need ${totalCreditsNeeded}, have ${
            dbUser?.credits || 0
          }`,
        },
        { status: 402 }
      );
    }

    // Prompt is optional if reference image with options is provided
    const hasReferenceWithOptions =
      referenceImage && referenceOptions.length > 0;
    if (!prompt && !hasReferenceWithOptions) {
      return NextResponse.json(
        {
          error: 'Prompt is required or provide a reference image with options',
        },
        { status: 400 }
      );
    }

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

    // Build the content array for OpenAI Responses API
    const content: any[] = [];

    // Build the smart prompt
    let enhancedPrompt = '';
    if (modelData) {
      // Base prompt that tells the AI to use the training images
      enhancedPrompt = `Generate a photo of this ${modelData.type} (shown in the reference images).`;

      // Add reference image instructions with specific options
      if (referenceImage && referenceOptions.length > 0) {
        const optionsText = referenceOptions.join(', ');
        enhancedPrompt += ` Use ONLY the ${optionsText} from the last reference image, but KEEP the face and body of the ${modelData.type} from the training images.`;
      }

      // Add user's custom prompt if provided
      if (prompt) {
        enhancedPrompt += ` ${prompt}`;
      }
    } else {
      enhancedPrompt = prompt || 'Generate a photo';
    }

    // Add text prompt
    content.push({ type: 'input_text', text: enhancedPrompt });

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
          content.push({
            type: 'input_image',
            image_url: imageUrl,
          });
          console.log('Added training image to content');
        } catch (err) {
          console.error('Failed to add training image:', imageUrl, err);
        }
      }
    }

    // Add reference image if provided by user
    if (referenceImage) {
      console.log('Adding reference image from user upload...');
      const base64Data = await fileToBase64(referenceImage);
      content.push({
        type: 'input_image',
        image_url: `data:${referenceImage.type};base64,${base64Data}`,
      });
      console.log('Added reference image to content');
    }

    // Map our format to OpenAI format
    const size = mapAspectRatioToSize(aspectRatio);
    const quality = mapResolutionToQuality(resolution);

    console.log('Generating with OpenAI GPT Image 1.5');
    console.log('Prompt:', enhancedPrompt);
    console.log('Size:', size);
    console.log('Quality:', quality);
    console.log('Content items:', content.length);

    // Generate images
    const generatedImages = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        // Call OpenAI Responses API
        const response = await openai.responses.create({
          model: 'gpt-image-1.5',
          input: [
            {
              role: 'user',
              content: content,
            },
          ],
          tools: [
            {
              type: 'image_generation',
              quality: quality,
              size: size as '1024x1024' | '1536x1024' | '1024x1536',
            } as any,
          ],
        });

        console.log('OpenAI Responses API response received');
        console.log(
          'Response output:',
          JSON.stringify(response.output, null, 2)
        );

        // Extract base64 image from response - try different possible structures
        let imageBase64: string | undefined;

        // Try to find the image in the output
        for (const item of response.output) {
          if ((item as any).type === 'image_generation_call') {
            imageBase64 =
              (item as any).image || (item as any).result || (item as any).data;
          } else if ((item as any).content) {
            // Check if content has image data
            const content = (item as any).content;
            if (Array.isArray(content)) {
              for (const part of content) {
                if (part.type === 'image' || part.image) {
                  imageBase64 = part.image || part.data;
                }
              }
            }
          }
          if (imageBase64) break;
        }

        if (!imageBase64) {
          console.error('No image data in response');
          throw new Error('No image received from OpenAI');
        }

        console.log('Found base64 image data');

        // Convert base64 to buffer
        const buffer = Buffer.from(imageBase64, 'base64');

        // Create a File object
        const blob = new Blob([buffer], { type: 'image/png' });
        const file = new File([blob], `generated-${Date.now()}-${i}.png`, {
          type: 'image/png',
        });

        // Upload to R2
        const { uploadToR2 } = await import('@/lib/r2-upload');
        const r2ImageUrl = await uploadToR2(file, 'generated');

        console.log('Uploaded to R2:', r2ImageUrl);

        // Save to database
        const generation = await prisma.generation.create({
          data: {
            prompt: enhancedPrompt,
            imageUrl: r2ImageUrl,
            modelId: modelId || null,
            aiModelId: aiModel.id,
            aspectRatio,
            resolution,
            creditsCost: aiModel.creditCost,
            userId: user.id,
          },
        });

        console.log('Saved generation to database:', generation);

        generatedImages.push({
          id: generation.id,
          url: generation.imageUrl,
          prompt: generation.prompt,
        });
      } catch (genError: any) {
        console.error('Image generation error:', genError);
        // Continue with other images if one fails
        throw genError; // Re-throw to handle in outer catch
      }
    }

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images' },
        { status: 500 }
      );
    }

    // Deduct credits from user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          decrement: aiModel.creditCost * generatedImages.length,
        },
      },
    });

    console.log('Credits deducted successfully');

    return NextResponse.json({
      success: true,
      images: generatedImages,
      creditsUsed: aiModel.creditCost * generatedImages.length,
      remainingCredits:
        dbUser.credits - aiModel.creditCost * generatedImages.length,
    });
  } catch (error: any) {
    console.error('OpenAI Generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}
