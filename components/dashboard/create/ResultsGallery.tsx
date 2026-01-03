'use client';

import { useState, useEffect } from 'react';
import { Download, Maximize2, MoreHorizontal } from 'lucide-react';

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

  useEffect(() => {
    if (newImages.length > 0) {
      console.log('New images received:', newImages);
      setGeneratedImages((prev) => [...newImages, ...prev]);
    }
  }, [newImages]);
  return (
    <div className='p-6 h-full overflow-y-auto custom-scrollbar'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-heading font-bold'>Current Session</h2>
          <p className='text-xs text-muted-foreground mt-1'>
            Images generated in this session
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setGeneratedImages([])}
            className='text-sm text-muted-foreground hover:text-foreground'
          >
            Clear All
          </button>
        </div>
      </div>

      {generatedImages.length === 0 ? (
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
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
          {generatedImages.map((img) => (
            <div
              key={img.id}
              className='group relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary/20 border border-border'
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.prompt || 'Generated image'}
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
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
    </div>
  );
}
