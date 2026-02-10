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
  CheckSquare,
  Square,
  XCircle,
  Archive,
  Pencil,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import JSZip from 'jszip';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async (skip = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/generations?skip=${skip}&take=30`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched generations:', data);

        if (append) {
          setGeneratedImages((prev) => [...prev, ...data.images]);
        } else {
          setGeneratedImages(data.images);
        }

        setHasMore(data.pagination.hasMore);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchGenerations(generatedImages.length, true);
    }
  };

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

  const handleDownloadSelected = async () => {
    if (selectedImages.size === 0) {
      toast.error('No images selected');
      return;
    }

    setDownloadingZip(true);
    const zip = new JSZip();
    const folder = zip.folder('picloreai-images');

    try {
      const selectedImagesList = generatedImages.filter((img) =>
        selectedImages.has(img.id)
      );

      // Download all images and add to zip
      const downloadPromises = selectedImagesList.map(async (img, index) => {
        try {
          const proxyUrl = `/api/download?url=${encodeURIComponent(img.url)}`;
          const response = await fetch(proxyUrl);

          if (!response.ok) {
            throw new Error(`Failed to download image ${img.id}`);
          }

          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          // Create filename with index for ordering
          const filename = `image-${String(index + 1).padStart(3, '0')}-${img.id.slice(0, 8)}.png`;
          folder?.file(filename, arrayBuffer);

          return { success: true, id: img.id };
        } catch (error) {
          console.error(`Failed to download image ${img.id}:`, error);
          return { success: false, id: img.id };
        }
      });

      const results = await Promise.all(downloadPromises);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount === 0) {
        toast.error('Failed to download any images');
        setDownloadingZip(false);
        return;
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `picloreai-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (failCount > 0) {
        toast.success(
          `Downloaded ${successCount} images. ${failCount} failed.`
        );
      } else {
        toast.success(`Downloaded ${successCount} images successfully`);
      }

      // Exit selection mode after download
      setSelectionMode(false);
      setSelectedImages(new Set());
    } catch (error) {
      console.error('Failed to create zip:', error);
      toast.error('Failed to create zip file');
    } finally {
      setDownloadingZip(false);
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllImages = () => {
    setSelectedImages(new Set(generatedImages.map((img) => img.id)));
  };

  const deselectAllImages = () => {
    setSelectedImages(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedImages(new Set());
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
        // Remove from selection if selected
        setSelectedImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageToDelete);
          return newSet;
        });
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
    if (selectionMode) return; // Don't open lightbox in selection mode
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
              {totalCount > 0
                ? `${totalCount} generated image${totalCount !== 1 ? 's' : ''}`
                : 'All your generated images in one place'}
            </p>
          </div>

          {/* Selection Mode Controls */}
          {generatedImages.length > 0 && (
            <div className='flex gap-2'>
              {selectionMode ? (
                <>
                  <button
                    onClick={exitSelectionMode}
                    className='px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-2'
                  >
                    <XCircle className='w-4 h-4' />
                    Cancel
                  </button>
                  {selectedImages.size < generatedImages.length ? (
                    <button
                      onClick={selectAllImages}
                      className='px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-2'
                    >
                      <CheckSquare className='w-4 h-4' />
                      Select All
                    </button>
                  ) : (
                    <button
                      onClick={deselectAllImages}
                      className='px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-2'
                    >
                      <Square className='w-4 h-4' />
                      Deselect All
                    </button>
                  )}
                  <button
                    onClick={handleDownloadSelected}
                    disabled={selectedImages.size === 0 || downloadingZip}
                    className='px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {downloadingZip ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Creating ZIP...
                      </>
                    ) : (
                      <>
                        <Archive className='w-4 h-4' />
                        Download {selectedImages.size > 0 && `(${selectedImages.size})`}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectionMode(true)}
                  className='px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-2'
                >
                  <CheckSquare className='w-4 h-4' />
                  Select Multiple
                </button>
              )}
            </div>
          )}
        </div>

        {/* Selection Mode Banner */}
        {selectionMode && (
          <div className='mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between'>
            <p className='text-sm'>
              <span className='font-medium'>{selectedImages.size}</span> of{' '}
              <span className='font-medium'>{generatedImages.length}</span> images
              selected. Click on images to select/deselect.
            </p>
          </div>
        )}

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
          <>
          <div className='columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 mb-8'>
            {generatedImages.map((img, index) => (
              <div
                key={img.id}
                className={`group relative break-inside-avoid mb-4 rounded-xl overflow-hidden bg-secondary/20 border transition-all ${
                  selectionMode && selectedImages.has(img.id)
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-border'
                }`}
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.prompt || 'Generated image'}
                    className={`w-full h-auto block transition-transform duration-500 cursor-pointer ${
                      selectionMode ? '' : 'group-hover:scale-105'
                    }`}
                    onClick={() =>
                      selectionMode
                        ? toggleImageSelection(img.id)
                        : openLightbox(index)
                    }
                    onError={(e) => {
                      console.error('Image failed to load:', img.url);
                      e.currentTarget.src =
                        'https://via.placeholder.com/400x600?text=Image+Failed';
                    }}
                  />
                ) : (
                  <div className='w-full aspect-2/3 flex items-center justify-center bg-secondary'>
                    <p className='text-muted-foreground'>No image</p>
                  </div>
                )}

                {/* Selection Checkbox */}
                {selectionMode && (
                  <button
                    onClick={() => toggleImageSelection(img.id)}
                    className='absolute top-3 left-3 z-10'
                  >
                    {selectedImages.has(img.id) ? (
                      <div className='w-6 h-6 rounded bg-primary flex items-center justify-center'>
                        <CheckSquare className='w-5 h-5 text-primary-foreground' />
                      </div>
                    ) : (
                      <div className='w-6 h-6 rounded border-2 border-white bg-black/30 backdrop-blur-sm' />
                    )}
                  </button>
                )}

                {/* Overlay Actions - Hide in selection mode */}
                {!selectionMode && (
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
                            router.push(`/dashboard/edit/${img.id}`);
                          }}
                          className='p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors'
                          title='Edit'
                        >
                          <Pencil className='w-4 h-4' />
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
                )}
              </div>
            ))}
          </div>

          {/* Load More / Pagination Info */}
          <div className='flex flex-col items-center gap-4 py-8'>
            <p className='text-sm text-muted-foreground'>
              Showing {generatedImages.length} of {totalCount} images
            </p>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className='px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50'
              >
                {loadingMore ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            )}
            {!hasMore && generatedImages.length > 0 && (
              <p className='text-sm text-muted-foreground'>
                You've seen all your images
              </p>
            )}
          </div>
          </>
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

              {/* Image Actions */}
              <div className='absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4'>
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
                      router.push(`/dashboard/edit/${generatedImages[currentImageIndex].id}`)
                    }
                    className='px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2'
                  >
                    <Pencil className='w-4 h-4' />
                    Edit
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
