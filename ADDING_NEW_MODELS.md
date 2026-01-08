# Adding New AI Models

This guide explains how to add new AI models from different providers to the PicLoreAI platform.

## Overview

The system uses a **static configuration** approach:

- **Config File**: `lib/ai-models-config.ts` is the single source of truth
- **API Routes**: Each model has its own route at `app/api/generate/{provider}/{model-name}/route.ts`
- **Database**: Only stores `aiModelId` (string) and `creditsCost` for analytics
- **Frontend**: Automatically picks up models from the config file

## Step-by-Step Guide

### 1. Add Model Configuration

Edit `lib/ai-models-config.ts` and add a new model to the `AI_MODELS` object:

```typescript
export const AI_MODELS: Record<string, AIModelConfig> = {
  // Existing models...

  'dall-e-3': {
    // Unique ID (used in database)
    id: 'dall-e-3', // Same as key
    provider: 'openai', // Company name (lowercase)
    displayName: 'DALL-E 3', // User-friendly name
    description: "OpenAI's most advanced image generation model",
    creditCost: 15, // Credits per generation
    isActive: true, // Show in UI?
    apiPath: 'openai/dall-e-3', // API route path
    capabilities: {
      aspectRatios: ['1:1', '16:9'], // Supported aspect ratios
      resolutions: ['1K'], // Supported resolutions
      features: {
        supportsReferenceImage: false, // Can use reference images?
        supportsModelTraining: false, // Can use trained models?
        maxImageCount: 1, // Max images per generation
      },
    },
  },
};
```

### 2. Create API Route

Create a new folder and route file: `app/api/generate/{provider}/{model-name}/route.ts`

**Example for OpenAI DALL-E 3**: `app/api/generate/openai/dall-e-3/route.ts`

**Template Structure:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-user';
import { getModelById } from '@/lib/ai-models-config';
// Import your AI SDK here
// import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request data
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const modelId = formData.get('modelId') as string;
    const aspectRatio = (formData.get('aspectRatio') as string) || '1:1';
    const resolution = (formData.get('resolution') as string) || '1K';
    const imageCount = parseInt(formData.get('imageCount') as string) || 1;
    const aiModelId = formData.get('aiModelId') as string;

    // 3. Get AI model from static config
    const aiModel = getModelById(aiModelId);

    if (!aiModel) {
      return NextResponse.json({ error: 'AI model not found' }, { status: 400 });
    }

    // 4. Check credits
    const totalCreditsNeeded = aiModel.creditCost * imageCount;
    if (user.credits < totalCreditsNeeded) {
      return NextResponse.json(
        { error: \`Insufficient credits. Need \${totalCreditsNeeded}, have \${user.credits}\` },
        { status: 402 }
      );
    }

    // 5. Initialize your AI SDK
    // const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 6. Call the AI API to generate images
    const generatedImages = [];

    for (let i = 0; i < imageCount; i++) {
      // YOUR API CALL HERE
      // const response = await client.images.generate({...});

      // Convert response to file and upload to R2
      const { uploadToR2 } = await import('@/lib/r2-upload');
      // const imageUrl = await uploadToR2(file, 'generated');

      // Save to database
      const generation = await prisma.generation.create({
        data: {
          prompt: prompt,
          imageUrl: imageUrl, // Replace with actual URL
          modelId: modelId || null,
          aiModelId: aiModel.id,  // Store the model ID
          aspectRatio,
          resolution,
          creditsCost: aiModel.creditCost,  // Store cost at generation time
          userId: user.id,
        },
      });

      generatedImages.push({
        id: generation.id,
        url: generation.imageUrl,
        prompt: generation.prompt,
      });
    }

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images' },
        { status: 500 }
      );
    }

    // 7. Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          decrement: aiModel.creditCost * generatedImages.length,
        },
      },
    });

    // 8. Return response
    return NextResponse.json({
      success: true,
      images: generatedImages,
      creditsUsed: aiModel.creditCost * generatedImages.length,
      remainingCredits: user.credits - aiModel.creditCost * generatedImages.length,
    });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}
```

### 3. Install Required SDK (if needed)

```bash
npm install openai
# or
npm install @anthropic-ai/sdk
# or whatever SDK you need
```

### 4. Add Environment Variables

Add API keys to `.env.local`:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Test Your Model

1. Restart your dev server
2. Go to `/dashboard/create`
3. Your new model should appear in the AI Model dropdown
4. Try generating an image

## Examples

### Google Gemini Models (Already Implemented)

See these files for reference:

- `app/api/generate/google/gemini-3-pro-image/route.ts`
- `app/api/generate/google/gemini-2.5-flash-image/route.ts`

### Adding a Replicate Model

1. **Config** (`lib/ai-models-config.ts`):

```typescript
'flux-pro': {
  id: 'flux-pro',
  provider: 'replicate',
  displayName: 'Flux Pro',
  description: 'Ultra-realistic image generation',
  creditCost: 20,
  isActive: true,
  apiPath: 'replicate/flux-pro',
  capabilities: {
    aspectRatios: ['1:1', '16:9', '9:16'],
    resolutions: ['2K', '4K'],
    features: {
      supportsReferenceImage: true,
      supportsModelTraining: false,
      maxImageCount: 1,
    },
  },
}
```

2. **Route** (`app/api/generate/replicate/flux-pro/route.ts`):

```typescript
import Replicate from 'replicate';
import { getModelById } from '@/lib/ai-models-config';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Inside POST handler:
const aiModel = getModelById(aiModelId);
const output = await replicate.run('black-forest-labs/flux-pro', {
  input: {
    prompt: prompt,
    aspect_ratio: aspectRatio,
  },
});
```

3. **Install**: `npm install replicate`

## Important Notes

### Static Configuration

- All model configs are in `lib/ai-models-config.ts`
- Changes require code deployment
- No database seeding needed
- Easy to version control and review

### Credit System

- Each model has a `creditCost` - deducted per generation
- Credits are checked BEFORE generation
- Credits are deducted AFTER successful generation
- Failed generations don't deduct credits
- `creditsCost` is saved in Generation table for historical tracking

### Model IDs

- Use kebab-case: `gemini-3-pro`, `dall-e-3`, `flux-pro`
- Must be unique across all providers
- Stored in database for analytics
- Cannot be changed once in use (would break historical data)

### API Path Convention

- Pattern: `{provider}/{model-name}`
- Always lowercase with hyphens
- Must match folder structure exactly
- Example: `google/gemini-3-pro-image`

### Model Capabilities

- Define supported `aspectRatios` and `resolutions` in capabilities
- `supportsReferenceImage`: Can the model use reference images?
- `supportsModelTraining`: Can it use your trained models?
- `maxImageCount`: Maximum images per generation

### Error Handling

- Always check authentication first
- Validate all inputs
- Check credits before API calls
- Handle API failures gracefully
- Return meaningful error messages

### File Uploads

- Use `uploadToR2()` helper from `@/lib/r2-upload`
- Supported: images from base64, URLs, or File objects
- Always upload to 'generated' folder

## Analytics & Historical Data

Even with static config, you can still track:

- Which models are most popular (query `aiModelId` in generations)
- Revenue per model (sum `creditsCost` by `aiModelId`)
- Cost trends over time (see how pricing changes affect usage)
- Model switching patterns

Example query:

```sql
SELECT aiModelId, COUNT(*), SUM(creditsCost) as total_credits
FROM generation
GROUP BY aiModelId;
```

## Updating Model Pricing

When you update pricing in the config:

1. Edit `creditCost` in `lib/ai-models-config.ts`
2. Deploy code
3. New generations will use new pricing
4. Old generations still show original cost (via `creditsCost` field)

## Troubleshooting

**Model not showing in dropdown:**

- Check if `isActive: true` in config
- Check browser console for errors
- Restart dev server

**Generation fails:**

- Check API key in environment variables
- Check console logs for specific errors
- Verify model capabilities match what you're requesting

**Credits not deducting:**

- Make sure you're calling `prisma.user.update()` after successful generation
- Check that `creditsCost` is saved in Generation record

**Wrong API path:**

- Verify `apiPath` in config matches folder structure exactly
- Check that route file is at `app/api/generate/{apiPath}/route.ts`

## Benefits of Static Approach

1. **Simple**: One file to manage all models
2. **Fast**: No database queries for model configs
3. **Version Controlled**: All changes tracked in git
4. **Type Safe**: TypeScript ensures consistency
5. **Easy to Review**: See all models in one place
6. **No Sync Issues**: Config is always up to date

## Future Considerations

If you need dynamic pricing or per-user access control, you can:

1. Keep config file for model definitions
2. Add override tables in database
3. Check database first, fall back to config
4. Best of both worlds!
