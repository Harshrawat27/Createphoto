'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import {
  Upload,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Loader2,
  ImageIcon,
  Copy,
  Sparkles,
  Wand2,
  Save,
  Layers,
} from 'lucide-react';

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
  useImage: boolean;
  tags: Tag[];
  createdAt: string;
}

interface TrainedModel {
  id: string;
  name: string;
  type: string;
  status: string;
  thumbnailUrl: string;
}

interface BulkItem {
  id: string;
  referenceImage: File;
  referencePreview: string;
  heading: string;
  description: string;
  tags: string[];
  modelId: string;
  generatedImageUrl: string | null;
  status: 'pending' | 'analyzing' | 'analyzed' | 'generating' | 'ready' | 'error';
  error?: string;
}

const ADMIN_EMAIL = 'harshrawat.dev@gmail.com';
const MAX_BULK_ITEMS = 20;

export default function AdminPhotosPage() {
  const router = useRouter();
  const session = useSession();
  const [photos, setPhotos] = useState<PhotoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mode toggle: 'single' or 'bulk'
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Bulk upload state
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
  const [savingAll, setSavingAll] = useState(false);

  // Form state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [heading, setHeading] = useState('');
  const [prompt, setPrompt] = useState('');
  const [pseudoPrompt, setPseudoPrompt] = useState('');
  const [modelName, setModelName] = useState('');
  const [useImage, setUseImage] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Tag search state
  const [tagSearch, setTagSearch] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth check
  useEffect(() => {
    if (!session.isPending) {
      if (!session.data?.user || session.data.user.email !== ADMIN_EMAIL) {
        router.replace('/');
      }
    }
  }, [session, router]);

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/photos');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session.data?.user?.email === ADMIN_EMAIL) {
      fetchPhotos();
      fetchTrainedModels();
    }
  }, [session.data?.user?.email, fetchPhotos]);

  // Fetch trained models for bulk upload
  const fetchTrainedModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        // Filter only ready models
        const readyModels = data.filter((m: TrainedModel) => m.status === 'Ready');
        setTrainedModels(readyModels);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  // Debounced tag search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (tagSearch.trim()) {
      setLoadingTags(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/admin/tags?q=${encodeURIComponent(tagSearch)}`);
          if (res.ok) {
            const data = await res.json();
            // Filter out already selected tags
            const filtered = data.filter(
              (tag: Tag) => !selectedTags.some((t) => t.id === tag.id)
            );
            setTagSuggestions(filtered);
          }
        } catch (error) {
          console.error('Error searching tags:', error);
        } finally {
          setLoadingTags(false);
        }
      }, 300);
    } else {
      setTagSuggestions([]);
      setLoadingTags(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [tagSearch, selectedTags]);

  // Handle image from file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  // Shared handler for both browse and paste
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle paste anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            if (mode === 'bulk') {
              handleBulkPaste(file);
            } else {
              handleImageFile(file);
            }
          }
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [mode, bulkItems]);

  // Handle bulk paste - add image to queue
  const handleBulkPaste = (file: File) => {
    if (bulkItems.length >= MAX_BULK_ITEMS) {
      alert(`Maximum ${MAX_BULK_ITEMS} images allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newItem: BulkItem = {
        id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        referenceImage: file,
        referencePreview: reader.result as string,
        heading: '',
        description: '',
        tags: [],
        modelId: trainedModels.length > 0 ? trainedModels[0].id : '',
        generatedImageUrl: null,
        status: 'pending',
      };
      setBulkItems((prev) => [...prev, newItem]);
    };
    reader.readAsDataURL(file);
  };

  // Analyze a bulk item with OpenAI Vision
  const analyzeBulkItem = async (itemId: string) => {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: 'analyzing' } : item
      )
    );

    const item = bulkItems.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const formData = new FormData();
      formData.append('image', item.referenceImage);

      const res = await fetch('/api/admin/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await res.json();
      setBulkItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                heading: data.heading,
                description: data.description,
                tags: data.tags,
                status: 'analyzed',
              }
            : i
        )
      );
    } catch (error: any) {
      setBulkItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, status: 'error', error: error.message }
            : i
        )
      );
    }
  };

  // Generate image for a bulk item
  const generateBulkItem = async (itemId: string) => {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: 'generating' } : item
      )
    );

    const item = bulkItems.find((i) => i.id === itemId);
    if (!item || !item.modelId) {
      alert('Please select a model first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('referenceImage', item.referenceImage);
      formData.append('modelId', item.modelId);
      formData.append('heading', item.heading);
      formData.append('description', item.description);

      const res = await fetch('/api/admin/generate-template', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate');
      }

      const data = await res.json();
      setBulkItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, generatedImageUrl: data.imageUrl, status: 'ready' }
            : i
        )
      );
    } catch (error: any) {
      setBulkItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, status: 'error', error: error.message }
            : i
        )
      );
    }
  };

  // Update bulk item field
  const updateBulkItem = (itemId: string, field: keyof BulkItem, value: any) => {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Remove bulk item
  const removeBulkItem = (itemId: string) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Save all bulk items
  const saveAllBulkItems = async () => {
    const readyItems = bulkItems.filter((item) => item.status === 'ready' && item.generatedImageUrl);
    if (readyItems.length === 0) {
      alert('No items ready to save. Generate images first.');
      return;
    }

    setSavingAll(true);

    for (const item of readyItems) {
      try {
        // Build prompt WITHOUT the 20% change line (for DB storage)
        const dbPrompt = `Generate a photo of the person (shown in the reference images).
Use the pose, clothes, lighting, and background from the last reference image, but KEEP the face and body of the model from first 4 images.
${item.heading}. ${item.description}`;

        // Find or create tags
        const tagIds: string[] = [];
        for (const tagName of item.tags) {
          const res = await fetch('/api/admin/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tagName }),
          });
          if (res.ok) {
            const tag = await res.json();
            tagIds.push(tag.id);
          }
        }

        // Create the photo template
        const formData = new FormData();
        formData.append('heading', item.heading);
        formData.append('prompt', dbPrompt);
        formData.append('pseudoPrompt', '');
        formData.append('modelName', 'Gemini 3 Pro');
        formData.append('useImage', 'true');
        formData.append('tags', JSON.stringify(tagIds));
        formData.append('imageUrl', item.generatedImageUrl!);

        const res = await fetch('/api/admin/photos', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          console.error('Failed to save template:', item.heading);
        }
      } catch (error) {
        console.error('Error saving template:', error);
      }
    }

    setSavingAll(false);
    setBulkItems([]);
    fetchPhotos();
    alert(`Saved ${readyItems.length} templates!`);
  };

  // Add existing tag
  const addTag = (tag: Tag) => {
    setSelectedTags([...selectedTags, tag]);
    setTagSearch('');
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  };

  // Create and add new tag
  const createAndAddTag = async () => {
    if (!tagSearch.trim()) return;

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagSearch.trim() }),
      });

      if (res.ok) {
        const newTag = await res.json();
        if (!selectedTags.some((t) => t.id === newTag.id)) {
          setSelectedTags([...selectedTags, newTag]);
        }
        setTagSearch('');
        setShowTagDropdown(false);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  // Remove tag
  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  // Reset form
  const resetForm = () => {
    setImage(null);
    setImagePreview(null);
    setHeading('');
    setPrompt('');
    setPseudoPrompt('');
    setModelName('');
    setUseImage(false);
    setSelectedTags([]);
    setEditingId(null);
  };

  // Load photo for editing
  const loadForEdit = (photo: PhotoTemplate) => {
    setEditingId(photo.id);
    setHeading(photo.heading);
    setPrompt(photo.prompt);
    setPseudoPrompt(photo.pseudoPrompt || '');
    setModelName(photo.modelName);
    setUseImage(photo.useImage);
    setSelectedTags(photo.tags);
    setImagePreview(photo.imageUrl);
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!heading || !prompt || !modelName || (!image && !editingId)) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      if (image) formData.append('image', image);
      formData.append('heading', heading);
      formData.append('prompt', prompt);
      formData.append('pseudoPrompt', pseudoPrompt);
      formData.append('modelName', modelName);
      formData.append('useImage', String(useImage));
      formData.append('tags', JSON.stringify(selectedTags.map((t) => t.id)));

      const url = editingId ? `/api/admin/photos/${editingId}` : '/api/admin/photos';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        resetForm();
        fetchPhotos();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save photo');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Failed to save photo');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete photo
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const res = await fetch(`/api/admin/photos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPhotos();
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  // Copy slug
  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(`/photos/${slug}`);
  };

  // Show loading while checking auth
  if (session.isPending || loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  // Don't render if not admin (will redirect)
  if (!session.data?.user || session.data.user.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <h1 className='text-3xl font-heading font-bold mb-8'>Photo Templates Admin</h1>

        {/* Mode Toggle */}
        <div className='flex gap-2 mb-6'>
          <button
            type='button'
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'single'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <Upload className='w-4 h-4' />
            Single Upload
          </button>
          <button
            type='button'
            onClick={() => setMode('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'bulk'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <Layers className='w-4 h-4' />
            Bulk Upload
          </button>
        </div>

        {/* Bulk Upload Section */}
        {mode === 'bulk' && (
          <div className='bg-secondary/30 border border-border rounded-xl p-6 mb-12'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-xl font-bold'>Bulk Upload</h2>
                <p className='text-sm text-muted-foreground'>
                  Paste images (up to {MAX_BULK_ITEMS}) to analyze and generate templates
                </p>
              </div>
              {bulkItems.length > 0 && (
                <button
                  type='button'
                  onClick={saveAllBulkItems}
                  disabled={savingAll || bulkItems.filter((i) => i.status === 'ready').length === 0}
                  className='flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {savingAll ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4' />
                  )}
                  Save All ({bulkItems.filter((i) => i.status === 'ready').length})
                </button>
              )}
            </div>

            {/* Paste Zone */}
            {bulkItems.length < MAX_BULK_ITEMS && (
              <div className='border-2 border-dashed border-border rounded-xl p-8 text-center mb-6 bg-secondary/20'>
                <ImageIcon className='w-12 h-12 mx-auto mb-2 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  Paste an image (Ctrl/Cmd + V) to add to queue
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  {bulkItems.length}/{MAX_BULK_ITEMS} images
                </p>
              </div>
            )}

            {/* Bulk Items Table */}
            {bulkItems.length > 0 && (
              <div className='space-y-4'>
                {bulkItems.map((item, index) => (
                  <div
                    key={item.id}
                    className='bg-background border border-border rounded-xl p-4'
                  >
                    <div className='flex gap-4'>
                      {/* Reference Image */}
                      <div className='flex-shrink-0'>
                        <div className='relative w-24 h-32 rounded-lg overflow-hidden'>
                          <Image
                            src={item.referencePreview}
                            alt='Reference'
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        </div>
                        <p className='text-xs text-center text-muted-foreground mt-1'>
                          Reference
                        </p>
                      </div>

                      {/* Generated Image */}
                      <div className='flex-shrink-0'>
                        <div className='relative w-24 h-32 rounded-lg overflow-hidden bg-secondary/30'>
                          {item.generatedImageUrl ? (
                            <Image
                              src={item.generatedImageUrl}
                              alt='Generated'
                              fill
                              className='object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              {item.status === 'generating' ? (
                                <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
                              ) : (
                                <Sparkles className='w-6 h-6 text-muted-foreground' />
                              )}
                            </div>
                          )}
                        </div>
                        <p className='text-xs text-center text-muted-foreground mt-1'>
                          Generated
                        </p>
                      </div>

                      {/* Form Fields */}
                      <div className='flex-1 space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                          {/* Heading */}
                          <input
                            type='text'
                            value={item.heading}
                            onChange={(e) =>
                              updateBulkItem(item.id, 'heading', e.target.value)
                            }
                            placeholder='Heading'
                            className='px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-sm'
                          />

                          {/* Model Selector */}
                          <select
                            value={item.modelId}
                            onChange={(e) =>
                              updateBulkItem(item.id, 'modelId', e.target.value)
                            }
                            className='px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-sm'
                          >
                            <option value=''>Select Model</option>
                            {trainedModels.map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.name} ({model.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Description */}
                        <input
                          type='text'
                          value={item.description}
                          onChange={(e) =>
                            updateBulkItem(item.id, 'description', e.target.value)
                          }
                          placeholder='Description'
                          className='w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-sm'
                        />

                        {/* Tags */}
                        <div className='flex flex-wrap gap-1'>
                          {item.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className='px-2 py-0.5 bg-primary/10 text-primary rounded text-xs'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex flex-col gap-2'>
                        {/* Analyze Button */}
                        <button
                          type='button'
                          onClick={() => analyzeBulkItem(item.id)}
                          disabled={item.status === 'analyzing'}
                          className='flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50'
                        >
                          {item.status === 'analyzing' ? (
                            <Loader2 className='w-3 h-3 animate-spin' />
                          ) : (
                            <Wand2 className='w-3 h-3' />
                          )}
                          Analyze
                        </button>

                        {/* Generate Button */}
                        <button
                          type='button'
                          onClick={() => generateBulkItem(item.id)}
                          disabled={
                            !item.heading ||
                            !item.modelId ||
                            item.status === 'generating'
                          }
                          className='flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50'
                        >
                          {item.status === 'generating' ? (
                            <Loader2 className='w-3 h-3 animate-spin' />
                          ) : (
                            <Sparkles className='w-3 h-3' />
                          )}
                          Generate
                        </button>

                        {/* Delete Button */}
                        <button
                          type='button'
                          onClick={() => removeBulkItem(item.id)}
                          className='flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20'
                        >
                          <Trash2 className='w-3 h-3' />
                          Delete
                        </button>

                        {/* Status Badge */}
                        <div className='text-center'>
                          {item.status === 'ready' && (
                            <span className='text-xs text-green-500 font-medium'>
                              Ready
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className='text-xs text-red-500 font-medium'>
                              Error
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Single Upload Form */}
        {mode === 'single' && (
        <form
          onSubmit={handleSubmit}
          className='bg-secondary/30 border border-border rounded-xl p-6 mb-12'
        >
          <h2 className='text-xl font-bold mb-6'>
            {editingId ? 'Edit Photo Template' : 'Add New Photo Template'}
          </h2>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Image Upload */}
            <div>
              <label className='block text-sm font-medium mb-2'>
                Image {!editingId && <span className='text-red-500'>*</span>}
              </label>
              <div
                className={`relative aspect-[9/16] max-w-[300px] rounded-xl border-2 border-dashed ${
                  imagePreview ? 'border-primary' : 'border-border'
                } bg-secondary/50 flex items-center justify-center cursor-pointer overflow-hidden`}
                onClick={() => document.getElementById('image-input')?.click()}
              >
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt='Preview'
                      fill
                      className='object-cover'
                      unoptimized={imagePreview.startsWith('data:')}
                    />
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className='absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </>
                ) : (
                  <div className='text-center text-muted-foreground'>
                    <ImageIcon className='w-12 h-12 mx-auto mb-2' />
                    <p className='text-sm'>Click to upload or paste</p>
                    <p className='text-xs'>9:16 aspect ratio</p>
                  </div>
                )}
              </div>
              <input
                id='image-input'
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                className='hidden'
              />
            </div>

            {/* Form Fields */}
            <div className='space-y-4'>
              {/* Heading */}
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Heading <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder='Beautiful Woman Taking Sun Bath'
                  className='w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none'
                />
              </div>

              {/* Model Name */}
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Model Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder='Gemini 3 Pro'
                  className='w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none'
                />
              </div>

              {/* Use Image Toggle */}
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>Use Image</label>
                <button
                  type='button'
                  onClick={() => setUseImage(!useImage)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useImage ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useImage ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Tags */}
              <div className='relative'>
                <label className='block text-sm font-medium mb-2'>Tags</label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className='inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm'
                    >
                      {tag.name}
                      <button
                        type='button'
                        onClick={() => removeTag(tag.id)}
                        className='hover:text-primary/70'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </span>
                  ))}
                </div>
                <div className='relative'>
                  <input
                    ref={tagInputRef}
                    type='text'
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    onFocus={() => setShowTagDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                    placeholder='Search or create tags...'
                    className='w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none'
                  />
                  {loadingTags && (
                    <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground' />
                  )}
                </div>

                {/* Tag Dropdown */}
                {showTagDropdown && (tagSuggestions.length > 0 || tagSearch.trim()) && (
                  <div className='absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-auto'>
                    {tagSuggestions.map((tag) => (
                      <button
                        key={tag.id}
                        type='button'
                        onClick={() => addTag(tag)}
                        className='w-full px-4 py-2 text-left hover:bg-secondary/50 text-sm'
                      >
                        {tag.name}
                      </button>
                    ))}
                    {tagSearch.trim() &&
                      !tagSuggestions.some(
                        (t) => t.name.toLowerCase() === tagSearch.toLowerCase()
                      ) && (
                        <button
                          type='button'
                          onClick={createAndAddTag}
                          className='w-full px-4 py-2 text-left hover:bg-secondary/50 text-sm flex items-center gap-2 text-primary'
                        >
                          <Plus className='w-4 h-4' />
                          Create "{tagSearch}"
                        </button>
                      )}
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Prompt <span className='text-red-500'>*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='Enter the full prompt...'
                  rows={8}
                  className='w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none resize-none font-mono text-sm'
                />
              </div>

              {/* Pseudo Prompt */}
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Pseudo Prompt <span className='text-muted-foreground text-xs'>(optional)</span>
                </label>
                <textarea
                  value={pseudoPrompt}
                  onChange={(e) => setPseudoPrompt(e.target.value)}
                  placeholder='Enter a simplified/pseudo prompt for display...'
                  rows={4}
                  className='w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none resize-none font-mono text-sm'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  A simplified version of the prompt shown to users (optional)
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex gap-4 mt-6'>
            <button
              type='submit'
              disabled={submitting}
              className='flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50'
            >
              {submitting ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : editingId ? (
                <Check className='w-4 h-4' />
              ) : (
                <Upload className='w-4 h-4' />
              )}
              {editingId ? 'Update' : 'Upload'}
            </button>
            {editingId && (
              <button
                type='button'
                onClick={resetForm}
                className='px-6 py-2 border border-border rounded-lg font-medium hover:bg-secondary/50'
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        )}

        {/* Photos List */}
        <h2 className='text-xl font-bold mb-6'>
          Existing Photos ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <p className='text-muted-foreground text-center py-12'>No photos yet</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {photos.map((photo) => (
              <div
                key={photo.id}
                className='bg-secondary/30 border border-border rounded-xl overflow-hidden'
              >
                <div className='relative aspect-[9/16]'>
                  <Image
                    src={photo.imageUrl}
                    alt={photo.heading}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='p-4'>
                  <h3 className='font-bold text-lg mb-1 line-clamp-1'>{photo.heading}</h3>
                  <p className='text-sm text-muted-foreground mb-2'>{photo.modelName}</p>

                  {/* Tags */}
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className='px-2 py-0.5 bg-primary/10 text-primary rounded text-xs'
                      >
                        {tag.name}
                      </span>
                    ))}
                    {photo.tags.length > 3 && (
                      <span className='px-2 py-0.5 bg-secondary text-muted-foreground rounded text-xs'>
                        +{photo.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Slug */}
                  <button
                    onClick={() => copySlug(photo.slug)}
                    className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-3'
                  >
                    <Copy className='w-3 h-3' />
                    /photos/{photo.slug}
                  </button>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => loadForEdit(photo)}
                      className='flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20'
                    >
                      <Edit2 className='w-4 h-4' />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className='flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
