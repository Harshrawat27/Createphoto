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
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [applyingFilter, setApplyingFilter] = useState(false);

  const aspectRatios = ['1:1', '9:16', '16:9'];
  const resolutions = ['1K', '2K', '4K'];

  // 20 popular photo filters
  const filters = [
    { id: 'none', name: 'Original', css: 'none' },
    { id: 'grayscale', name: 'B&W', css: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(80%)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(90%) brightness(90%)' },
    { id: 'warm', name: 'Warm', css: 'sepia(30%) saturate(120%) brightness(105%)' },
    { id: 'cool', name: 'Cool', css: 'saturate(90%) hue-rotate(20deg) brightness(105%)' },
    { id: 'vivid', name: 'Vivid', css: 'saturate(150%) contrast(110%)' },
    { id: 'dramatic', name: 'Dramatic', css: 'contrast(130%) saturate(110%) brightness(90%)' },
    { id: 'fade', name: 'Fade', css: 'contrast(90%) brightness(110%) saturate(80%)' },
    { id: 'matte', name: 'Matte', css: 'contrast(90%) brightness(105%) saturate(90%)' },
    { id: 'noir', name: 'Noir', css: 'grayscale(100%) contrast(120%) brightness(90%)' },
    { id: 'chrome', name: 'Chrome', css: 'saturate(130%) contrast(120%)' },
    { id: 'mono', name: 'Mono', css: 'grayscale(100%) brightness(110%)' },
    { id: 'tonal', name: 'Tonal', css: 'sepia(20%) saturate(80%) contrast(105%)' },
    { id: 'silvertone', name: 'Silver', css: 'grayscale(50%) brightness(105%) contrast(95%)' },
    { id: 'clarendon', name: 'Clarendon', css: 'contrast(120%) saturate(125%)' },
    { id: 'gingham', name: 'Gingham', css: 'brightness(105%) hue-rotate(350deg)' },
    { id: 'moon', name: 'Moon', css: 'grayscale(100%) contrast(110%) brightness(110%)' },
    { id: 'lark', name: 'Lark', css: 'contrast(90%) saturate(130%) brightness(110%)' },
    { id: 'reyes', name: 'Reyes', css: 'sepia(22%) contrast(85%) brightness(110%) saturate(75%)' },
  ];

  const currentFilter = filters.find((f) => f.id === selectedFilter) || filters[0];

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

  // Apply filter and save as new image
  const applyFilter = async () => {
    if (selectedFilter === 'none' || !generation) return;

    setApplyingFilter(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Use proxy to avoid CORS
      const proxyUrl = `/api/download?url=${encodeURIComponent(editedImage || generation.url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create canvas and apply filter
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = currentFilter.css;
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      const filteredBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1);
      });

      // Upload to server
      const formData = new FormData();
      formData.append('image', filteredBlob, 'filtered-image.png');
      formData.append('folder', 'generated');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload filtered image');
      }

      const uploadData = await uploadRes.json();

      // Save to history
      if (editedImage) {
        setEditHistory((prev) => [...prev, editedImage]);
      } else {
        setEditHistory((prev) => [...prev, generation.url]);
      }

      setEditedImage(uploadData.url);
      setSelectedFilter('none');
      URL.revokeObjectURL(objectUrl);
      toast.success(`${currentFilter.name} filter applied!`);
    } catch (error) {
      console.error('Filter error:', error);
      toast.error('Failed to apply filter');
    } finally {
      setApplyingFilter(false);
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
      <div className='h-[calc(100vh-65px)] flex flex-col md:flex-row overflow-hidden'>
        {/* Left Side: Image Display */}
        <div className='flex-1 bg-secondary/10 p-4 md:p-8 flex flex-col min-h-0'>
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
          <div className='flex-1 flex items-center justify-center py-4 min-h-0'>
            <div className='relative w-full max-w-2xl flex items-center justify-center'>
              {/* Loading Overlay when generating */}
              {generating && (
                <div className='absolute inset-0 z-10 flex items-center justify-center'>
                  <div className='relative w-full max-w-sm aspect-[2/3] rounded-xl overflow-hidden border border-border'>
                    <div className='absolute inset-0 edit-orb-container'>
                      <div className='edit-orb edit-orb-1' />
                      <div className='edit-orb edit-orb-2' />
                      <div className='edit-orb edit-orb-3' />
                      <div className='edit-orb edit-orb-4' />
                      <div className='edit-orb edit-orb-5' />
                      <div className='edit-orb edit-orb-6' />
                      <div className='edit-orb edit-orb-7' />
                      <div className='edit-orb edit-orb-8' />
                      <div className='edit-orb edit-orb-9' />
                      <div className='edit-orb edit-orb-10' />
                    </div>

                    <style jsx>{`
                      .edit-orb-container { background: #0f0f18; }
                      .edit-orb { position: absolute; width: 55%; height: 40%; border-radius: 50%; filter: blur(35px); opacity: 0.9; }
                      .edit-orb-1 { background: radial-gradient(circle, #ff6b6b 0%, #ff6b6b88 50%, transparent 70%); animation: e-orbit-1 4s ease-in-out infinite; }
                      .edit-orb-2 { background: radial-gradient(circle, #ffd93d 0%, #ffd93d88 50%, transparent 70%); animation: e-orbit-2 4.5s ease-in-out infinite; }
                      .edit-orb-3 { background: radial-gradient(circle, #6bcb77 0%, #6bcb7788 50%, transparent 70%); animation: e-orbit-3 3.5s ease-in-out infinite; }
                      .edit-orb-4 { background: radial-gradient(circle, #4d96ff 0%, #4d96ff88 50%, transparent 70%); animation: e-orbit-4 5s ease-in-out infinite; }
                      .edit-orb-5 { background: radial-gradient(circle, #9b5de5 0%, #9b5de588 50%, transparent 70%); animation: e-orbit-5 4.2s ease-in-out infinite; }
                      .edit-orb-6 { background: radial-gradient(circle, #f15bb5 0%, #f15bb588 50%, transparent 70%); animation: e-orbit-6 3.8s ease-in-out infinite; }
                      .edit-orb-7 { background: radial-gradient(circle, #00f5d4 0%, #00f5d488 50%, transparent 70%); animation: e-orbit-7 4.8s ease-in-out infinite; }
                      .edit-orb-8 { background: radial-gradient(circle, #ff9f1c 0%, #ff9f1c88 50%, transparent 70%); animation: e-orbit-8 3.2s ease-in-out infinite; }
                      .edit-orb-9 { background: radial-gradient(circle, #00bbf9 0%, #00bbf988 50%, transparent 70%); animation: e-orbit-9 4.6s ease-in-out infinite; }
                      .edit-orb-10 { background: radial-gradient(circle, #e056fd 0%, #e056fd88 50%, transparent 70%); animation: e-orbit-10 3.6s ease-in-out infinite; }
                      @keyframes e-orbit-1 { 0%, 100% { transform: translate(-20%, -10%); } 50% { transform: translate(60%, 70%); } }
                      @keyframes e-orbit-2 { 0%, 100% { transform: translate(50%, -15%); } 50% { transform: translate(-10%, 65%); } }
                      @keyframes e-orbit-3 { 0%, 100% { transform: translate(70%, 30%); } 50% { transform: translate(-15%, 50%); } }
                      @keyframes e-orbit-4 { 0%, 100% { transform: translate(-10%, 75%); } 50% { transform: translate(55%, -5%); } }
                      @keyframes e-orbit-5 { 0%, 100% { transform: translate(40%, 55%); } 50% { transform: translate(10%, 10%); } }
                      @keyframes e-orbit-6 { 0%, 100% { transform: translate(65%, 80%); } 50% { transform: translate(-5%, 25%); } }
                      @keyframes e-orbit-7 { 0%, 100% { transform: translate(-15%, 45%); } 50% { transform: translate(70%, 60%); } }
                      @keyframes e-orbit-8 { 0%, 100% { transform: translate(55%, 15%); } 50% { transform: translate(5%, 80%); } }
                      @keyframes e-orbit-9 { 0%, 100% { transform: translate(20%, 85%); } 50% { transform: translate(45%, 5%); } }
                      @keyframes e-orbit-10 { 0%, 100% { transform: translate(75%, 50%); } 50% { transform: translate(-10%, 35%); } }
                    `}</style>
                  </div>
                </div>
              )}

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
                      {selectedFilter !== 'none' ? `Preview: ${currentFilter.name}` : 'Edited'}
                    </p>
                    <div className='rounded-xl overflow-hidden border-2 border-primary shadow-xl bg-secondary/20'>
                      <img
                        src={editedImage}
                        alt='Edited'
                        className='w-full h-auto object-contain max-h-[60vh]'
                        style={{ filter: currentFilter.css }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='max-w-sm'>
                  {selectedFilter !== 'none' && (
                    <p className='text-xs text-muted-foreground mb-2 text-center'>
                      Preview: {currentFilter.name}
                    </p>
                  )}
                  <div className={`rounded-xl overflow-hidden shadow-xl bg-secondary/20 ${selectedFilter !== 'none' ? 'border-2 border-primary' : 'border border-border'}`}>
                    <img
                      src={generation.url}
                      alt='Original'
                      className='w-full h-auto object-contain max-h-[60vh]'
                      style={{ filter: currentFilter.css }}
                    />
                  </div>
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
        <div className='w-full md:w-96 md:h-full border-t md:border-t-0 md:border-l border-border bg-card flex flex-col'>
          <div className='flex-1 overflow-y-auto p-6'>
            {/* AI Edit Section */}
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

            {/* Divider */}
            <div className='border-t border-border my-6' />

            {/* Quick Filters Section */}
            <div>
              <h2 className='text-lg font-bold mb-3'>Quick Filters</h2>
              <p className='text-xs text-muted-foreground mb-3'>
                Apply instant filters - no credits needed
              </p>

              {/* Filter Grid */}
              <div className='grid grid-cols-4 gap-2 mb-3'>
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedFilter === filter.id
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <div className='aspect-square bg-secondary/30'>
                      <img
                        src={generation.url}
                        alt={filter.name}
                        className='w-full h-full object-cover'
                        style={{ filter: filter.css }}
                      />
                    </div>
                    <div className='absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5'>
                      <p className='text-[9px] text-white text-center truncate'>
                        {filter.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Apply Filter Button */}
              {selectedFilter !== 'none' && (
                <button
                  onClick={applyFilter}
                  disabled={applyingFilter}
                  className='w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50'
                >
                  {applyingFilter ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Applying Filter...
                    </>
                  ) : (
                    <>
                      Apply {currentFilter.name} Filter
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
