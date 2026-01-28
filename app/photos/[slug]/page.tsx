'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Copy, Check, Sparkles, Loader2, Tag as TagIcon } from 'lucide-react';

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

export default function PhotoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [photo, setPhoto] = useState<PhotoTemplate | null>(null);
  const [relatedPhotos, setRelatedPhotos] = useState<PhotoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPhoto() {
      try {
        const res = await fetch(`/api/photos/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPhoto(data.photo);
          setRelatedPhotos(data.relatedPhotos);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPhoto();
    }
  }, [slug]);

  const copyPrompt = async () => {
    if (!photo) return;
    try {
      await navigator.clipboard.writeText(photo.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className='min-h-screen bg-background flex flex-col'>
        <Navbar />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Photo Not Found</h1>
            <p className='text-muted-foreground mb-6'>
              The photo you're looking for doesn't exist.
            </p>
            <Link
              href='/'
              className='px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90'
            >
              Go Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      <Navbar />

      <main className='flex-1 w-full'>
        {/* Main Content */}
        <section className='py-12 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Main Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
              {/* Image - Left Side */}
              <div className='relative'>
                <div className='relative aspect-[9/16] max-w-[400px] mx-auto rounded-2xl overflow-hidden bg-secondary/30 shadow-2xl'>
                  <Image
                    src={photo.imageUrl}
                    alt={photo.heading}
                    fill
                    className='object-cover'
                    priority
                  />
                </div>
              </div>

              {/* Details - Right Side */}
              <div className='space-y-6'>
                <div>
                  <h1 className='text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4'>
                    {photo.heading}
                  </h1>

                  {/* Model Name */}
                  <p className='text-muted-foreground'>
                    Generated with <span className='text-primary font-medium'>{photo.modelName}</span>
                  </p>
                </div>

                {/* Tags */}
                {photo.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {photo.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className='inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm'
                      >
                        <TagIcon className='w-3 h-3' />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Prompt Section */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-heading font-bold'>Prompt</h2>
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
                    <pre className='bg-secondary/50 border border-border rounded-xl p-4 overflow-x-auto text-sm text-muted-foreground max-h-[400px] overflow-y-auto whitespace-pre-wrap'>
                      <code>{photo.prompt}</code>
                    </pre>
                  </div>

                  <p className='text-sm text-muted-foreground'>
                    Copy this prompt and use it with your trained AI model to generate similar images.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Photos Section */}
        {relatedPhotos.length > 0 && (
          <section className='py-16 bg-secondary/20'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <h2 className='text-2xl font-heading font-bold mb-8'>Related Photos</h2>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {relatedPhotos.map((relatedPhoto) => (
                  <Link
                    key={relatedPhoto.id}
                    href={`/photos/${relatedPhoto.slug}`}
                    className='group'
                  >
                    <div className='relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary/30 shadow-lg transition-transform group-hover:scale-105'>
                      <Image
                        src={relatedPhoto.imageUrl}
                        alt={relatedPhoto.heading}
                        fill
                        className='object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                      <div className='absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <p className='text-white text-sm font-medium line-clamp-2'>
                          {relatedPhoto.heading}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
                  Train a personalized AI model on your face and generate unlimited professional photos using prompts like this.
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
