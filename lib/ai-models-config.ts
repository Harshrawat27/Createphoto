export interface AIModelConfig {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  creditCost: number;
  isActive: boolean;
  apiPath: string;
  capabilities: {
    aspectRatios: string[];
    resolutions: string[];
    features: {
      supportsReferenceImage: boolean;
      supportsModelTraining: boolean;
      maxImageCount: number;
    };
  };
}

export const AI_MODELS: Record<string, AIModelConfig> = {
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    provider: 'google',
    displayName: 'Gemini 3 Pro Image',
    description: 'High-quality image generation with advanced capabilities',
    creditCost: 10,
    isActive: true,
    apiPath: 'google/gemini-3-pro-image',
    capabilities: {
      aspectRatios: ['1:1', '9:16', '16:9'],
      resolutions: ['1K', '2K', '4K'],
      features: {
        supportsReferenceImage: true,
        supportsModelTraining: true,
        maxImageCount: 4,
      },
    },
  },
  // 'gemini-flash': {
  //   id: 'gemini-flash',
  //   provider: 'google',
  //   displayName: 'Gemini 2.5 Flash Image',
  //   description: 'Fast image generation with good quality',
  //   creditCost: 5,
  //   isActive: true,
  //   apiPath: 'google/gemini-2.5-flash-image',
  //   capabilities: {
  //     aspectRatios: ['1:1', '9:16', '16:9'],
  //     resolutions: ['1K', '2K'],
  //     features: {
  //       supportsReferenceImage: true,
  //       supportsModelTraining: true,
  //       maxImageCount: 4,
  //     },
  //   },
  // },
  'gpt-image-1.5': {
    id: 'gpt-image-1.5',
    provider: 'openai',
    displayName: 'GPT Image 1.5',
    description:
      "OpenAI's latest image generation model with reference image support",
    creditCost: 12,
    isActive: true,
    apiPath: 'openai/gpt-image-1.5',
    capabilities: {
      aspectRatios: ['1:1', '16:9', '9:16'],
      resolutions: ['1K', '2K', '4K'],
      features: {
        supportsReferenceImage: true,
        supportsModelTraining: true,
        maxImageCount: 1,
      },
    },
  },
  // Add more models here as needed
  // Example for OpenAI:
  // 'dall-e-3': {
  //   id: 'dall-e-3',
  //   provider: 'openai',
  //   displayName: 'DALL-E 3',
  //   description: 'OpenAI\'s most advanced image generation model',
  //   creditCost: 15,
  //   isActive: false,
  //   apiPath: 'openai/dall-e-3',
  //   capabilities: {
  //     aspectRatios: ['1:1', '16:9'],
  //     resolutions: ['1K'],
  //     features: {
  //       supportsReferenceImage: false,
  //       supportsModelTraining: false,
  //       maxImageCount: 1,
  //     },
  //   },
  // },
};

// Helper function to get model by ID
export function getModelById(id: string): AIModelConfig | undefined {
  return AI_MODELS[id];
}

// Helper function to get model by apiPath
export function getModelByApiPath(apiPath: string): AIModelConfig | undefined {
  return Object.values(AI_MODELS).find((model) => model.apiPath === apiPath);
}

// Helper function to get active models
export function getActiveModels(): AIModelConfig[] {
  return Object.values(AI_MODELS).filter((model) => model.isActive);
}

// Helper function to get models by provider
export function getModelsByProvider(provider: string): AIModelConfig[] {
  return Object.values(AI_MODELS).filter(
    (model) => model.provider === provider
  );
}

// Helper function to get all models as array
export function getAllModels(): AIModelConfig[] {
  return Object.values(AI_MODELS);
}
