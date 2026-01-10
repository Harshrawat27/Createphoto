'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Maximize2,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface ResultsGalleryProps {
  newImages?: GeneratedImage[];
}

export function ResultsGallery({ newImages = [] }: ResultsGalleryProps) {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (newImages.length > 0) {
      console.log('New images received:', newImages);
      setGeneratedImages((prev) => [...newImages, ...prev]);
    }
  }, [newImages]);

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

      {generatedImages.length === 0 ? (
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
                      className='p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors ml-auto'
                      title='More'
                    >
                      <MoreHorizontal className='w-4 h-4' />
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
