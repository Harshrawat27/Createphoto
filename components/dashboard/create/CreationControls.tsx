'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Upload,
  ImageIcon,
  Wand2,
  RefreshCw,
  X,
  Loader2,
  FileImage,
} from 'lucide-react';
import { toast } from 'sonner';
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

interface AIModel {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  creditCost: number;
  isActive: boolean;
  capabilities: {
    aspectRatios: string[];
    resolutions: string[];
    features: {
      supportsReferenceImage: boolean;
      supportsModelTraining: boolean;
      maxImageCount: number;
    };
  };
  apiPath: string;
}

interface Template {
  id: string;
  heading: string;
  slug: string;
  imageUrl: string;
  useImage: boolean;
}

interface CreationControlsProps {
  onGenerate?: (images: any[]) => void;
}

export function CreationControls({ onGenerate }: CreationControlsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateSlug = searchParams.get('template');

  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('none');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>('');
  const [userCredits, setUserCredits] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('');
  const [resolution, setResolution] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState<Template | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Get current AI model's capabilities
  const currentAiModel = aiModels.find((m) => m.id === selectedAiModel);
  const availableAspectRatios = currentAiModel?.capabilities.aspectRatios || [];
  const availableResolutions = currentAiModel?.capabilities.resolutions || [];
  const maxImageCount =
    currentAiModel?.capabilities.features.maxImageCount || 4;

  useEffect(() => {
    fetchModels();
    fetchAIModels();
  }, []);

  // Fetch template if templateSlug is in URL
  useEffect(() => {
    if (templateSlug) {
      setLoadingTemplate(true);
      fetch(`/api/templates/${templateSlug}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Template not found');
        })
        .then((data) => {
          setTemplate(data);
        })
        .catch((err) => {
          console.error('Failed to fetch template:', err);
          toast.error('Template not found');
          // Remove template param from URL
          router.replace('/dashboard/create');
        })
        .finally(() => {
          setLoadingTemplate(false);
        });
    } else {
      setTemplate(null);
    }
  }, [templateSlug, router]);

  // Remove template and go back to normal mode
  const removeTemplate = () => {
    setTemplate(null);
    router.replace('/dashboard/create');
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        // Only show ready models
        const readyModels = data.filter((m: Model) => m.status === 'Ready');
        setModels(readyModels);
        // Don't auto-select a model, let user choose
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const fetchAIModels = async () => {
    try {
      const response = await fetch('/api/ai-models');
      if (response.ok) {
        const data = await response.json();
        setAiModels(data.models);
        setUserCredits(data.userCredits);
        if (data.models.length > 0) {
          const firstModel = data.models[0];
          setSelectedAiModel(firstModel.id);
          // Set default aspect ratio and resolution from first model
          if (firstModel.capabilities.aspectRatios.length > 0) {
            setAspectRatio(firstModel.capabilities.aspectRatios[0]);
          }
          if (firstModel.capabilities.resolutions.length > 0) {
            setResolution(firstModel.capabilities.resolutions[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      toast.error('Image size exceeds 3MB limit');
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setSelectedImageFile(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
      if (file.size > 3 * 1024 * 1024) {
        e.target.value = '';
      }
    }
  };

  // Paste image from clipboard into reference image (disabled in template mode)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't handle paste when using a template
      if (template) return;

      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleImageFile(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [template]);

  const toggleReferenceOption = (option: string) => {
    setReferenceOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleGenerate = async () => {
    // If using template, we don't need prompt validation
    if (!template) {
      // Prompt is optional if reference image with options is provided
      const hasReferenceWithOptions =
        selectedImageFile && referenceOptions.length > 0;

      if (!prompt.trim() && !hasReferenceWithOptions) {
        setError(
          'Please enter a prompt or upload a reference image with options'
        );
        return;
      }
    }

    // Get selected AI model details
    const aiModel = aiModels.find((m) => m.id === selectedAiModel);
    if (!aiModel) {
      setError('Please select an AI model');
      return;
    }

    // Check credits
    const totalCreditsNeeded = aiModel.creditCost * imageCount;
    if (userCredits < totalCreditsNeeded) {
      setError(
        `Insufficient credits. Need ${totalCreditsNeeded}, have ${userCredits}`
      );
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const formData = new FormData();

      // If using template, send templateSlug instead of prompt/referenceImage
      if (template) {
        formData.append('templateSlug', template.slug);
      } else {
        formData.append('prompt', prompt);
        // Add reference image if uploaded
        if (selectedImageFile) {
          formData.append('referenceImage', selectedImageFile);
          formData.append('referenceOptions', JSON.stringify(referenceOptions));
        }
      }

      // If 'none' is selected, send empty string for no model
      formData.append(
        'modelId',
        selectedModel === 'none' ? '' : selectedModel || ''
      );
      formData.append('aiModelId', selectedAiModel);
      formData.append('aspectRatio', aspectRatio);
      formData.append('resolution', resolution);
      formData.append('imageCount', imageCount.toString());

      // Use the AI model's apiPath to call the correct endpoint
      const response = await fetch(`/api/generate/${aiModel.apiPath}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate images');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.images) {
        console.log('Generated images:', data.images);
        onGenerate?.(data.images);
        // Update credits
        setUserCredits(data.remainingCredits);
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
      {/* Credits Display */}
      <div className='p-4 bg-primary/10 border border-primary/20 rounded-lg'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Available Credits</span>
          <span className='text-2xl font-bold text-primary'>{userCredits}</span>
        </div>
      </div>

      {/* AI Model Selection */}
      <Field>
        <FieldLabel htmlFor='select-ai-model'>AI Model</FieldLabel>
        <Select
          value={selectedAiModel}
          onValueChange={(value) => {
            setSelectedAiModel(value);
            // Update aspect ratio, resolution, and image count to first/valid option when model changes
            const newModel = aiModels.find((m) => m.id === value);
            if (newModel) {
              if (newModel.capabilities.aspectRatios.length > 0) {
                setAspectRatio(newModel.capabilities.aspectRatios[0]);
              }
              if (newModel.capabilities.resolutions.length > 0) {
                setResolution(newModel.capabilities.resolutions[0]);
              }
              // Reset image count if current count exceeds new model's max
              const maxCount = newModel.capabilities.features.maxImageCount;
              if (imageCount > maxCount) {
                setImageCount(1);
              }
            }
          }}
        >
          <SelectTrigger className='bg-background' id='select-ai-model'>
            <SelectValue
              placeholder={
                aiModels.length === 0
                  ? 'No AI models available'
                  : 'Select AI model'
              }
            />
          </SelectTrigger>
          <SelectContent className='bg-background'>
            {aiModels.map((aiModel) => (
              <SelectItem key={aiModel.id} value={aiModel.id}>
                <div className='flex items-center justify-between w-full'>
                  <span>{aiModel.displayName}</span>
                  <span className='text-xs text-muted-foreground ml-2'>
                    {aiModel.creditCost} credits
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAiModel && aiModels.find((m) => m.id === selectedAiModel) && (
          <p className='text-xs text-muted-foreground mt-1'>
            {aiModels.find((m) => m.id === selectedAiModel)?.description}
          </p>
        )}
      </Field>

      {/* Trained Model Selection */}
      <Field>
        <FieldLabel htmlFor='select-model'>
          Your Trained Model (Optional)
        </FieldLabel>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className='bg-background' id='select-model'>
            <SelectValue
              placeholder={
                models.length === 0
                  ? 'No trained models available'
                  : 'Select a trained model or use no model'
              }
            />
          </SelectTrigger>
          <SelectContent className='bg-background'>
            <SelectItem value='none'>No Model (Prompt Only)</SelectItem>
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

      {/* Template Card OR Prompt/Reference Input */}
      {template ? (
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Using Template</label>
          <div className='relative p-4 bg-secondary/30 border border-border rounded-xl mt-3'>
            <div className='flex gap-4 items-start'>
              <div className='relative w-20 h-28 rounded-lg overflow-hidden bg-secondary/50 shrink-0'>
                <img
                  src={template.imageUrl}
                  alt={template.heading}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='font-medium text-base line-clamp-2 mb-1'>
                  {template.heading}
                </h3>
                {/* <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <FileImage className='w-3.5 h-3.5' />
                  <span>Template prompt will be used</span>
                </div> */}
              </div>
            </div>
            <button
              onClick={removeTemplate}
              className='absolute top-2 right-2 p-1.5 bg-background/80 text-foreground rounded-full hover:bg-red-500 hover:text-white transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <p className='text-xs text-muted-foreground'>
            The template's prompt and settings will be used for generation.
          </p>
        </div>
      ) : (
        <>
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
                      Click to upload, drag & drop, or paste
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
                  Select what aspects to copy (face will always be from your
                  model)
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {['pose', 'clothes', 'lighting', 'background'].map(
                    (option) => (
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
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Settings */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Aspect Ratio</label>
          <div className='flex gap-2 flex-wrap mt-3'>
            {availableAspectRatios.map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`flex-1 py-2 text-xs border rounded-md ${
                  aspectRatio === ratio
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'hover:bg-secondary/50'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Resolution</label>
          <div className='flex gap-2 flex-wrap mt-3'>
            {availableResolutions.map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`flex-1 py-2 text-xs border rounded-md capitalize ${
                  resolution === res
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'hover:bg-secondary/50'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor='image-count'>Image Count</FieldLabel>
          <Select
            value={imageCount.toString()}
            onValueChange={(value) => {
              const count = Number(value);
              if (count <= maxImageCount) {
                setImageCount(count);
              }
            }}
          >
            <SelectTrigger className='bg-background' id='image-count'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background'>
              {[1, 2, 4]
                .filter((count) => count <= maxImageCount)
                .map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} {count === 1 ? 'Image' : 'Images'}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={
          isGenerating ||
          loadingTemplate ||
          !selectedAiModel ||
          (!template &&
            !prompt.trim() &&
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
            {selectedAiModel &&
              aiModels.find((m) => m.id === selectedAiModel) && (
                <span className='text-sm'>
                  (
                  {aiModels.find((m) => m.id === selectedAiModel)!.creditCost *
                    imageCount}{' '}
                  credits)
                </span>
              )}
          </>
        )}
      </button>
    </div>
  );
}
