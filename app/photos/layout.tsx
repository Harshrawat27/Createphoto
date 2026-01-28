import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Photo Templates - Browse & Use Prompts | PicLoreAI',
  description:
    'Browse our collection of AI-generated photo templates. Use these optimized prompts with your trained model to create stunning professional photos.',
  keywords: [
    'AI photo templates',
    'AI image prompts',
    'photo generation prompts',
    'AI photography',
    'professional AI photos',
    'AI headshots',
    'AI portraits',
  ],
  openGraph: {
    title: 'AI Photo Templates - PicLoreAI',
    description:
      'Browse our collection of AI-generated photo templates. Use these prompts to create stunning photos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Photo Templates - PicLoreAI',
    description:
      'Browse our collection of AI-generated photo templates. Use these prompts to create stunning photos.',
  },
};

export default function PhotosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
