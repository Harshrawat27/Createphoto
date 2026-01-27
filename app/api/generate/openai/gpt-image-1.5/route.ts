import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';
import { getModelById } from '@/lib/ai-models-config';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to fetch image from URL and convert to File
async function fetchImageAsFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
  return new File([blob], filename, { type: 'image/jpeg' });
}

// Helper function to convert File to File (for consistency)
async function convertToFile(file: File): Promise<File> {
  return file;
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
  return qualityMap[resolution] || 'high';
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

    // Build the prompt for OpenAI Images Edit API
    let enhancedPrompt = '';
    if (modelData) {
      // Base prompt that references the images
      enhancedPrompt = `Generate a photo of this ${modelData.type} (shown in the provided images).`;

      // Add reference image instructions with specific options
      if (referenceImage && referenceOptions.length > 0) {
        const optionsText = referenceOptions.join(', ');
        enhancedPrompt += ` Use ONLY the ${optionsText} from the last reference image, but KEEP the face and body of the first 4 images ${modelData.type} from the training images.`;
      }

      // Add user's custom prompt if provided
      if (prompt) {
        enhancedPrompt += ` ${prompt}`;
      }
    } else {
      enhancedPrompt = prompt || 'Generate a photo';
    }

    // Prepare images array for OpenAI
    const images: File[] = [];

    // Add training images if model is selected (limit to 5 images)
    if (
      modelData &&
      modelData.trainingImages &&
      modelData.trainingImages.length > 0
    ) {
      console.log('Fetching training images from R2...');
      const trainingImages = modelData.trainingImages.slice(0, 4); // Max 5 images

      for (let idx = 0; idx < trainingImages.length; idx++) {
        try {
          const imageFile = await fetchImageAsFile(
            trainingImages[idx],
            `training-${idx}.jpg`
          );
          images.push(imageFile);
          console.log(`Added training image ${idx + 1}`);
        } catch (err) {
          console.error(
            'Failed to fetch training image:',
            trainingImages[idx],
            err
          );
        }
      }
    }

    // Add reference image if provided by user
    if (referenceImage) {
      console.log('Adding reference image from user upload...');
      images.push(referenceImage);
      console.log('Added reference image to images array');
    }

    // Map our format to OpenAI format
    const size = mapAspectRatioToSize(aspectRatio);
    const quality = mapResolutionToQuality(resolution);

    console.log('Generating with OpenAI GPT Image 1.5');
    console.log('Prompt:', enhancedPrompt);
    console.log('Size:', size);
    console.log('Quality:', quality);

    // Generate images
    const generatedImages = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        let response;

        // Use edit endpoint if we have images (training or reference)
        if (images.length > 0) {
          console.log(
            `Calling OpenAI images.edit with ${images.length} images`
          );
          response = await openai.images.edit({
            model: 'gpt-image-1.5',
            image: images,
            prompt: enhancedPrompt,
            size: size as '1024x1024' | '1536x1024' | '1024x1536',
            input_fidelity: quality === 'high' ? 'high' : 'medium',
          } as any);
        } else {
          // Fallback to generate if no images provided
          console.log('Calling OpenAI images.generate (no images provided)');
          response = await openai.images.generate({
            model: 'gpt-image-1.5',
            prompt: enhancedPrompt,
            size: size as '1024x1024' | '1536x1024' | '1024x1536',
            quality: quality,
          });
        }

        console.log('OpenAI Images API response received');

        // Extract base64 image from response
        const imageBase64 = response.data?.[0]?.b64_json;

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
