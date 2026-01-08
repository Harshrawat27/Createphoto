import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: ['400'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'PicLoreAI - AI Photo Model Generator',
  description:
    'Upload your selfies, create personalized AI models, and generate stunning photos with AI',
  openGraph: {
    title: 'PicLoreAI - AI Photo Model Generator',
    description:
      'Upload your selfies, create personalized AI models, and generate stunning photos with AI',
    images: ['/og-image-picloreai.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PicLoreAI - AI Photo Model Generator',
    description:
      'Upload your selfies, create personalized AI models, and generate stunning photos with AI',
    images: ['/og-image-picloreai.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme='dark'
          attribute='class'
          enableSystem={false}
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
