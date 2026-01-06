'use client';

import { useState, useEffect } from 'react';
import { Upload, ImageIcon, Wand2, RefreshCw, X, Loader2 } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Model {
  id: string;
  name: string;
  status: string;
}

interface CreationControlsProps {
  onGenerate?: (images: any[]) => void;
}

export function CreationControls({ onGenerate }: CreationControlsProps) {
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [resolution, setResolution] = useState('1K');
  const [imageCount, setImageCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        // Only show ready models
        const readyModels = data.filter((m: Model) => m.status === 'Ready');
        setModels(readyModels);
        if (readyModels.length > 0) {
          setSelectedModel(readyModels[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedImageFile(file);
    }
  };

  const toggleReferenceOption = (option: string) => {
    setReferenceOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleGenerate = async () => {
    // Prompt is optional if reference image with options is provided
    const hasReferenceWithOptions =
      selectedImageFile && referenceOptions.length > 0;

    if (!prompt.trim() && !hasReferenceWithOptions) {
      setError(
        'Please enter a prompt or upload a reference image with options'
      );
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('modelId', selectedModel || '');
      formData.append('aspectRatio', aspectRatio);
      formData.append('resolution', resolution);
      formData.append('imageCount', imageCount.toString());

      // Add reference image if uploaded
      if (selectedImageFile) {
        formData.append('referenceImage', selectedImageFile);
        formData.append('referenceOptions', JSON.stringify(referenceOptions));
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.images) {
        console.log('Generated images:', data.images);
        onGenerate?.(data.images);
      } else {
        console.error('No images in response:', data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate images');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='flex flex-col gap-8 p-6 h-full overflow-y-auto custom-scrollbar'>
      {/* Model Selection */}
      <Field>
        <FieldLabel htmlFor='select-model'>Select Model</FieldLabel>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className='bg-background' id='select-model'>
            <SelectValue
              placeholder={
                models.length === 0 ? 'No models available' : 'Select a model'
              }
            />
          </SelectTrigger>
          <SelectContent className='bg-background'>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Error Message */}
      {error && (
        <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400'>
          {error}
        </div>
      )}

      {/* Prompt Input */}
      <div className='space-y-3'>
        <div className='flex justify-between'>
          <label className='text-sm font-medium'>
            Prompt{' '}
            {selectedImageFile && referenceOptions.length > 0 && (
              <span className='text-muted-foreground font-normal'>
                (Optional)
              </span>
            )}
          </label>
          <span className='text-xs text-muted-foreground'>
            Try "wearing a suit"
          </span>
        </div>
        <textarea
          className='flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
          placeholder={
            selectedImageFile && referenceOptions.length > 0
              ? 'Add additional details (optional)...'
              : 'Describe the image you want to generate...'
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Reference Image Upload */}
      <div className='space-y-3'>
        <label className='text-sm font-medium'>
          Reference Image (Optional)
        </label>
        <p className='text-xs text-muted-foreground mb-2'>
          Upload an image to copy a pose or style.
        </p>

        {!selectedImage ? (
          <div className='flex items-center justify-center w-full'>
            <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 border-border hover:border-primary transition-colors'>
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <Upload className='w-8 h-8 mb-2 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  Click to upload or drag & drop
                </p>
              </div>
              <input
                type='file'
                className='hidden'
                accept='image/*'
                onChange={handleImageUpload}
              />
            </label>
          </div>
        ) : (
          <div className='relative w-full h-48 rounded-lg overflow-hidden border border-border group'>
            <img
              src={selectedImage}
              alt='Reference'
              className='w-full h-full object-cover'
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setSelectedImageFile(null);
                setReferenceOptions([]);
              }}
              className='absolute top-2 right-2 p-1.5 bg-background/80 text-foreground rounded-full hover:bg-red-500 hover:text-white transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Reference Image Options */}
        {selectedImage && (
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              What to take from reference?
            </label>
            <p className='text-xs text-muted-foreground'>
              Select what aspects to copy (face will always be from your model)
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {['pose', 'clothes', 'lighting', 'background'].map((option) => (
                <button
                  key={option}
                  onClick={() => toggleReferenceOption(option)}
                  className={`px-3 py-2 text-sm border rounded-md capitalize transition-colors ${
                    referenceOptions.includes(option)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'hover:bg-secondary/50 border-border'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Aspect Ratio</label>
          <div className='flex gap-2'>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`flex-1 py-2 text-xs border rounded-md ${
                aspectRatio === '1:1'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              1:1
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 py-2 text-xs border rounded-md ${
                aspectRatio === '9:16'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              9:16
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`flex-1 py-2 text-xs border rounded-md ${
                aspectRatio === '16:9'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              16:9
            </button>
          </div>
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Resolution</label>
          <div className='flex gap-2'>
            <button
              onClick={() => setResolution('2K')}
              className={`flex-1 py-2 text-xs border rounded-md ${
                resolution === '2K'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              2K
            </button>
            <button
              onClick={() => setResolution('4K')}
              className={`flex-1 py-2 text-xs border rounded-md ${
                resolution === '4K'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              4K
            </button>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor='image-count'>Image Count</FieldLabel>
          <Select
            value={imageCount.toString()}
            onValueChange={(value) => setImageCount(Number(value))}
          >
            <SelectTrigger className='bg-background' id='image-count'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background'>
              <SelectItem value='1'>1 Image</SelectItem>
              <SelectItem value='2'>2 Images</SelectItem>
              <SelectItem value='4'>4 Images</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={
          isGenerating ||
          (!prompt.trim() &&
            !(selectedImageFile && referenceOptions.length > 0))
        }
        className='w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isGenerating ? (
          <>
            <Loader2 className='w-5 h-5 animate-spin' />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className='w-5 h-5' />
            Generate Images
          </>
        )}
      </button>
    </div>
  );
}
