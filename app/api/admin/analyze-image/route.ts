import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/get-user';
import OpenAI from 'openai';

const ADMIN_EMAIL = 'harshrawat.dev@gmail.com';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = image.type || 'image/jpeg';

    // Use OpenAI Vision to analyze the image
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are the expert in programmatic SEO. Analyze this photo and provide the following in JSON format:
{
  "heading": "A catchy, SEO-friendly heading, long tail keyword types heading for this photo template (5-10 words, capitalize important words). never use words like man, women, use word model if you have to use",
  "description": "A brief 1-2 sentence description of the scene, setting, and style of the photo, never use words like man, women instead use word model",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
}

The tags should be relevant categories, long tail for good seo and explanation of image like: gym outfit mirror selfie, minimal fashion look, editorial photoshoot ai, clean background portrait, Circular Spotlight Lighting, moody indoor portrait, etc.
Focus on the style, lighitng, setting, mood, and use case of the photo.
Return ONLY the JSON, no markdown or extra text.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsed;
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      heading: parsed.heading || '',
      description: parsed.description || '',
      tags: parsed.tags || [],
    });
  } catch (error: any) {
    console.error('Analyze image error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
