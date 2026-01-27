'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ChevronLeft, ChevronRight, Copy, Check, Sparkles } from 'lucide-react';

const images = [
  'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769531618509-generated-1769531618490-3.png',
  'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769531576197-generated-1769531576194-2.png',
  'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769531289459-generated-1769531289440-0.png',
  'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769530878103-generated-1769530878102-0.png',
  'https://pub-dae4dc46f1b149f981bfbd413762b534.r2.dev/generated/1769497440869-generated-1769497440732-0.png',
];

const prompt = `{
  "subject": {
    "description": "An attractive young woman with a fit, sensual athletic body standing in her bedroom, about to leave for the gym while capturing a mirror selfie.",
    "body": {
      "physique": "Curvy athletic hourglass figure with lifted glutes, firm sculpted thighs, and a narrow, feminine waistline.",
      "details": "Smooth waist flowing into rounded hips and prominently lifted glute muscles. Defined inner thighs and softly contoured hamstrings. Flat toned abdomen with gentle core lines. Natural glowing skin with subtle sheen and soft muscle highlights.",
      "face": "Three-quarter face angle visible in the mirror, seductive calm expression, slightly parted glossy lips, relaxed eyelids, confident gaze focused on the phone screen.",
      "hair": "Long dark brown hair tied into a loose high ponytail, soft waves falling along the neck and collarbone, a few strands framing the cheeks."
    },
    "wardrobe": {
      "top": "Tight light grey sports bra with thin straps, stretchy fabric hugging the chest and underbust with slight natural contour.",
      "bottom": "High-waisted black gym shorts with seamless contour stitching tightly shaping hips and glutes, smooth matte fabric with subtle stretch tension.",
      "accessories": "Small gym bag resting on one shoulder, white wireless earbuds hanging loosely around the neck. Smartphone in hand with a clear glossy protective case."
    },
    "pose_action": "Mirror selfie pose with sensual posture; body turned sideways, hips pushed back deliberately to accentuate curves. One knee slightly bent, spine gently arched to highlight waist and glutes. One arm raised holding the phone, the other hand softly resting on the gym bag strap."
  },
  "scene": {
    "location": "Stylish modern bedroom just before heading out to the gym.",
    "background": "Neatly made bed with white linen sheets and warm beige pillows, wooden bedside table with soft glowing lamp, full-length mirror leaning against the wall, sheer curtains filtering morning light. Gym shoes placed casually near the bed.",
    "composition": "Vertical 9:16 framing, medium-full body shot centered on the figure with softly blurred cozy bedroom background."
  },
  "lighting": {
    "type": "Soft warm morning light mixed with gentle indoor ambient glow.",
    "details": "Warm highlights on skin creating a subtle luminous sheen, delicate shadow gradients enhancing curves and muscle tone, intimate cozy atmosphere with no harsh reflections."
  },
  "camera": {
    "technical": "High-end smartphone mirror photography aesthetic, ultra-realistic rendering, 28mm wide-angle lens equivalent.",
    "settings": "Sharp focus on subject and reflection, rich skin tones, natural contrast, zero motion blur, high texture realism."
  },
  "constraints": {
    "negative_prompts": [
      "no logos",
      "no text",
      "no watermark",
      "no exaggerated anatomy",
      "no extra fingers",
      "no distorted proportions",
      "no plastic skin",
      "no low resolution"
    ],
    "rules": [
      "perfect mirror reflection alignment",
      "accurate human anatomy and muscle structure",
      "natural sensual proportions",
      "realistic fabric stretch and body contact points"
    ]
  }
}`;

export default function GymInfluencerPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      <Navbar />

      <main className='flex-1 w-full'>
        {/* Hero Section */}
        <section className='py-12 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-12'>
              <h1 className='text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4'>
                Gym Influencer AI Photos
              </h1>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                Create stunning gym and fitness influencer photos with AI. Use this prompt template to generate professional-quality fitness content.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
              {/* Image Slider - Left Side */}
              <div className='relative'>
                <div className='relative aspect-[9/16] max-w-[400px] mx-auto rounded-2xl overflow-hidden bg-secondary/30 shadow-2xl'>
                  <Image
                    src={images[currentIndex]}
                    alt={`Gym influencer example ${currentIndex + 1}`}
                    fill
                    className='object-cover'
                    priority
                  />

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className='absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-foreground shadow-lg transition-all hover:scale-110'
                    aria-label='Previous image'
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  <button
                    onClick={nextImage}
                    className='absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-foreground shadow-lg transition-all hover:scale-110'
                    aria-label='Next image'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>

                  {/* Dots Indicator */}
                  <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-primary w-6'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Image Counter */}
                <p className='text-center text-muted-foreground text-sm mt-4'>
                  {currentIndex + 1} / {images.length}
                </p>
              </div>

              {/* Prompt Section - Right Side */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-heading font-bold'>Prompt Template</h2>
                  <button
                    onClick={copyPrompt}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      copied
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className='w-4 h-4' />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className='w-4 h-4' />
                        Copy Prompt
                      </>
                    )}
                  </button>
                </div>

                <div className='relative'>
                  <pre className='bg-secondary/50 border border-border rounded-xl p-4 overflow-x-auto text-sm text-muted-foreground max-h-[600px] overflow-y-auto'>
                    <code>{prompt}</code>
                  </pre>
                </div>

                <p className='text-sm text-muted-foreground'>
                  This structured JSON prompt is optimized for AI image generation. Copy and customize it for your own fitness content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-24'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-20 text-center overflow-hidden shadow-2xl'>
              {/* Decorative patterns */}
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
              <div className='absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl' />
              <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl' />

              <div className='relative z-10 space-y-8'>
                <h2 className='text-3xl md:text-5xl font-heading font-bold text-white tracking-tight'>
                  Create Your Own AI Influencer
                </h2>
                <p className='text-white/80 text-lg md:text-xl max-w-2xl mx-auto'>
                  Train a personalized AI model on your face and generate unlimited professional fitness photos in any style.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                  <Link
                    href='/dashboard'
                    className='w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-bold transition-colors shadow-xl'
                  >
                    <Sparkles className='w-5 h-5' />
                    Start Creating Free
                  </Link>
                </div>
                <p className='text-white/60 text-sm'>
                  No credit card required. Generate your first photos in minutes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
