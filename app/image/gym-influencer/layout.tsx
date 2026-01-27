import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gym Influencer AI Photos - Fitness Content Generator | PicLoreAI',
  description:
    'Create stunning gym and fitness influencer photos with AI. Use our optimized prompt template to generate professional-quality fitness content for social media.',
  keywords: [
    'gym influencer photos',
    'AI fitness photos',
    'fitness content generator',
    'gym selfie AI',
    'workout photos AI',
    'fitness influencer content',
    'AI generated gym photos',
  ],
  openGraph: {
    title: 'Gym Influencer AI Photos - PicLoreAI',
    description:
      'Create stunning gym and fitness influencer photos with AI. Professional-quality fitness content in minutes.',
    images: [
      'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769531618509-generated-1769531618490-3.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gym Influencer AI Photos - PicLoreAI',
    description:
      'Create stunning gym and fitness influencer photos with AI. Professional-quality fitness content in minutes.',
    images: [
      'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769531618509-generated-1769531618490-3.png',
    ],
  },
};

export default function GymInfluencerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
