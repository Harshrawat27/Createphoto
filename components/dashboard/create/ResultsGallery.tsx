'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Download,
  Maximize2,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ImageLoadingCard } from './ImageLoadingCard';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface ResultsGalleryProps {
  newImages?: GeneratedImage[];
  isGenerating?: boolean;
  expectedCount?: number;
}

export function ResultsGallery({ newImages = [], isGenerating = false, expectedCount = 0 }: ResultsGalleryProps) {
  const router = useRouter();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const prevNewImagesRef = useRef<GeneratedImage[]>([]);

  useEffect(() => {
    // Only update if newImages actually changed (not just a new array reference)
    if (newImages.length > 0 && newImages !== prevNewImagesRef.current) {
      console.log('New images received:', newImages);
      setGeneratedImages((prev) => [...newImages, ...prev]);
      // Calculate failed count
      if (expectedCount > newImages.length) {
        setFailedCount(expectedCount - newImages.length);
      } else {
        setFailedCount(0);
      }
      prevNewImagesRef.current = newImages;
    }
  }, [newImages, expectedCount]);

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      // Use our API proxy to avoid CORS issues
      const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${imageId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % generatedImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + generatedImages.length) % generatedImages.length
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex]);
  return (
    <div className='p-6 h-full overflow-y-auto custom-scrollbar'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-heading font-bold'>Current Session</h2>
          <p className='text-xs text-muted-foreground mt-1'>
            Images generated in this session
          </p>
        </div>
        {/* <div className='flex gap-2'>
          <button
            onClick={() => setGeneratedImages([])}
            className='text-sm text-muted-foreground hover:text-foreground'
          >
            Clear All
          </button>
        </div> */}
      </div>

      {generatedImages.length === 0 && !isGenerating ? (
        <div className='flex flex-col items-center justify-center min-h-100 text-center'>
          <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4'>
            <Maximize2 className='w-8 h-8 text-muted-foreground' />
          </div>
          <h3 className='font-bold text-lg mb-2'>No Images Yet</h3>
          <p className='text-muted-foreground text-sm mb-1'>
            Generate images to see them here
          </p>
          <p className='text-muted-foreground text-xs'>
            Visit Gallery to see all your previous generations
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {/* Show loading cards while generating */}
          {isGenerating && Array.from({ length: expectedCount }).map((_, index) => (
            <ImageLoadingCard key={`loading-${index}`} status="loading" />
          ))}

          {/* Show failed count message if any images failed */}
          {failedCount > 0 && !isGenerating && (
            <div className='col-span-full mb-2'>
              <p className='text-sm text-amber-500'>
                {failedCount} image{failedCount > 1 ? 's' : ''} failed to generate
              </p>
            </div>
          )}

          {generatedImages.map((img, index) => (
            <div
              key={img.id}
              className='group relative aspect-2/3 rounded-xl overflow-hidden bg-secondary/20 border border-border'
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.prompt || 'Generated image'}
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer'
                  onClick={() => openLightbox(index)}
                  onError={(e) => {
                    console.error('Image failed to load:', img.url);
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x600?text=Image+Failed';
                  }}
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-secondary'>
                  <p className='text-muted-foreground'>No image</p>
                </div>
              )}

              {/* Overlay Actions */}
              <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4'>
                <div className='transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300'>
                  {/* <p className="text-white text-xs line-clamp-2 mb-3 opacity-90">{img.prompt}</p> */}
                  <div className='flex gap-2'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.url, img.id);
                      }}
                      className='p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors'
                      title='Download'
                    >
                      <Download className='w-4 h-4' />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(index);
                      }}
                      className='p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors'
                      title='Expand'
                    >
                      <Maximize2 className='w-4 h-4' />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/edit/${img.id}`);
                      }}
                      className='p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors'
                      title='Edit'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && generatedImages[currentImageIndex] && (
        <div
          className='fixed inset-0 z-9999 bg-black/50 backdrop-blur-md flex items-center justify-center'
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10'
          >
            <X className='w-6 h-6' />
          </button>

          {/* Previous Button */}
          {generatedImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className='absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10'
            >
              <ChevronLeft className='w-6 h-6' />
            </button>
          )}

          {/* Next Button */}
          {generatedImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className='absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10'
            >
              <ChevronRight className='w-6 h-6' />
            </button>
          )}

          {/* Image */}
          <div
            className='max-w-[90vw] max-h-[90vh] relative'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={generatedImages[currentImageIndex].url}
              alt={
                generatedImages[currentImageIndex].prompt || 'Generated image'
              }
              className='max-w-full max-h-[90vh] object-contain rounded-lg'
            />

            {/* Counter */}
            {generatedImages.length > 1 && (
              <div className='absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm'>
                {currentImageIndex + 1} / {generatedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
