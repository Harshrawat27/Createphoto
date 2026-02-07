'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Maximize2,
  X,
  ChevronUp,
  ChevronDown,
  Images,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface MobileResultsSheetProps {
  images: GeneratedImage[];
}

export function MobileResultsSheet({ images }: MobileResultsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  // Open sheet when new images arrive
  useEffect(() => {
    if (images.length > 0) {
      setIsOpen(true);
    }
  }, [images]);

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
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

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Button - shown when sheet is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='md:hidden fixed bottom-4 right-4 z-[60] flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg'
        >
          <Images className='w-5 h-5' />
          <span className='font-medium'>{images.length}</span>
        </button>
      )}

      {/* Bottom Sheet */}
      {isOpen && (
        <>
          {/* Overlay - only when expanded */}
          {isExpanded && (
            <div
              className='md:hidden fixed inset-0 bg-black/50 z-[70]'
              onClick={() => setIsExpanded(false)}
            />
          )}

          {/* Sheet */}
          <div
            className={cn(
              'md:hidden fixed left-0 right-0 bg-background border-t border-border z-[80] transition-all duration-300 ease-out rounded-t-2xl shadow-2xl',
              isExpanded ? 'top-16 bottom-0' : 'bottom-0 h-72'
            )}
          >
            {/* Handle Bar */}
            <div
              className='flex justify-center py-3 cursor-pointer'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className='w-10 h-1 bg-muted-foreground/30 rounded-full' />
            </div>

            {/* Header */}
            <div className='flex items-center justify-between px-4 pb-3'>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold text-lg'>Generated Images</h3>
                <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                  {images.length}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className='p-2 rounded-full hover:bg-secondary transition-colors'
                >
                  {isExpanded ? (
                    <ChevronDown className='w-5 h-5' />
                  ) : (
                    <ChevronUp className='w-5 h-5' />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className='p-2 rounded-full hover:bg-secondary transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Images Grid */}
            <div className='px-4 pb-4 overflow-y-auto h-[calc(100%-60px)]'>
              <div
                className={cn(
                  'grid gap-3',
                  isExpanded ? 'grid-cols-2' : 'grid-cols-3'
                )}
              >
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={cn(
                      'relative rounded-xl overflow-hidden bg-secondary/20 border border-border group',
                      isExpanded ? 'aspect-[3/4]' : 'aspect-square'
                    )}
                  >
                    <img
                      src={img.url}
                      alt={img.prompt || 'Generated image'}
                      className='w-full h-full object-cover'
                      onClick={() => setLightboxImage(img)}
                    />

                    {/* Quick Actions */}
                    <div className='absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
                      <div className='flex gap-1 justify-end'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(img.url, img.id);
                          }}
                          className='p-1.5 rounded-full bg-white/20 text-white'
                        >
                          <Download className='w-3.5 h-3.5' />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage(img);
                          }}
                          className='p-1.5 rounded-full bg-white/20 text-white'
                        >
                          <Maximize2 className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className='fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4'
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className='absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white'
          >
            <X className='w-6 h-6' />
          </button>

          <img
            src={lightboxImage.url}
            alt={lightboxImage.prompt || 'Generated image'}
            className='max-w-full max-h-[85vh] object-contain rounded-lg'
            onClick={(e) => e.stopPropagation()}
          />

          {/* Download button in lightbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(lightboxImage.url, lightboxImage.id);
            }}
            className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium'
          >
            <Download className='w-4 h-4' />
            Download
          </button>
        </div>
      )}
    </>
  );
}
