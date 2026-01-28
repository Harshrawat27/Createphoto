import { Metadata } from 'next';
import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const photo = await prisma.photoTemplate.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!photo) {
      return {
        title: 'Photo Not Found - PicLoreAI',
      };
    }

    const tagNames = photo.tags.map((t) => t.tag.name);

    return {
      title: `${photo.heading} - AI Photo Prompt | PicLoreAI`,
      description: `Generate stunning AI photos like "${photo.heading}" with this optimized prompt. Created with ${photo.modelName}. ${tagNames.length > 0 ? `Tags: ${tagNames.join(', ')}.` : ''}`,
      keywords: [
        photo.heading,
        photo.modelName,
        'AI photo',
        'AI image generation',
        'photo prompt',
        ...tagNames,
      ],
      openGraph: {
        title: `${photo.heading} - PicLoreAI`,
        description: `Generate AI photos like this with our optimized prompt. Created with ${photo.modelName}.`,
        images: [photo.imageUrl],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${photo.heading} - PicLoreAI`,
        description: `Generate AI photos like this with our optimized prompt. Created with ${photo.modelName}.`,
        images: [photo.imageUrl],
      },
    };
  } catch {
    return {
      title: 'Photo - PicLoreAI',
    };
  }
}

export default function PhotoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
