'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Maximize2,
  Trash2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/generations');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched generations:', data);
        setGeneratedImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl);
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

  const openDeleteDialog = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    setDeleting(imageToDelete);
    setDeleteDialogOpen(false);

    try {
      const response = await fetch(`/api/generations/${imageToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGeneratedImages((prev) =>
          prev.filter((img) => img.id !== imageToDelete)
        );
        // Close lightbox if deleted image was open
        if (
          lightboxOpen &&
          generatedImages[currentImageIndex]?.id === imageToDelete
        ) {
          setLightboxOpen(false);
        }
        toast.success('Image deleted successfully');
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeleting(null);
      setImageToDelete(null);
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
    <div className='h-full p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-heading font-bold mb-2'>Gallery</h1>
            <p className='text-muted-foreground'>
              All your generated images in one place
            </p>
          </div>
          <div className='flex gap-2'>
            <button className='px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors'>
              Clear All
            </button>
          </div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center min-h-100'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        ) : generatedImages.length === 0 ? (
          <div className='flex flex-col items-center justify-center min-h-100 text-center'>
            <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4'>
              <Maximize2 className='w-8 h-8 text-muted-foreground' />
            </div>
            <h3 className='font-bold text-lg mb-2'>No Generations Yet</h3>
            <p className='text-muted-foreground text-sm'>
              Create your first image to see it here
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
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
                          openDeleteDialog(img.id);
                        }}
                        disabled={deleting === img.id}
                        className='p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-500 backdrop-blur-sm transition-colors ml-auto disabled:opacity-50'
                        title='Delete'
                      >
                        {deleting === img.id ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <Trash2 className='w-4 h-4' />
                        )}
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
            className='fixed inset-0 z-9999 bg-black/90 backdrop-blur-md flex items-center justify-center'
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

              {/* Image Info & Actions */}
              <div className='absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4'>
                <p className='text-white text-sm mb-3 line-clamp-2'>
                  {generatedImages[currentImageIndex].prompt}
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={() =>
                      handleDownload(
                        generatedImages[currentImageIndex].url,
                        generatedImages[currentImageIndex].id
                      )
                    }
                    className='px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2'
                  >
                    <Download className='w-4 h-4' />
                    Download
                  </button>
                  <button
                    onClick={() =>
                      openDeleteDialog(generatedImages[currentImageIndex].id)
                    }
                    disabled={
                      deleting === generatedImages[currentImageIndex].id
                    }
                    className='px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors flex items-center gap-2 ml-auto disabled:opacity-50'
                  >
                    {deleting === generatedImages[currentImageIndex].id ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className='w-4 h-4' />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Counter */}
              {generatedImages.length > 1 && (
                <div className='absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm'>
                  {currentImageIndex + 1} / {generatedImages.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Image</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this image? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className='px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary/50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </div>
  );
}
