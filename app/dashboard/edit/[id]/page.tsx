'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Download,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

interface Generation {
  id: string;
  url: string;
  prompt: string;
  modelName?: string;
  createdAt: string;
}

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [editPrompt, setEditPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [resolution, setResolution] = useState('1K');

  const aspectRatios = ['1:1', '9:16', '16:9'];
  const resolutions = ['1K', '2K', '4K'];

  // Fetch the original generation
  useEffect(() => {
    const fetchGeneration = async () => {
      try {
        const res = await fetch(`/api/generations/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch image');
        }
        const data = await res.json();
        setGeneration(data);
      } catch (error) {
        console.error('Error fetching generation:', error);
        toast.error('Failed to load image');
        router.push('/dashboard/gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchGeneration();
  }, [id, router]);

  // Handle edit generation
  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      toast.error('Please enter an edit prompt');
      return;
    }

    if (!generation) return;

    setGenerating(true);

    try {
      // Use the current image (edited or original) as reference
      const currentImageUrl = editedImage || generation.url;

      const formData = new FormData();
      formData.append('prompt', editPrompt);
      formData.append('referenceImageUrl', currentImageUrl);
      formData.append('aiModelId', 'gemini-3-pro');
      formData.append('aspectRatio', aspectRatio);
      formData.append('resolution', resolution);
      formData.append('imageCount', '1');

      const res = await fetch('/api/generate/edit', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate edit');
      }

      const data = await res.json();
      if (data.images && data.images.length > 0) {
        // Save current image to history before replacing
        if (editedImage) {
          setEditHistory((prev) => [...prev, editedImage]);
        } else {
          setEditHistory((prev) => [...prev, generation.url]);
        }
        setEditedImage(data.images[0].url);
        setEditPrompt('');
        toast.success('Edit applied successfully!');
      }
    } catch (error: any) {
      console.error('Edit error:', error);
      toast.error(error.message || 'Failed to apply edit');
    } finally {
      setGenerating(false);
    }
  };

  // Undo last edit
  const handleUndo = () => {
    if (editHistory.length > 0) {
      const previousImage = editHistory[editHistory.length - 1];
      setEditedImage(previousImage === generation?.url ? null : previousImage);
      setEditHistory((prev) => prev.slice(0, -1));
    }
  };

  // Download image
  const handleDownload = async (imageUrl: string) => {
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
      a.download = `edited-${id}-${Date.now()}.png`;
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

  if (loading) {
    return (
      <div className='min-h-[calc(100vh-65px)] flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!generation) {
    return null;
  }

  const currentImage = editedImage || generation.url;

  return (
    <>
      <div className='min-h-[calc(100vh-65px)] flex flex-col md:flex-row'>
        {/* Left Side: Image Display */}
        <div className='flex-1 bg-secondary/10 p-4 md:p-8 flex flex-col'>
          {/* Header */}
          <div className='flex items-center gap-4 mb-6'>
            <button
              onClick={() => router.back()}
              className='p-2 rounded-lg hover:bg-secondary transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <h1 className='text-xl md:text-2xl font-heading font-bold'>
              Edit Image
            </h1>
          </div>

          {/* Image Container */}
          <div className='flex-1 flex items-center justify-center overflow-auto py-4'>
            <div className='relative w-full max-w-2xl flex items-center justify-center'>
              {/* Show comparison if edited */}
              {editedImage ? (
                <div className='flex gap-4 items-center justify-center'>
                  {/* Original (small) */}
                  <div className='hidden md:block w-32 flex-shrink-0'>
                    <p className='text-xs text-muted-foreground mb-2 text-center'>
                      Original
                    </p>
                    <div className='rounded-lg overflow-hidden border border-border bg-secondary/20'>
                      <img
                        src={generation.url}
                        alt='Original'
                        className='w-full h-auto object-contain max-h-48'
                      />
                    </div>
                  </div>

                  <ChevronRight className='hidden md:block w-6 h-6 text-muted-foreground flex-shrink-0' />

                  {/* Current/Edited */}
                  <div className='flex-1 max-w-sm'>
                    <p className='text-xs text-muted-foreground mb-2 text-center'>
                      Edited
                    </p>
                    <div className='rounded-xl overflow-hidden border-2 border-primary shadow-xl bg-secondary/20'>
                      <img
                        src={editedImage}
                        alt='Edited'
                        className='w-full h-auto object-contain max-h-[60vh]'
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='rounded-xl overflow-hidden border border-border shadow-xl bg-secondary/20 max-w-sm'>
                  <img
                    src={generation.url}
                    alt='Original'
                    className='w-full h-auto object-contain max-h-[60vh]'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Image Actions */}
          <div className='flex justify-center gap-3 mt-6'>
            {editHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm'
              >
                <RotateCcw className='w-4 h-4' />
                Undo
              </button>
            )}
            <button
              onClick={() => handleDownload(currentImage)}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm'
            >
              <Download className='w-4 h-4' />
              Download
            </button>
          </div>
        </div>

        {/* Right Side: Edit Controls */}
        <div className='w-full md:w-96 border-t md:border-t-0 md:border-l border-border bg-card p-6'>
          <h2 className='text-lg font-bold mb-4'>Edit with AI</h2>

          <div className='space-y-4'>
            {/* Edit Prompt */}
            <div>
              <label className='block text-sm font-medium mb-2'>
                What would you like to change?
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder='e.g., "Change the background to a beach sunset" or "Add sunglasses" or "Make the lighting warmer"'
                rows={4}
                className='w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none text-sm'
                disabled={generating}
              />
            </div>

            {/* Quick Edit Suggestions */}
            <div>
              <p className='text-xs text-muted-foreground mb-2'>
                Quick suggestions:
              </p>
              <div className='flex flex-wrap gap-2'>
                {[
                  'Change background',
                  'Improve lighting',
                  'Add smile',
                  'Change outfit color',
                  'Make it warmer',
                  'Add blur to background',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setEditPrompt(suggestion)}
                    className='px-3 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors'
                    disabled={generating}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Settings */}
            <div className='grid grid-cols-2 gap-4 pt-2'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Aspect Ratio
                </label>
                <div className='flex gap-2'>
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      disabled={generating}
                      className={`flex-1 py-2 text-xs border rounded-lg transition-colors ${
                        aspectRatio === ratio
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Resolution
                </label>
                <div className='flex gap-2'>
                  {resolutions.map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      disabled={generating}
                      className={`flex-1 py-2 text-xs border rounded-lg transition-colors ${
                        resolution === res
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleEdit}
              disabled={generating || !editPrompt.trim()}
              className='w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {generating ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Applying Edit...
                </>
              ) : (
                <>
                  <Sparkles className='w-5 h-5' />
                  Apply Edit
                </>
              )}
            </button>

            {/* Info */}
            <p className='text-xs text-muted-foreground text-center'>
              Each edit uses credits from your account
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
