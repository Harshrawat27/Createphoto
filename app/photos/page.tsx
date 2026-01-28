'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Loader2, Sparkles } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface PhotoTemplate {
  id: string;
  heading: string;
  slug: string;
  imageUrl: string;
  prompt: string;
  pseudoPrompt: string | null;
  modelName: string;
  tags: Tag[];
  createdAt: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch('/api/photos');
        if (res.ok) {
          const data = await res.json();
          setPhotos(data);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      <Navbar />

      <main className='flex-1 w-full'>
        {/* Hero Section */}
        <section className='py-12 md:py-16'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-12'>
              <h1 className='text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4'>
                AI Photo Templates
              </h1>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                Browse our collection of AI-generated photo templates. Use these prompts with your trained model to create stunning images.
              </p>
            </div>

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className='text-center py-20'>
                <p className='text-muted-foreground text-lg'>No photos yet. Check back soon!</p>
              </div>
            ) : (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
                {photos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/photos/${photo.slug}`}
                    className='group block'
                  >
                    <div className='relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary/30 shadow-lg'>
                      <Image
                        src={photo.imageUrl}
                        alt={photo.heading}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                      />

                      {/* Hover Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <div className='absolute bottom-0 left-0 right-0 p-4'>
                          {/* Prompt Preview */}
                          <p className='text-white/80 text-xs mb-3 line-clamp-2'>
                            {photo.prompt}
                          </p>

                          {/* Use Template Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // Will implement later
                            }}
                            className='w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                          >
                            <Sparkles className='w-4 h-4' />
                            Use this template
                          </button>
                        </div>
                      </div>

                      {/* Always visible title at bottom */}
                      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-0 transition-opacity duration-300'>
                        <h3 className='text-white text-sm font-medium line-clamp-2'>
                          {photo.heading}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
                  Create Your Own AI Photos
                </h2>
                <p className='text-white/80 text-lg md:text-xl max-w-2xl mx-auto'>
                  Train a personalized AI model on your face and use any of these templates to generate stunning photos.
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
