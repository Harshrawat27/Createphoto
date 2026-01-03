"use client";

import { useState } from "react";
import { Upload, ImageIcon, Wand2, RefreshCw, X } from "lucide-react";

export function CreationControls() {
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we'd upload this to a server/storage
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 h-full overflow-y-auto custom-scrollbar">
      {/* Model Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select Model
        </label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="me">My Personal Model (v1)</option>
            <option value="influencer-1">AI Influencer: Sarah</option>
            <option value="generic">No Model (Generic)</option>
        </select>
      </div>

      {/* Prompt Input */}
      <div className="space-y-3">
        <div className="flex justify-between">
            <label className="text-sm font-medium">Prompt</label>
            <span className="text-xs text-muted-foreground">Try "wearing a suit"</span>
        </div>
        <textarea
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Reference Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Reference Image (Optional)</label>
        <p className="text-xs text-muted-foreground mb-2">
            Upload an image to copy a pose or style.
        </p>
        
        {!selectedImage ? (
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 border-border hover:border-primary transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>
        ) : (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                <img src={selectedImage} alt="Reference" className="w-full h-full object-cover" />
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 text-foreground rounded-full hover:bg-red-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs border rounded-md hover:bg-secondary/50 focus:ring-2 focus:ring-primary">1:1</button>
                <button className="flex-1 py-2 text-xs border rounded-md bg-primary/10 border-primary text-primary">9:16</button>
                <button className="flex-1 py-2 text-xs border rounded-md hover:bg-secondary/50 focus:ring-2 focus:ring-primary">16:9</button>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Resolution</label>
            <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs border rounded-md bg-primary/10 border-primary text-primary">2K</button>
                <button className="flex-1 py-2 text-xs border rounded-md hover:bg-secondary/50 focus:ring-2 focus:ring-primary">4K</button>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Image Count</label>
             <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option>1 Image</option>
                <option>2 Images</option>
                <option>4 Images</option>
            </select>
        </div>
      </div>

      {/* Generate Button */}
      <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 mt-auto">
        <Wand2 className="w-5 h-5" />
        Generate Images
      </button>
    </div>
  );
}
